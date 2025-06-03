require('dotenv').config();


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // For cross-origin requests
const helmet = require('helmet'); // Security middleware
const rateLimit = require('express-rate-limit'); // For brute force protection


// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes'); // Assuming you'll add this


const app = express();


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personal-budget-tracker';


// Validate critical environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET']; // Add others as needed
requiredEnvVars.forEach(varName => {
  if (!process.env[varName] && process.env.NODE_ENV !== 'test') {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});


app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});


app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes); // Recommended addition


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'UP',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});


// Test endpoint (remove in production)
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend connected successfully',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});


// 404 errorHandler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});


// general error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong!'
    : err.message;


  res.status(statusCode).json({ 
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});


const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});


// shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});


module.exports = server; // For testing
