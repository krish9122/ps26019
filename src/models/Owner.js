import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    ownerType: {
      type: String,
      enum: ["INDIVIDUAL", "JOINT", "COMPANY", "GOVERNMENT", "TRUST", "COMMUNITY"],
      default: "INDIVIDUAL",
    },
    fullName: {
      type: String,
      required: [true, "Owner full name is required"],
      trim: true,
      maxlength: 200,
    },
    fatherOrHusbandName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    identifierType: {
      type: String,
      enum: ["AADHAAR_HASH", "PAN", "PASSPORT", "VOTER_ID", "CIN", "REGISTRATION_NO", "OTHER"],
    },
    identifierHash: {
      type: String,
      trim: true,
      maxlength: 128,
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    permanentAddress: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Indexes
ownerSchema.index(
  { identifierType: 1, identifierHash: 1 },
  { unique: true, sparse: true }
);
ownerSchema.index({ fullName: 1 });

const Owner = mongoose.model("Owner", ownerSchema);

export default Owner;
