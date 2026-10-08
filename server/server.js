const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

// Handle Chrome DevTools probes and favicon cleanly
app.use('/.well-known', (req, res) => res.status(204).end());
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Routes
app.use('/api/assessments', require('./src/routes/assessmentRoutes'));
app.use('/api/import', require('./src/routes/importRoutes'));
app.use('/api/findings', require('./src/routes/findingRoutes'));
app.use('/api/services', require('./src/routes/serviceRoutes'));
app.use('/api/rules', require('./src/routes/ruleRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PortGuard AI Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
