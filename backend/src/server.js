// Configure dotenv immediately at the entry point of the application
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Determine Port
const PORT = process.env.PORT || 5000;

// Start Server only after a successful database connection
const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Start Server
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.error(`Unhandled Rejection Error: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
