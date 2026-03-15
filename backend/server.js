require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/database');
const BackgroundJobs = require('./src/services/backgroundJobs');

const PORT = process.env.PORT || 5000;

// Initialize database before starting server
initDatabase().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   Hostel Gatepass Management System - Backend API    ║
╠═══════════════════════════════════════════════════════╣
║   Server running on: http://localhost:${PORT}         ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   API Health: http://localhost:${PORT}/api/health     ║
╚═══════════════════════════════════════════════════════╝
    `);
  });

  // Start background jobs
  BackgroundJobs.start();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    BackgroundJobs.stop();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    BackgroundJobs.stop();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
