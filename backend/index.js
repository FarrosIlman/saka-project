const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const rateLimit = require('express-rate-limit');
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

// --- RATE LIMITING MIDDLEWARE ---
// Strict rate limiter untuk auth routes (cegah brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Maksimal 5 request per IP per windowMs
  message: 'Terlalu banyak percobaan login/register. Coba lagi dalam 15 menit.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip preflight OPTIONS requests dan development mode
    if (req.method === 'OPTIONS') return true;
    return process.env.NODE_ENV === 'development';
  }
});

// General rate limiter untuk endpoint lain
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per IP per windowMs
  message: 'Terlalu banyak request. Coba lagi nanti.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip preflight OPTIONS requests dan development mode
    if (req.method === 'OPTIONS') return true;
    return process.env.NODE_ENV === 'development';
  }
});

// --- ROUTES ---
// Auth routes dengan strict rate limiting
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));

// Routes lainnya dengan general rate limiting
app.use('/api/admin', apiLimiter, require('./routes/adminRoutes'));
app.use('/api/levels', apiLimiter, require('./routes/levelRoutes'));
app.use('/api/progress', apiLimiter, require('./routes/progressRoutes'));
app.use('/api/user', apiLimiter, require('./routes/userRoutes'));
app.use('/api/users', apiLimiter, require('./routes/userRoutes'));
app.use('/api/notifications', apiLimiter, require('./routes/notificationRoutes'));
app.use('/api/analytics', apiLimiter, require('./routes/analyticsRoutes'));
app.use('/api/gamification', apiLimiter, require('./routes/gamificationRoutes'));
app.use('/api/comments', apiLimiter, require('./routes/commentRoutes'));
app.use('/api/export', apiLimiter, require('./routes/exportRoutes'));
app.use('/api/reporting', apiLimiter, require('./routes/reportingRoutes'));
app.use('/api', apiLimiter, require('./routes/leaderboardRoutes'));

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