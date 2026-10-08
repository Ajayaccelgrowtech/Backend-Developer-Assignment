const app = require('../../src/app');
const connectDB = require('../../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in Vercel function:', err.message);
    return res.status(500).json({
      success: false,
      message: `Database Connection Error: ${err.message}. Please verify MONGODB_URI in Vercel Environment Variables and ensure MongoDB Atlas Network Access is set to 0.0.0.0/0.`
    });
  }
  return app(req, res);
};
