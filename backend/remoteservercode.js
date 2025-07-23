const https = require('https');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const path = require('path');

const loginRoutes = require('./routes/login');
const employeeRoutes = require('./routes/employee');

const app = express();

// SSL options
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/roster1.sigvitas.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/roster1.sigvitas.com/fullchain.pem')
};

// Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON requests

// CORS setup
const corsOptions = {
  origin: ['http://localhost:3000', 'https://roster1.sigvitas.com'], // Update for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url} from origin: ${req.headers.origin}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);  // Exit the process in case of connection failure
  });

console.log('inside server');

// Routes
app.use('/api', loginRoutes);
app.use('/api', employeeRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5000;

// Start HTTPS server
https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS Server is running on port ${PORT}`);
});