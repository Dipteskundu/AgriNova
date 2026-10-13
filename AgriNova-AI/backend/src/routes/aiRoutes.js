/**
 * AgriNova AI Routes
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateFarmer } = require('../middleware/authMiddleware');

// Unified Farm Recommendation (Master Endpoint)
router.post('/farm-recommendation', authenticateFarmer, (req, res) => aiController.getFarmRecommendation(req, res));

// Direct ML Crop Recommendation
router.post('/crop-recommendation', authenticateFarmer, (req, res) => aiController.getCropRecommendation(req, res));

// BARC FRG-2024 Fertilizer Recommendation
router.post('/fertilizer-recommendation', authenticateFarmer, (req, res) => aiController.getFertilizerRecommendation(req, res));

// Farmer Recommendation History Audit
router.get('/history', authenticateFarmer, (req, res) => aiController.getRecommendationHistory(req, res));

module.exports = router;
