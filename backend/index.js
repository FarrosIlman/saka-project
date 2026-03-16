const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const connectDB = require('./config/db');
const RealtimeManager = require('./services/realtimeManager');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Initialize Realtime Manager with HTTP server for Socket.io
const realtimeManager = new RealtimeManager(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/levels', require('./routes/levelRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/reporting', require('./routes/reportingRoutes'));
app.use('/api', require('./routes/leaderboardRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'English Quiz API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 7000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket ready for real-time features`);
  // Log di bawah ini opsional, tapi membantu saat debugging di Render
  console.log(`💚 Health Check: /api/health`);
});

module.exports = app;