import mongoose from "mongoose";
import Parcel from "../models/Parcel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandlers from "../utils/asyncHandler.js";

/**
 * Whitelist of client-controllable fields for parcel creation and update.
 * System and derived fields (such as _id, createdAt, updatedAt, gisAreaSqm,
 * areaDiscrepancySqm, areaDiscrepancyPercentage, __v) are explicitly excluded.
 */
const ALLOWED_PARCEL_FIELDS = [
  "parcelId",
  "ulpin",
  "surveyNumber",
  "subDivisionNumber",
  "recordedAreaSqm",
  "areaUnit",
  "landType",
  "landUseCategory",
  "state",
  "district",
  "subDistrict",
  "village",
  "pincode",
  "centroid",
  "geometry",
  "owners",
  "legalCases",
  "status",
  "notes",
  "metadata",
];

/**
 * Rejects any request payload containing MongoDB operators (e.g., $set, $push, $where)
 * as top-level keys to prevent NoSQL operator injection.
 * @param {Object} obj
 */
const preventMongoOperators = (obj) => {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$")) {
      throw new ApiError(
        400,
        `Invalid field '${key}'. MongoDB operators are not permitted.`
      );
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
 * Validates that a single coordinate point is [longitude, latitude]
 * with numeric values and within valid geographic bounds.
 * @param {Array<number>} point
 */
const validateCoordinatePoint = (point) => {
  if (
    !Array.isArray(point) ||
    point.length < 2 ||
    typeof point[0] !== "number" ||
    isNaN(point[0]) ||
    typeof point[1] !== "number" ||
    isNaN(point[1]) ||
    point[0] < -180 ||
    point[0] > 180 ||
    point[1] < -90 ||
    point[1] > 90
  ) {
    throw new ApiError(
      400,
      "Invalid coordinate point. Coordinates must be [longitude, latitude] with longitude between -180 and 180, and latitude between -90 and 90"
    );
  }
};

/**
 * Validates a GeoJSON LinearRing:
 * - Must be an array with at least 4 positions
 * - Every position must be a valid [longitude, latitude] point
 * - Must be closed (first coordinate === last coordinate)
 * @param {Array<Array<number>>} ring
 * @param {string} ringName
 */
const validateLinearRing = (ring, ringName = "Linear ring") => {
  if (!Array.isArray(ring) || ring.length < 4) {
    throw new ApiError(
      400,
      `${ringName} must contain at least 4 coordinate positions`
    );
  }

  for (const point of ring) {
    validateCoordinatePoint(point);
  }

  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    throw new ApiError(
      400,
      `${ringName} must be closed (the first and last coordinates must be identical)`
    );
  }
};

/**
 * Validates GeoJSON geometry structure if provided.
 * Ensures type is 'Polygon' or 'MultiPolygon' and coordinates are structured properly
 * with valid closed linear rings and [longitude, latitude] bounds.
 * @param {Object} geometry
 */
const validateGeoJsonGeometry = (geometry) => {
  if (geometry === null || geometry === undefined) return;

  if (typeof geometry !== "object" || Array.isArray(geometry)) {
    throw new ApiError(400, "Geometry must be a valid GeoJSON object");
  }

  if (!["Polygon", "MultiPolygon"].includes(geometry.type)) {
    throw new ApiError(
      400,
      "Geometry type must be either 'Polygon' or 'MultiPolygon'"
    );
  }

  if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
    throw new ApiError(
      400,
      "Geometry coordinates must be a non-empty array"
    );
  }

  if (geometry.type === "Polygon") {
    if (!Array.isArray(geometry.coordinates[0])) {
      throw new ApiError(
        400,
        "Polygon coordinates must contain an array of linear rings"
      );
    }

    geometry.coordinates.forEach((ring, index) => {
      const name =
        index === 0 ? "Polygon outer ring" : `Polygon interior ring ${index}`;
      validateLinearRing(ring, name);
    });
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygonCoords, polyIndex) => {
      if (!Array.isArray(polygonCoords) || polygonCoords.length === 0) {
        throw new ApiError(
          400,
          `MultiPolygon polygon at index ${polyIndex} must contain a valid array of rings`
        );
      }

      polygonCoords.forEach((ring, ringIndex) => {
        const name =
          ringIndex === 0
            ? `MultiPolygon polygon ${polyIndex} outer ring`
            : `MultiPolygon polygon ${polyIndex} interior ring ${ringIndex}`;
        validateLinearRing(ring, name);
      });
    });
  }
};

