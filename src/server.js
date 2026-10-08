const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/environment');

const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(env.port, () => {
      console.log(`==================================================`);
      console.log(`🚀 CRM Sales Management Backend running in ${env.env} mode`);
      console.log(`📡 Server listening at http://localhost:${env.port}`);
      console.log(`==================================================`);
    });

    // Graceful Shutdown Handlers
    const shutdown = (signal) => {
      console.log(`\n[${signal}] Received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
