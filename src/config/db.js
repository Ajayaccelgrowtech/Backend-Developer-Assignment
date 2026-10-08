const mongoose = require('mongoose');
const env = require('./environment');

let isConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1 || isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(env.mongodbUri, {
      autoIndex: true
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.VERCEL) {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
