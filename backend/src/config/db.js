const mongoose = require('mongoose');

/**
 * Establish connection to MongoDB database
 */
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'test'
        ? process.env.MONGO_TEST_URI
        : process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is missing.');
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
