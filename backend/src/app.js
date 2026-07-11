// Override MongoDB URI and add database connection logger for tests and dev server
const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'test') {
  process.env.MONGO_URI = process.env.MONGO_TEST_URI;
}

const getDbName = (uri) => {
  try {
    const cleanUri = uri.startsWith('mongodb+srv') ? uri.replace('mongodb+srv', 'http') : uri;
    const url = new URL(cleanUri);
    return url.pathname.replace(/^\//, '');
  } catch (e) {
    return 'unknown';
  }
};

const originalConnect = mongoose.connect;
mongoose.connect = function (uri, options) {
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Using MongoDB: ${getDbName(uri)}`);
  return originalConnect.apply(this, arguments);
};

const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Centralized error handling middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
