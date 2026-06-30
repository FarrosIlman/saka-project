const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Load environment variables immediately so other modules can use them
dotenv.config();

const http = require('http');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const RealtimeManager = require('./services/realtimeManager');

// (dotenv was moved to the top)

// ❌ HAPUS ATAU KOMENTARI BARIS INI:
// connectDB(); 

const app = express();

// --- SECURITY MIDDLEWARES ---
// Set security HTTP headers
app.use(helmet());
// Prevent NoSQL injection
app.use(mongoSanitize());


// --- PERBAIKAN UNTUK VERCEL (PROXY) ---
// Wajib diaktifkan agar express-rate-limit tidak crash saat membaca IP pengguna melalui Vercel
app.set('trust proxy', 1);

// ✅ TAMBAHKAN MIDDLEWARE INI:
// Memaksa Vercel menunggu koneksi database selesai sebelum memproses request apapun
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Middleware DB Connection Error:', error);
    res.status(500).json({ message: 'Gagal terhubung ke database' });
  }
});

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
      /\.vercel\.app$/                      // Izinkan semua subdomain vercel.app
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
  max: 1000, // Maksimal 1000 request per IP per windowMs (dinaikkan untuk testing)
  message: 'Terlalu banyak request. Coba lagi nanti.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip preflight OPTIONS requests dan development mode
    if (req.method === 'OPTIONS') return true;
    return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
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

// Error handling middleware (Global Error Handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  res.status(statusCode).json({ 
    message, 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
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
