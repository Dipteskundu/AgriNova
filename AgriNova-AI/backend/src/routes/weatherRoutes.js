/**
 * AgriNova Weather Routes
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Open-Meteo 7-day forecast
router.get('/:location', (req, res) => aiController.getWeather(req, res));

// Contextual agricultural alerts
router.get('/:location/alerts', (req, res) => aiController.getWeatherAlerts(req, res));

module.exports = router;
