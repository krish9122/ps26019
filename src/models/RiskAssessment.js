import mongoose from "mongoose";

// Indicator sub-schema explaining WHY the parcel received its risk score
const riskIndicatorSubSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Indicator type/code is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Indicator name is required"],
      trim: true,
    },
    severity: {
      type: String,
      enum: ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: [true, "Indicator description is required"],
      trim: true,
    },
    evidence: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: true }
);

const riskAssessmentSchema = new mongoose.Schema(
  {
    parcel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parcel",
      required: [true, "Parcel reference is required"],
    },
    parcelId: {
      type: String,
      required: [true, "Parcel ID string is required"],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, "Risk score is required"],
      min: [0, "Risk score cannot be less than 0"],
      max: [100, "Risk score cannot exceed 100"],
    },
    riskLevel: {
      type: String,
      required: [true, "Risk level is required"],
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
    indicators: [riskIndicatorSubSchema],
    ruleBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    summaryText: {
      type: String,
      required: [true, "Risk summary text is required"],
      trim: true,
    },
    isCurrent: {
      type: Boolean,
      default: true,
    },
    engineVersion: {
      type: String,
      default: "v1.0-deterministic",
    },
    assessedBy: {
      type: String,
      default: "RULE_ENGINE",
    },
    assessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
riskAssessmentSchema.index({ parcel: 1, isCurrent: 1 });
riskAssessmentSchema.index({ parcelId: 1, isCurrent: 1 });
riskAssessmentSchema.index({ riskLevel: 1, score: -1 });

// Automatically demote older assessments for the same parcel when a new one is set as current
riskAssessmentSchema.pre("save", async function () {
  if (this.isCurrent) {
    await this.constructor.updateMany(
      {
        parcel: this.parcel,
        _id: { $ne: this._id },
        isCurrent: true,
      },
      {
        $set: { isCurrent: false },
      }
    );
  }
});

const RiskAssessment = mongoose.model("RiskAssessment", riskAssessmentSchema);

export default RiskAssessment;
