const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lunar_landing_db';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    console.warn('[MongoDB] Server running in disconnected/in-memory mode for development resilience.');
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`[Express Backend] Server running on http://localhost:${PORT}`);
  console.log(`[Express Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
});
