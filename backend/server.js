const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/learning-path', require('./routes/learningPath'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gamify Learning API is running' });
});

// MongoDB connection with fallback to JSON
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } else {
      console.log('⚠️  MongoDB URI not provided, using JSON fallback');
    }
  } catch (error) {
    console.log('⚠️  MongoDB connection failed, using JSON fallback:', error.message);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;

// Function to start server on a given port
const startServer = (port) => {
  return app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    if (port !== PORT) {
      console.log(`📝 Note: Backend is on port ${port} (${PORT} was in use)`);
      console.log(`📝 Frontend should use: http://localhost:${port}/api`);
    }
  });
};

// Try to start on the default port, fallback to next available port
const server = startServer(PORT);
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is in use, trying ${PORT + 1} instead...`);
    startServer(PORT + 1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
