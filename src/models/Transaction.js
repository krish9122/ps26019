import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    parcel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parcel",
      required: [true, "Parcel reference is required"],
    },
    parcelId: {
      type: String,
      trim: true,
    },
    previousOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      default: null, // Null for government allotments, grants, or primary registration
    },
    previousOwnerName: {
      type: String,
      trim: true,
    },
    newOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: [true, "New owner reference is required"],
    },
    newOwnerName: {
      type: String,
      trim: true,
    },
    transactionType: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: [
        "SALE_DEED",
        "GIFT_DEED",
        "INHERITANCE",
        "PARTITION_DEED",
        "MORTGAGE",
        "RELEASE_DEED",
        "GOVERNMENT_ALLOTMENT",
        "ACQUISITION",
        "RECTIFICATION_DEED",
      ],
    },
    transactionDate: {
      type: Date,
      required: [true, "Transaction date is required"],
    },
    registrationNumber: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    sroOffice: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    considerationAmount: {
      type: Number,
      min: [0, "Consideration amount cannot be negative"],
    },
    marketGuidelineValue: {
      type: Number,
      min: [0, "Market guideline value cannot be negative"],
    },
    status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "REGISTERED", "DISPUTED", "CANCELLED", "SUSPICIOUS", "REJECTED"],
      default: "REGISTERED",
    },
    deedDocumentUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ registrationNumber: 1 }, { unique: true, sparse: true });
transactionSchema.index({ parcel: 1 });
transactionSchema.index({ parcelId: 1 });
transactionSchema.index({ previousOwner: 1, newOwner: 1 });
transactionSchema.index({ transactionDate: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
