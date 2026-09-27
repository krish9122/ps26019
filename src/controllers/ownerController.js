import mongoose from "mongoose";
import Owner from "../models/Owner.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandlers from "../utils/asyncHandler.js";

/**
 * Whitelist of client-controllable fields for Owner creation and update.
 * System fields (such as _id, createdAt, updatedAt, __v) and parcel-specific
 * fields are strictly excluded.
 */
const ALLOWED_OWNER_FIELDS = [
  "ownerId",
  "ownerType",
  "fullName",
  "fatherOrHusbandName",
  "identifierType",
  "identifierHash",
  "contactPhone",
  "contactEmail",
  "permanentAddress",
  "isActive",
  "metadata",
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
 * without exposing internal database details or sensitive personal identifiers in logs.
 * @param {Error} error
 * @throws {ApiError}
 */
const handleDuplicateKeyError = (error) => {
  if (error.code === 11000) {
    const keyPattern = error.keyPattern || {};
    const keys = Object.keys(keyPattern);

    if (keys.includes("ownerId")) {
      throw new ApiError(409, "An owner with this ownerId already exists");
    }
    if (keys.includes("identifierType") || keys.includes("identifierHash")) {
      throw new ApiError(
        409,
        "An owner with this identifier combination already exists"
      );
    }

    throw new ApiError(409, "Owner with this identifier already exists");
  }
  throw error;
};

/**
 * @desc    Create a new land owner entity
 * @route   POST /api/owners
 * @access  Protected / Officer / Admin
 */
const createOwner = asyncHandlers(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Request body must be a valid JSON object");
  }

  preventMongoOperators(req.body);

  if (!req.body.fullName || typeof req.body.fullName !== "string" || !req.body.fullName.trim()) {
    throw new ApiError(400, "Owner full name is required");
  }

  const ownerData = sanitizePayload(req.body, ALLOWED_OWNER_FIELDS);

  try {
    const owner = await Owner.create(ownerData);

    return res
      .status(201)
      .json(new ApiResponse(201, owner, "Owner created successfully"));
  } catch (error) {
    handleDuplicateKeyError(error);
  }
});

/**
 * @desc    Get all owners with pagination and optional filtering/search
 * @route   GET /api/owners
 * @access  Public / Authenticated
 */
const getAllOwners = asyncHandlers(async (req, res) => {
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

  // Filter by ownerType enum if provided
  if (req.query.ownerType && typeof req.query.ownerType === "string") {
    filter.ownerType = req.query.ownerType.trim().toUpperCase();
  }

  // Filter by active status if explicitly specified
  if (req.query.isActive !== undefined) {
    if (req.query.isActive === "true") {
      filter.isActive = true;
    } else if (req.query.isActive === "false") {
      filter.isActive = false;
    }
  }

  // Search by fullName or ownerId with safe escaped regex
  if (req.query.search && typeof req.query.search === "string") {
    const cleanSearch = req.query.search.trim();
    if (cleanSearch.length > 0) {
      const safeRegex = new RegExp(escapeRegex(cleanSearch), "i");
      filter.$or = [
        { fullName: safeRegex },
        { ownerId: safeRegex },
      ];
    }
  }

  const skip = (page - 1) * limit;

  const [owners, total] = await Promise.all([
    Owner.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Owner.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        owners,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        page,
        limit,
        totalOwners: total,
        totalPages,
      },
      "Owners fetched successfully"
    )
  );
});

/**
 * @desc    Get a single owner by MongoDB ObjectId
 * @route   GET /api/owners/:id
 * @access  Public / Authenticated
 */
const getOwnerById = asyncHandlers(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid owner ID");
  }

  const owner = await Owner.findById(id);

  if (!owner) {
    throw new ApiError(404, "Owner not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, owner, "Owner fetched successfully"));
});

/**
 * @desc    Update an existing owner
 * @route   PUT /api/owners/:id
 * @access  Protected / Officer / Admin
 */
const updateOwner = asyncHandlers(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid owner ID");
  }

  const owner = await Owner.findById(id);

  if (!owner) {
    throw new ApiError(404, "Owner not found");
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Request body must be a valid JSON object");
  }

  preventMongoOperators(req.body);

  const updates = sanitizePayload(req.body, ALLOWED_OWNER_FIELDS);

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  Object.assign(owner, updates);

  try {
    await owner.save();

    return res
      .status(200)
      .json(new ApiResponse(200, owner, "Owner updated successfully"));
  } catch (error) {
    handleDuplicateKeyError(error);
  }
});

/**
 * @desc    Deactivate an owner (soft delete preserving historical ownership records)
 * @route   PATCH /api/owners/:id/deactivate
 * @access  Protected / Admin
 */
const deactivateOwner = asyncHandlers(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid owner ID");
  }

  const owner = await Owner.findById(id);

  if (!owner) {
    throw new ApiError(404, "Owner not found");
  }

  owner.isActive = false;
  await owner.save();

  return res
    .status(200)
    .json(new ApiResponse(200, owner, "Owner deactivated successfully"));
});

export {
  createOwner,
  getAllOwners,
  getOwnerById,
  updateOwner,
  deactivateOwner,
};
