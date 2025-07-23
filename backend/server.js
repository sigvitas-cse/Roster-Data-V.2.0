const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const path = require('path');

const loginRoutes = require('./routes/login');
const employeeRoutes = require('./routes/employee');
const notesRoutes = require('./routes/notes');
const authRoutes = require('./routes/api');
const suggestions = require('./routes/suggestion');


const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON requests
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// CORS setup
const corsOptions = {
  origin: ['http://localhost:5173', 'http://roster1.sigvitas.com'], // Update for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', "x-api-key", 'x-auth-token'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url} from origin: ${req.headers.origin}`);
  next();
});

// MongoDB connection

console.log('inside server');

// Routes
app.use('/api', loginRoutes);
app.use('/api', employeeRoutes);
app.use('/api', notesRoutes);
app.use('/api', authRoutes);
app.use('/api', suggestions);

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
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const PORT = 3001;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);  // Exit the process in case of connection failure
  });

