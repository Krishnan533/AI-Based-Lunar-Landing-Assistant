const mongoose = require('mongoose');

const detectionResultSchema = new mongoose.Schema(
  {
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
      required: true,
    },
    hazards: [
      {
        label: { type: String, required: true }, // e.g. 'crater', 'boulder', 'steep_slope', 'shadow'
        confidence: { type: Number, required: true },
        bbox: {
          x1: Number,
          y1: Number,
          x2: Number,
          y2: Number,
        },
        area: Number,
      },
    ],
    safeZones: [
      {
        bbox: {
          x1: Number,
          y1: Number,
          x2: Number,
          y2: Number,
        },
        score: Number,
        suitability: String, // 'Optimal', 'Acceptable', 'Suboptimal'
      },
    ],
    overallSafetyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['CRITICAL_HAZARD', 'MODERATE_RISK', 'LOW_RISK', 'OPTIMAL_LANDING'],
      default: 'MODERATE_RISK',
    },
    annotatedImagePath: String,
    executionTimeMs: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DetectionResult', detectionResultSchema);
