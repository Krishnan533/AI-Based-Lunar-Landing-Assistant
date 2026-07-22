const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modelVersion: {
      type: String,
      default: 'YOLOv8-Lunar-v1.0 + TF-SafetyEngine',
    },
    inputParameters: {
      confidenceThreshold: { type: Number, default: 0.25 },
      iouThreshold: { type: Number, default: 0.45 },
    },
    executionTimeMs: Number,
    aiServiceStatus: {
      type: String,
      enum: ['SUCCESS', 'PARTIAL_FALLBACK', 'FAILED'],
      default: 'SUCCESS',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prediction', predictionSchema);