/**
 * @desc    Create a new land parcel
 * @route   POST /api/parcels
 * @access  Protected / Admin / Surveyor
 */
const createParcel = asyncHandlers(async (req, res) => {
  preventMongoOperators(req.body);

  if (req.body.geometry) {
    validateGeoJsonGeometry(req.body.geometry);
  }

  const parcelData = sanitizePayload(req.body, ALLOWED_PARCEL_FIELDS);

  try {
    const parcel = await Parcel.create(parcelData);

    return res
      .status(201)
      .json(new ApiResponse(201, parcel, "Parcel created successfully"));
  } catch (error) {
    if (error.code === 11000) {
      console.error(
        "Duplicate key error creating parcel:",
        error.keyValue || error.message
      );
      throw new ApiError(409, "Parcel with this identifier already exists");
    }
    throw error;
  }
});

/**
 * @desc    Get all parcels with pagination
 * @route   GET /api/parcels
 * @access  Public / Authenticated
 */
const getAllParcels = asyncHandlers(async (req, res) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = 10;
  } else if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;

  const [parcels, total] = await Promise.all([
    Parcel.find().skip(skip).limit(limit),
    Parcel.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        parcels,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      "Parcels fetched successfully"
    )
  );
});

/**
 * @desc    Get a single parcel by MongoDB ObjectId
 * @route   GET /api/parcels/:id
 * @access  Public / Authenticated
 */
const getParcelById = asyncHandlers(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid parcel ID");
  }

  const parcel = await Parcel.findById(id);

  if (!parcel) {
    throw new ApiError(404, "Parcel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, parcel, "Parcel fetched successfully"));
});

/**
 * @desc    Update an existing parcel by MongoDB ObjectId
 * @route   PUT /api/parcels/:id
 * @access  Protected / Admin / Surveyor
 */
const updateParcel = asyncHandlers(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid parcel ID");
  }

  const parcel = await Parcel.findById(id);

  if (!parcel) {
    throw new ApiError(404, "Parcel not found");
  }

  preventMongoOperators(req.body);

  if (req.body.geometry) {
    validateGeoJsonGeometry(req.body.geometry);
  }

  const updates = sanitizePayload(req.body, ALLOWED_PARCEL_FIELDS);

  // If geometry is updated without specifying centroid, reset centroid so pre("validate") recomputes it
  if (updates.geometry && !updates.centroid) {
    parcel.centroid = undefined;
  }

  Object.assign(parcel, updates);

  try {
    await parcel.save();

    return res
      .status(200)
      .json(new ApiResponse(200, parcel, "Parcel updated successfully"));
  } catch (error) {
    if (error.code === 11000) {
      console.error(
        "Duplicate key error updating parcel:",
        error.keyValue || error.message
      );
      throw new ApiError(409, "Parcel with this identifier already exists");
    }
    throw error;
  }
});

/**
 * @desc    Delete a parcel by MongoDB ObjectId
 * @route   DELETE /api/parcels/:id
 * @access  Protected / Admin
 */
const deleteParcel = asyncHandlers(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid parcel ID");
  }

  const parcel = await Parcel.findByIdAndDelete(id);

  if (!parcel) {
    throw new ApiError(404, "Parcel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Parcel deleted successfully"));
});

export {
  createParcel,
  getAllParcels,
  getParcelById,
  updateParcel,
  deleteParcel,
};
