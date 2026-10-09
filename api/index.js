const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('Warning: MONGODB_URI is not set in Vercel environment variables.');
    }
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('Vercel function execution error:', err.message || err);
    if (!res.headersSent) {
      const isLocalhost = (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost'));
      const detailedMsg = isLocalhost
        ? 'Database Connection Error: MONGODB_URI is pointing to localhost or is missing in Vercel. Please add your cloud MongoDB Atlas URI (mongodb+srv://...) to Vercel Environment Variables.'
        : `Database / Server Error: ${err.message || err}. Please check your MONGODB_URI in Vercel Environment Variables and verify MongoDB Atlas Network Access is set to 0.0.0.0/0.`;
      
      return res.status(500).json({
        success: false,
        message: detailedMsg
      });
    }
  }
};

