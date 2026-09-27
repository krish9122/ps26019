import mongoose from "mongoose";
import LegalCase from "../models/LegalCase.js";
import Parcel from "../models/Parcel.js";
import Owner from "../models/Owner.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandlers from "../utils/asyncHandler.js";

/**
 * Whitelist of client-controllable fields for LegalCase creation and update.
 * System fields (such as _id, createdAt, updatedAt, __v) and risk/GIS
 * calculations are strictly excluded.
 */
const ALLOWED_LEGAL_CASE_FIELDS = [
  "caseNumber",
  "courtName",
  "courtLevel",
  "caseType",
  "filingDate",
  "firstHearingDate",
  "nextHearingDate",
  "disposalDate",
  "status",
  "petitionerNames",
  "respondentNames",
  "description",
  "interimOrderDetails",
  "sourceReferenceUrl",
  "cnrNumber",
  "disputeType",
  "jurisdiction",
  "parties",
  "parcels",
  "isActive",
];

/**
 * Escapes special regex characters in a search string to prevent ReDoS / regex injection.
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Recursively inspects an object to ensure no keys contain MongoDB query/update operators
 * (e.g., $set, $where, $ne) or dotted path keys, preventing NoSQL operator injection.
 * @param {Object} obj
 */
const preventMongoOperators = (obj) => {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      throw new ApiError(
        400,
        `Invalid field '${key}'. MongoDB operators and dotted paths are not permitted.`
      );
    }
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      preventMongoOperators(value);
    }
  }
};

/**
 * Extracts only whitelisted fields from the request body.
 * @param {Object} body
 * @param {Array<string>} allowedFields
 * @returns {Object}
 */
const sanitizePayload = (body, allowedFields) => {
  if (!body || typeof body !== "object") return {};
  const sanitized = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      sanitized[field] = body[field];
    }
  }
  return sanitized;
};

/**
 * Translates MongoDB code 11000 duplicate key errors to clean ApiError instances
 * without exposing internal database details or raw query parameters.
 * @param {Error} error
 * @throws {ApiError}
 */
const handleDuplicateKeyError = (error) => {
  if (error.code === 11000) {
    const keyPattern = error.keyPattern || {};
    const keys = Object.keys(keyPattern);

    if (keys.includes("cnrNumber")) {
      throw new ApiError(
        409,
        "A legal case with this CNR number already exists"
      );
    }
    if (keys.includes("courtName") || keys.includes("caseNumber")) {
      throw new ApiError(
        409,
        "A legal case with this case number already exists in the specified court"
      );
    }

    throw new ApiError(409, "Legal case with this identifier already exists");
  }
  throw error;
};

/**
 * Validates that all referenced owners in the parties array exist and have valid ObjectIds.
 * @param {Array<Object>} parties
 */
const validateParties = async (parties) => {
  if (!parties) return;
  if (!Array.isArray(parties)) {
    throw new ApiError(400, "Parties must be an array");
  }

  for (const party of parties) {
    if (!party || typeof party !== "object") {
      throw new ApiError(400, "Each party entry must be an object");
    }

    if (party.owner) {
      if (!mongoose.isValidObjectId(party.owner)) {
        throw new ApiError(400, "Invalid owner ID");
      }
      const ownerExists = await Owner.exists({ _id: party.owner });
      if (!ownerExists) {
        throw new ApiError(404, "Owner not found");
      }
    }
  }
};

/**
 * Validates that all referenced parcels exist, have valid ObjectIds, and sets parcelId.
 * Checks for duplicate parcel references within the same case payload.
 * @param {Array<Object>} parcels
 */
const validateParcels = async (parcels) => {
  if (!parcels) return;
  if (!Array.isArray(parcels)) {
    throw new ApiError(400, "Parcels must be an array");
  }

  const seenParcelIds = new Set();

  for (const p of parcels) {
    if (!p || typeof p !== "object") {
      throw new ApiError(400, "Each parcel entry must be an object");
    }

    if (!p.parcel) {
      throw new ApiError(
        400,
        "Parcel reference (parcel ID) is required for each parcel entry"
      );
    }

    if (!mongoose.isValidObjectId(p.parcel)) {
      throw new ApiError(400, "Invalid parcel ID");
    }

    const parcelIdStr = p.parcel.toString();
    if (seenParcelIds.has(parcelIdStr)) {
      throw new ApiError(
        400,
        "Duplicate parcel reference in parcels array"
      );
    }
    seenParcelIds.add(parcelIdStr);

    const parcelDoc = await Parcel.findById(p.parcel);
    if (!parcelDoc) {
      throw new ApiError(404, "Parcel not found");
    }

    // Auto-populate parcelId if omitted
    if (!p.parcelId && parcelDoc.parcelId) {
      p.parcelId = parcelDoc.parcelId;
    }
  }
};

