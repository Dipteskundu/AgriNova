/**
 * Field Mongoose Model
 */

const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  farmerId: {
    type: String,
    required: true,
    index: true,
    default: 'farmer_demo_101'
  },
  fieldName: {
    type: String,
    required: true,
    default: 'Plot 1 - Main Field'
  },
  district: {
    type: String,
    required: true,
    trim: true,
    default: 'Rajshahi'
  },
  upazila: {
    type: String,
    trim: true,
    default: 'Paba'
  },
  area: {
    type: Number,
    required: true,
    min: 0.01,
    default: 2.0
  },
  areaUnit: {
    type: String,
    enum: ['acre', 'decimal', 'hectare', 'bigha'],
    default: 'acre'
  },
  coordinates: {
    latitude: { type: Number, default: 24.3745 },
    longitude: { type: Number, default: 88.6042 }
  },
  soilType: {
    type: String,
    enum: ['Sandy Loam', 'Clay Loam', 'Silty Loam', 'Alluvial', 'Saline Clay', 'Unknown'],
    default: 'Sandy Loam'
  },
  irrigationAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Field', FieldSchema);
