import mongoose from "mongoose";

const legalCaseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: [true, "Case number is required"],
      trim: true,
      maxlength: 100,
    },
    courtName: {
      type: String,
      required: [true, "Court name is required"],
      trim: true,
      maxlength: 200,
    },
    courtLevel: {
      type: String,
      enum: ["TALUK_COURT", "DISTRICT_COURT", "HIGH_COURT", "SUPREME_COURT", "REVENUE_TRIBUNAL", "CONSUMER_COURT"],
    },
    caseType: {
      type: String,
      required: [true, "Case type is required"],
      enum: [
        "TITLE_DISPUTE",
        "BOUNDARY_DISPUTE",
        "PARTITION_SUIT",
        "ENCROACHMENT",
        "INJUNCTION_STAY",
        "LAND_ACQUISITION_CHALLENGE",
        "MORTGAGE_DEFAULT",
        "TENANCY_DISPUTE",
        "REVENUE_APPEAL",
        "SUCCESSION_DISPUTE",
      ],
    },
    disputeType: {
      type: String,
      enum: [
        "OWNERSHIP",
        "BOUNDARY",
        "POSSESSION",
        "ENCROACHMENT",
        "INHERITANCE",
        "MUTATION",
        "TENANCY",
        "ACQUISITION",
        "OTHER",
      ],
    },
    jurisdiction: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    filingDate: {
      type: Date,
      required: [true, "Filing date is required"],
    },
    firstHearingDate: {
      type: Date,
    },
    nextHearingDate: {
      type: Date,
    },
    disposalDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        "PENDING_HEARING",
        "ACTIVE",
        "STAY_ORDER_GRANTED",
        "INTERIM_INJUNCTION",
        "DISPOSED_DECREED",
        "DISPOSED_DISMISSED",
        "APPEAL_PENDING",
        "SETTLED_OUT_OF_COURT",
      ],
      default: "ACTIVE",
    },
    petitionerNames: {
      type: String,
      required: [true, "Petitioner name(s) are required"],
      trim: true,
    },
    respondentNames: {
      type: String,
      required: [true, "Respondent name(s) are required"],
      trim: true,
    },
    parties: [
      {
        owner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Owner",
        },
        role: {
          type: String,
          enum: [
            "PETITIONER",
            "RESPONDENT",
            "APPLICANT",
            "OTHER",
          ],
        },
      },
    ],
    description: {
      type: String,
      required: [true, "Case description is required"],
      trim: true,
    },
    interimOrderDetails: {
      type: String,
      trim: true,
    },
    sourceReferenceUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      validate: {
        validator: function (v) {
          if (!v) return true;
          try {
            const url = new URL(v);
            return url.protocol === "http:" || url.protocol === "https:";
          } catch {
            return false;
          }
        },
        message: "Invalid URL format. Must be a valid http:// or https:// URL",
      },
    },
    cnrNumber: {
      type: String,
      trim: true,
      maxlength: 32,
    },
    parcels: [
      {
        parcel: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Parcel",
        },
        parcelId: {
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
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
legalCaseSchema.index({ courtName: 1, caseNumber: 1 }, { unique: true });
legalCaseSchema.index({ cnrNumber: 1 }, { sparse: true });
legalCaseSchema.index({ status: 1 });
legalCaseSchema.index({ disputeType: 1 });
legalCaseSchema.index({ "parcels.parcel": 1 });

const LegalCase = mongoose.model("LegalCase", legalCaseSchema);

export default LegalCase;
