/**
 * AgriNova AI Microservice Communication Client (Axios)
 * Integrates Node.js Express backend with the Python FastAPI AI microservice.
 */

const axios = require('axios');

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: AI_SERVICE_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

class AIService {
  /**
   * Health check of the underlying Python FastAPI AI service.
   */
  async checkHealth() {
    try {
      const resp = await apiClient.get('/health');
      return resp.data;
    } catch (error) {
      return {
        status: 'unreachable',
        error: error.message,
        url: AI_SERVICE_BASE_URL
      };
    }
  }

  /**
   * Retrieves active ML model metadata and provenance.
   */
  async getModelInfo() {
    try {
      const resp = await apiClient.get('/model/info');
      return resp.data;
    } catch (error) {
      throw new Error(`Failed to retrieve AI model information: ${error.message}`);
    }
  }

  /**
   * Predicts Top-K candidate crops using trained SPAS-Dataset-BD model.
   */
  async predictCrops(payload) {
    try {
      const resp = await apiClient.post('/predict/crop', payload);
      return resp.data;
    } catch (error) {
      throw new Error(`Crop prediction failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Generates area-scaled BARC FRG-2024 fertilizer recommendation.
   */
  async recommendFertilizer(payload) {
    try {
      const resp = await apiClient.post('/recommend/fertilizer', payload);
      return resp.data;
    } catch (error) {
      throw new Error(`Fertilizer recommendation failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Fetches real-time weather and 7-day forecast from Open-Meteo via AI service.
   */
  async getWeather(location, coords = {}) {
    try {
      const params = {};
      if (coords.latitude) params.latitude = coords.latitude;
      if (coords.longitude) params.longitude = coords.longitude;
      const resp = await apiClient.get(`/weather/${encodeURIComponent(location)}`, { params });
      return resp.data;
    } catch (error) {
      throw new Error(`Weather retrieval failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Evaluates weather conditions against crop thresholds.
   */
  async getWeatherAlerts(payload) {
    try {
      const resp = await apiClient.post('/weather/alerts', payload);
      return resp.data;
    } catch (error) {
      throw new Error(`Weather alert generation failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Master Unified Farm Recommendation Pipeline:
   * ML Prediction + BARC Zoning + Season Engine + Open-Meteo + FRG-2024 Fertilizer Plan.
   */
  async recommendFarm(payload) {
    try {
      const resp = await apiClient.post('/recommend/farm', payload);
      return resp.data;
    } catch (error) {
      throw new Error(`Unified farm recommendation failed: ${error.response?.data?.detail || error.message}`);
    }
  }
}

module.exports = new AIService();