/**
 * Synchronizes a LegalCase reference into a Parcel's embedded legalCases array.
 * If the reference already exists, updates it in place; otherwise appends it.
 * @param {string|mongoose.Types.ObjectId} parcelId
 * @param {Object} legalCase
 * @param {Object} pEntry
 */
const syncParcelWithCase = async (parcelId, legalCase, pEntry) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) return;

  const isStay =
    legalCase.status === "STAY_ORDER_GRANTED" || Boolean(pEntry?.isStayActive);

  const caseData = {
    legalCase: legalCase._id,
    caseNumber: legalCase.caseNumber,
    courtName: legalCase.courtName,
    disputeType: pEntry?.disputeType || "FULL_PARCEL",
    isStayActive: isStay,
    notes: legalCase.description || "",
  };

  const existingIndex = parcel.legalCases.findIndex(
    (c) => c.legalCase && c.legalCase.toString() === legalCase._id.toString()
  );

  if (existingIndex >= 0) {
    Object.assign(parcel.legalCases[existingIndex], caseData);
  } else {
    parcel.legalCases.push(caseData);
  }

  await parcel.save();
};

/**
 * Removes a LegalCase reference from a Parcel's embedded legalCases array.
 * @param {string|mongoose.Types.ObjectId} parcelId
 * @param {string|mongoose.Types.ObjectId} legalCaseId
 */
const removeCaseFromParcel = async (parcelId, legalCaseId) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) return;

  const prevLen = parcel.legalCases.length;
  parcel.legalCases = parcel.legalCases.filter(
    (c) => c.legalCase && c.legalCase.toString() !== legalCaseId.toString()
  );

  if (parcel.legalCases.length !== prevLen) {
    await parcel.save();
  }
};

/**
 * @desc    Create a new legal case and synchronize parcel references
 * @route   POST /api/legal-cases
 * @access  Protected / Officer / Admin
 */
const createLegalCase = asyncHandlers(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Request body must be a valid JSON object");
  }

  preventMongoOperators(req.body);

  const requiredFields = [
    "caseNumber",
    "courtName",
    "caseType",
    "filingDate",
    "petitionerNames",
    "respondentNames",
    "description",
  ];

  for (const field of requiredFields) {
    if (
      req.body[field] === undefined ||
      req.body[field] === null ||
      (typeof req.body[field] === "string" && !req.body[field].trim())
    ) {
      throw new ApiError(400, `${field} is required`);
    }
  }

  const caseData = sanitizePayload(req.body, ALLOWED_LEGAL_CASE_FIELDS);

  if (caseData.parties) {
    await validateParties(caseData.parties);
  }

  if (caseData.parcels) {
    await validateParcels(caseData.parcels);
  }

  try {
    const legalCase = await LegalCase.create(caseData);

    // Synchronize parcel legalCases references
    if (Array.isArray(legalCase.parcels) && legalCase.parcels.length > 0) {
      for (const p of legalCase.parcels) {
        if (p.parcel) {
          await syncParcelWithCase(p.parcel, legalCase, p);
        }
      }
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, legalCase, "Legal case created successfully")
      );
  } catch (error) {
    handleDuplicateKeyError(error);
  }
});

/**
 * @desc    Get all legal cases with pagination, filters, search, and safe population
 * @route   GET /api/legal-cases
 * @access  Public / Authenticated
 */
const getAllLegalCases = asyncHandlers(async (req, res) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = 20;
  } else if (limit > 100) {
    limit = 100;
  }

  const filter = {};

  if (req.query.status && typeof req.query.status === "string") {
    filter.status = req.query.status.trim().toUpperCase();
  }

  if (req.query.caseType && typeof req.query.caseType === "string") {
    filter.caseType = req.query.caseType.trim().toUpperCase();
  }

  if (req.query.courtLevel && typeof req.query.courtLevel === "string") {
    filter.courtLevel = req.query.courtLevel.trim().toUpperCase();
  }

  if (req.query.disputeType && typeof req.query.disputeType === "string") {
    filter.disputeType = req.query.disputeType.trim().toUpperCase();
  }

  if (req.query.isActive !== undefined) {
    if (req.query.isActive === "true") {
      filter.isActive = true;
    } else if (req.query.isActive === "false") {
      filter.isActive = false;
    }
  }

  if (req.query.courtName && typeof req.query.courtName === "string") {
    const cleanCourtName = req.query.courtName.trim();
    if (cleanCourtName.length > 0) {
      filter.courtName = new RegExp(escapeRegex(cleanCourtName), "i");
    }
  }

  // Safe search across caseNumber, cnrNumber, courtName, petitionerNames, respondentNames
  if (req.query.search && typeof req.query.search === "string") {
    const cleanSearch = req.query.search.trim();
    if (cleanSearch.length > 0) {
      const safeRegex = new RegExp(escapeRegex(cleanSearch), "i");
      filter.$or = [
        { caseNumber: safeRegex },
        { cnrNumber: safeRegex },
        { courtName: safeRegex },
        { petitionerNames: safeRegex },
        { respondentNames: safeRegex },
      ];
    }
  }

  const skip = (page - 1) * limit;

  const [legalCases, total] = await Promise.all([
    LegalCase.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "parties.owner",
        select: "ownerId fullName ownerType",
      })
      .populate({
        path: "parcels.parcel",
        select:
          "parcelId surveyNumber subDivisionNumber state district village recordedAreaSqm status",
      }),
    LegalCase.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        legalCases,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      "Legal cases fetched successfully"
    )
  );
});

