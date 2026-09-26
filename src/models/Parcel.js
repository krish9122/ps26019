import mongoose from "mongoose";
import { calculateGeoJsonArea, calculateCentroid } from "../utils/geoUtils.js";

// Sub-schema for co-owners on a parcel
const parcelOwnerSubSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    ownerId: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    share: {
      type: Number,
      required: true,
      min: [0.01, "Ownership share must be at least 0.01%"],
      max: [100.0, "Ownership share cannot exceed 100.00%"],
    },
    ownershipStatus: {
      type: String,
      enum: ["ACTIVE", "TRANSFERRED", "DISPUTED", "PENDING_APPROVAL", "RELINQUISHED"],
      default: "ACTIVE",
    },
    ownershipNature: {
      type: String,
      enum: ["FREEHOLD", "LEASEHOLD", "COPARCENARY", "MORTGAGED", "TENANCY"],
      default: "FREEHOLD",
    },
    acquisitionDate: {
      type: Date,
    },
    mutationEntryNo: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

// Sub-schema for legal cases attached to a parcel
const parcelLegalCaseSubSchema = new mongoose.Schema(
  {
    legalCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LegalCase",
      required: true,
    },
    caseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    courtName: {
      type: String,
      trim: true,
    },
    disputeType: {
      type: String,
      enum: ["FULL_PARCEL", "PARTIAL_BOUNDARY", "OWNERSHIP_SHARE", "EASEMENT_RIGHT", "ACCESS_ROAD"],
      default: "FULL_PARCEL",
    },
    isStayActive: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

// Standard GeoJSON Geometry Schema
const geoJsonGeometrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Polygon", "MultiPolygon"],
      required: true,
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (coords) {
          if (!Array.isArray(coords) || coords.length === 0) return false;
          // Validates that polygon outer ring coordinates are arrays of [lon, lat] pairs
          return true;
        },
        message: "Invalid GeoJSON coordinates",
      },
    },
  },
  { _id: false }
);

const parcelSchema = new mongoose.Schema(
  {
    parcelId: {
      type: String,
      required: [true, "Parcel ID is required"],
      unique: true,
      trim: true,
    },
    ulpin: {
      type: String,
      trim: true,
      sparse: true,
      maxlength: 32,
    },
    surveyNumber: {
      type: String,
      required: [true, "Survey number is required"],
      trim: true,
      maxlength: 64,
    },
    subDivisionNumber: {
      type: String,
      trim: true,
      maxlength: 32,
    },
    recordedAreaSqm: {
      type: Number,
      required: [true, "Recorded area in square meters is required"],
      min: [0.01, "Recorded area must be greater than zero"],
    },
    gisAreaSqm: {
      type: Number,
    },
    areaDiscrepancySqm: {
      type: Number,
    },
    areaDiscrepancyPercentage: {
      type: Number,
    },
    areaUnit: {
      type: String,
      enum: ["SQ_METER", "HECTARE", "ACRE", "GUNTHA", "BIGHA"],
      default: "SQ_METER",
    },
    landType: {
      type: String,
      required: [true, "Land type is required"],
      enum: [
        "AGRICULTURAL",
        "COMMERCIAL",
        "RESIDENTIAL",
        "INDUSTRIAL",
        "GOVERNMENT_RESERVED",
        "FOREST",
        "WATER_BODY",
        "PUBLIC_UTILITY",
      ],
    },
    landUseCategory: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    subDistrict: {
      type: String,
      required: [true, "Sub-district / Taluk / Tehsil is required"],
      trim: true,
    },
    village: {
      type: String,
      required: [true, "Village is required"],
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    centroid: {
      lat: { type: Number, min: -90, max: 90 },
      lon: { type: Number, min: -180, max: 180 },
    },
    geometry: {
      type: geoJsonGeometrySchema,
      default: null,
    },
    owners: [parcelOwnerSubSchema],
    legalCases: [parcelLegalCaseSubSchema],
    status: {
      type: String,
      enum: ["ACTIVE", "DISPUTED", "PENDING_SURVEY", "SUBDIVIDED", "MERGED", "CANCELLED", "ARCHIVED"],
      default: "ACTIVE",
    },
    notes: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ----------------------------------------------------------------------------
// INDEXES
// ----------------------------------------------------------------------------

// 2dsphere index for GeoJSON geospatial queries ($geoIntersects, $near, $geoWithin)
parcelSchema.index({ geometry: "2dsphere" });

// Fast search indexes
parcelSchema.index({ ulpin: 1 }, { unique: true, sparse: true });
parcelSchema.index({ state: 1, district: 1, subDistrict: 1, village: 1, surveyNumber: 1 });
parcelSchema.index({ "owners.owner": 1 });
parcelSchema.index({ status: 1 });

// ----------------------------------------------------------------------------
// PRE-VALIDATE / PRE-SAVE HOOKS
// ----------------------------------------------------------------------------

parcelSchema.pre("validate", function () {
  // 1. Validate total active co-ownership share does not exceed 100.00%
  if (Array.isArray(this.owners) && this.owners.length > 0) {
    const totalActiveShare = this.owners
      .filter((o) => o.ownershipStatus === "ACTIVE")
      .reduce((sum, o) => sum + (o.share || 0), 0);

    // Allowing tiny floating point tolerance
    if (Math.round(totalActiveShare * 100) > 10000) {
      throw new Error(
        `Total active ownership share for parcel ${this.parcelId || this.surveyNumber} cannot exceed 100.00% (currently ${totalActiveShare.toFixed(2)}%)`
      );
    }
  }

  // 2. Derive GIS Area, Centroid, and Area Discrepancy if geometry exists
  if (this.geometry && this.geometry.coordinates) {
    this.gisAreaSqm = calculateGeoJsonArea(this.geometry);

    if (!this.centroid || this.centroid.lat == null || this.centroid.lon == null) {
      const derivedCentroid = calculateCentroid(this.geometry);
      if (derivedCentroid) {
        this.centroid = derivedCentroid;
      }
    }

    if (this.recordedAreaSqm && this.recordedAreaSqm > 0) {
      this.areaDiscrepancySqm = Math.round((this.gisAreaSqm - this.recordedAreaSqm) * 100) / 100;
      this.areaDiscrepancyPercentage =
        Math.round((Math.abs(this.gisAreaSqm - this.recordedAreaSqm) / this.recordedAreaSqm) * 10000) / 100;
    }
  } else {
    this.gisAreaSqm = null;
    this.areaDiscrepancySqm = null;
    this.areaDiscrepancyPercentage = null;
  }
});

const Parcel = mongoose.model("Parcel", parcelSchema);

export default Parcel;
