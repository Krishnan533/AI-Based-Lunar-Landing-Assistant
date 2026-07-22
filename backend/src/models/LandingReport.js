const mongoose = require('mongoose');

const landingReportSchema = new mongoose.Schema(
  {
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
      required: true,
    },
    detectionResultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DetectionResult',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportTitle: {
      type: String,
      default: 'Lunar Surface Landing Assessment',
    },
    terrainSafetyScore: {
      type: Number,
      required: true,
    },
    hazardCount: {
      craters: { type: Number, default: 0 },
      boulders: { type: Number, default: 0 },
      slopes: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    recommendedLandingCoordinates: {
      centerX: Number,
      centerY: Number,
      radius: Number,
      confidence: Number,
    },
    environmentalAssessment: {
      roughnessIndex: Number,
      slopeGradientAvg: Number,
      lightingCondition: String,
    },
    recommendationStatus: {
      type: String,
      enum: ['CLEARED_FOR_LANDING', 'PROCEED_WITH_CAUTION', 'LANDING_ABORTED'],
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LandingReport', landingReportSchema);