/**
 * @desc    Get a single legal case by MongoDB ObjectId with populated references
 * @route   GET /api/legal-cases/:id
 * @access  Public / Authenticated
 */
const getLegalCaseById = asyncHandlers(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid legal case ID");
  }

  const legalCase = await LegalCase.findById(id)
    .populate({
      path: "parties.owner",
      select: "ownerId fullName ownerType",
    })
    .populate({
      path: "parcels.parcel",
      select:
        "parcelId surveyNumber subDivisionNumber state district village recordedAreaSqm status",
    });

  if (!legalCase) {
    throw new ApiError(404, "Legal case not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, legalCase, "Legal case fetched successfully"));
});

/**
 * @desc    Update an existing legal case and synchronize parcel references
 * @route   PUT /api/legal-cases/:id
 * @access  Protected / Officer / Admin
 */
const updateLegalCase = asyncHandlers(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid legal case ID");
  }

  const legalCase = await LegalCase.findById(id);

  if (!legalCase) {
    throw new ApiError(404, "Legal case not found");
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Request body must be a valid JSON object");
  }

  preventMongoOperators(req.body);

  const updates = sanitizePayload(req.body, ALLOWED_LEGAL_CASE_FIELDS);

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  if (updates.parties) {
    await validateParties(updates.parties);
  }

  if (updates.parcels) {
    await validateParcels(updates.parcels);
  }

  // Track previous state for synchronization
  const oldParcels = legalCase.parcels ? [...legalCase.parcels] : [];
  const parcelsChanged = Object.prototype.hasOwnProperty.call(
    updates,
    "parcels"
  );
  const statusChanged =
    updates.status !== undefined && updates.status !== legalCase.status;
  const courtInfoChanged =
    (updates.caseNumber !== undefined &&
      updates.caseNumber !== legalCase.caseNumber) ||
    (updates.courtName !== undefined &&
      updates.courtName !== legalCase.courtName) ||
    (updates.description !== undefined &&
      updates.description !== legalCase.description);

  Object.assign(legalCase, updates);

  try {
    await legalCase.save();

    // Synchronize parcel associations
    if (parcelsChanged) {
      const oldIds = oldParcels
        .filter((p) => p.parcel)
        .map((p) => p.parcel.toString());
      const newIds = legalCase.parcels
        .filter((p) => p.parcel)
        .map((p) => p.parcel.toString());

      // Remove stale parcel references
      const staleIds = oldIds.filter((oldId) => !newIds.includes(oldId));
      for (const staleId of staleIds) {
        await removeCaseFromParcel(staleId, legalCase._id);
      }

      // Add/update active parcel references
      for (const p of legalCase.parcels) {
        if (p.parcel) {
          await syncParcelWithCase(p.parcel, legalCase, p);
        }
      }
    } else if (statusChanged || courtInfoChanged) {
      // Re-sync existing parcels with updated case status or court info
      if (Array.isArray(legalCase.parcels)) {
        for (const p of legalCase.parcels) {
          if (p.parcel) {
            await syncParcelWithCase(p.parcel, legalCase, p);
          }
        }
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, legalCase, "Legal case updated successfully")
      );
  } catch (error) {
    handleDuplicateKeyError(error);
  }
});

/**
 * @desc    Deactivate a legal case (soft delete preserving historical legal records)
 * @route   PATCH /api/legal-cases/:id/deactivate
 * @access  Protected / Admin
 */
const deactivateLegalCase = asyncHandlers(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid legal case ID");
  }

  const legalCase = await LegalCase.findById(id);

  if (!legalCase) {
    throw new ApiError(404, "Legal case not found");
  }

  legalCase.isActive = false;
  await legalCase.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        legalCase,
        "Legal case deactivated successfully"
      )
    );
});

export {
  createLegalCase,
  getAllLegalCases,
  getLegalCaseById,
  updateLegalCase,
  deactivateLegalCase,
};
