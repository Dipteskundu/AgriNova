/**
 * AgriNova Express Server Entrypoint
 */

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Initialize Database connection
connectDB();

const server = app.listen(PORT, () => {
  console.log(`[AgriNova Backend] Server running on port ${PORT}`);
  console.log(`[AgriNova Backend] AI Microservice configured at: ${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}`);
});

module.exports = server;
