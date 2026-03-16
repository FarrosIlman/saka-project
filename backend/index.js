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

// --- KONFIGURASI CORS YANG SOLID ---
const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti mobile apps atau curl)
    if (!origin) return callback(null, true);
    
    // Daftar domain yang diizinkan
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://saka-frontend.vercel.app', // GANTI dengan URL Vercel Frontend kamu
      /\.vercel\.app$/                     // Izinkan semua subdomain vercel.app
    ];

    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

// Pasang middleware CORS di paling atas sebelum routes
app.use(cors(corsOptions));

// Handle preflight (request OPTIONS) secara manual untuk memastikan tidak 404
app.options('*', cors(corsOptions));

// Middleware standar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
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

// Agar tidak bentrok saat dideploy di Vercel (Vercel menggunakan serverless)
if (process.env.NODE_ENV !== 'production') {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 WebSocket ready`);
  });
}

// Export app untuk Vercel
module.exports = app;