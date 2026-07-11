const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

// Centralized error handling middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
