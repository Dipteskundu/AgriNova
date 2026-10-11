/**
 * AgriNova Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-farmer-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Health Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AgriNova Node.js / Express Main Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Route not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[AgriNova Backend Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
