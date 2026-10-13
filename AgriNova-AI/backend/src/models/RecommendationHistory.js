/**
 * RecommendationHistory Mongoose Model
 * Preserves immutable audit trail of farm recommendations for reproducibility.
 */

const mongoose = require('mongoose');

const RecommendationHistorySchema = new mongoose.Schema({
  farmerId: {
    type: String,
    required: true,
    index: true,
    default: 'farmer_demo_101'
  },
  fieldId: {
    type: String,
    default: null
  },
  inputSnapshot: {
    field: {
      district: String,
      upazila: String,
      area: Number,
      areaUnit: String,
      latitude: Number,
      longitude: Number
    },
    soil: {
      ph: Number,
      organicMatter: Number,
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      sulfur: Number,
      zinc: Number,
      boron: Number
    },
    season: String,
    irrigationAvailable: Boolean,
    cropStage: String
  },
  recommendationOutput: {
    primaryCrop: {
      canonicalName: String,
      banglaName: String,
      modelConfidenceScore: Number,
      category: String,
      barcSuitability: mongoose.Schema.Types.Mixed,
      seasonCompatibility: mongoose.Schema.Types.Mixed,
      whyRecommended: [String]
    },
    alternatives: [mongoose.Schema.Types.Mixed],
    fertilizerPlan: mongoose.Schema.Types.Mixed,
    weatherSnapshot: mongoose.Schema.Types.Mixed,
    weatherAlerts: [mongoose.Schema.Types.Mixed],
    actions: [String],
    warnings: [String],
    sources: [mongoose.Schema.Types.Mixed],
    disclaimer: String
  },
  modelMetadata: {
    modelName: String,
    modelVersion: String,
    dataset: String,
    datasetVersion: String,
    trainedAt: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('RecommendationHistory', RecommendationHistorySchema);
