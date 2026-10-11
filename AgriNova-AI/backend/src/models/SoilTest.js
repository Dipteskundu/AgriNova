/**
 * SoilTest Mongoose Model
 */

const mongoose = require('mongoose');

const SoilTestSchema = new mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: false
  },
  farmerId: {
    type: String,
    required: true,
    index: true,
    default: 'farmer_demo_101'
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  labName: {
    type: String,
    default: 'SRDI (Soil Resource Development Institute)'
  },
  ph: {
    type: Number,
    min: 3.0,
    max: 10.0,
    default: 6.5
  },
  organicMatter: {
    type: Number,
    min: 0.0,
    max: 20.0
  },
  nitrogenPct: {
    type: Number,
    min: 0.0,
    max: 2.0
  },
  phosphorusPpm: {
    type: Number,
    min: 0.0,
    max: 200.0
  },
  potassiumMeq: {
    type: Number,
    min: 0.0,
    max: 5.0
  },
  sulfurPpm: {
    type: Number,
    min: 0.0,
    max: 100.0
  },
  zincPpm: {
    type: Number,
    min: 0.0,
    max: 20.0
  },
  boronPpm: {
    type: Number,
    min: 0.0,
    max: 10.0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SoilTest', SoilTestSchema);
