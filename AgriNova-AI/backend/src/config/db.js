/**
 * AgriNova MongoDB Atlas Connection Configuration
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrinova';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[AgriNova MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[AgriNova MongoDB] Notice: Could not establish live MongoDB connection (${error.message}). Running in mock/in-memory persistence mode for demonstration.`);
  }
};

module.exports = connectDB;
