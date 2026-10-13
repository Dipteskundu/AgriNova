/**
 * AgriNova AI Controller
 * Orchestrates Node.js request validation, Python AI service invocation,
 * MongoDB audit persistence, and Farmer Portal frontend contract formatting.
 */

const aiService = require('../services/aiService');
const RecommendationHistory = require('../models/RecommendationHistory');
const Field = require('../models/Field');

class AIController {
  /**
   * POST /api/ai/farm-recommendation
   * Unified master recommendation endpoint.
   */
  async getFarmRecommendation(req, res) {
    try {
      const farmerId = req.user?.id || 'farmer_demo_101';
      const { field, soil, season, irrigation_available, crop_stage } = req.body;

      if (!field || !field.district) {
        return res.status(400).json({
          success: false,
          error: 'Field information with a valid Bangladesh district is required.'
        });
      }

      const payload = {
        field: {
          district: field.district,
          upazila: field.upazila || null,
          area: Number(field.area) || 1.0,
          area_unit: field.area_unit || 'acre',
          latitude: field.latitude ? Number(field.latitude) : null,
          longitude: field.longitude ? Number(field.longitude) : null
        },
        soil: soil || null,
        season: season || null,
        irrigation_available: irrigation_available !== undefined ? Boolean(irrigation_available) : true,
        crop_stage: crop_stage || null
      };

      // 1. Invoke Python FastAPI Microservice
      const aiResponse = await aiService.recommendFarm(payload);

      // 2. Persist Snapshot to MongoDB Atlas (if connection alive)
      try {
        await RecommendationHistory.create({
          farmerId,
          fieldId: field.field_id || null,
          inputSnapshot: payload,
          recommendationOutput: {
            primaryCrop: {
              canonicalName: aiResponse.primary_crop.canonical_name,
              banglaName: aiResponse.primary_crop.bangla_name,
              modelConfidenceScore: aiResponse.primary_crop.model_confidence_score,
              category: aiResponse.primary_crop.category,
              barcSuitability: aiResponse.primary_crop.barc_suitability,
              seasonCompatibility: aiResponse.primary_crop.season_compatibility,
              whyRecommended: aiResponse.primary_crop.why_recommended
            },
            alternatives: aiResponse.alternatives,
            fertilizerPlan: aiResponse.fertilizer_plan,
            weatherSnapshot: aiResponse.weather,
            weatherAlerts: aiResponse.weather_alerts,
            actions: aiResponse.actions,
            warnings: aiResponse.warnings,
            sources: aiResponse.sources,
            disclaimer: aiResponse.disclaimer
          },
          modelMetadata: {
            modelName: aiResponse.model_information?.model_name,
            modelVersion: aiResponse.model_information?.model_version,
            dataset: aiResponse.model_information?.dataset,
            datasetVersion: aiResponse.model_information?.dataset_version,
            trainedAt: aiResponse.model_information?.trained_at
          }
        });
      } catch (dbErr) {
        console.warn(`[Audit History] MongoDB persistence notice: ${dbErr.message}`);
      }

      // 3. Return structured response contract for Mohiuddin's Farmer Portal
      return res.status(200).json({
        success: true,
        recommendation: aiResponse
      });

    } catch (error) {
      console.error('[AI Controller] Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to process farm recommendation.'
      });
    }
  }

  /**
   * POST /api/ai/crop-recommendation
   */
  async getCropRecommendation(req, res) {
    try {
      const { district, season, area, top_k } = req.body;
      if (!district) {
        return res.status(400).json({ success: false, error: 'District is required.' });
      }

      const result = await aiService.predictCrops({
        district,
        season: season || 'Rabi',
        area: Number(area) || 1.0,
        top_k: Number(top_k) || 5
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/ai/fertilizer-recommendation
   */
  async getFertilizerRecommendation(req, res) {
    try {
      const { crop_name, area, area_unit, soil } = req.body;
      if (!crop_name) {
        return res.status(400).json({ success: false, error: 'Crop name is required.' });
      }

      const result = await aiService.recommendFertilizer({
        crop_name,
        area: Number(area) || 1.0,
        area_unit: area_unit || 'acre',
        soil: soil || null
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/weather/:location
   */
  async getWeather(req, res) {
    try {
      const { location } = req.params;
      const { latitude, longitude } = req.query;
      const weather = await aiService.getWeather(location, { latitude, longitude });
      return res.status(200).json({ success: true, weather });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/weather/:location/alerts
   */
  async getWeatherAlerts(req, res) {
    try {
      const { location } = req.params;
      const { crop_name, crop_stage } = req.query;
      const alerts = await aiService.getWeatherAlerts({
        district: location,
        crop_name: crop_name || null,
        crop_stage: crop_stage || null
      });
      return res.status(200).json({ success: true, data: alerts });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/ai/history
   */
  async getRecommendationHistory(req, res) {
    try {
      const farmerId = req.user?.id || 'farmer_demo_101';
      const history = await RecommendationHistory.find({ farmerId })
        .sort({ createdAt: -1 })
        .limit(20);

      return res.status(200).json({
        success: true,
        count: history.length,
        history
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AIController();
