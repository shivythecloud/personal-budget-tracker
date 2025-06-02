const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/personal-budget-tracker')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

