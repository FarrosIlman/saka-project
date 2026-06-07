const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('Tolong definisikan environment variable MONGO_URI di .env atau pengaturan Vercel');
}

/**
 * Global variable digunakan untuk menyimpan koneksi (caching) di lingkungan Node.js.
 * Ini mencegah Vercel membuka koneksi baru terus-menerus setiap kali fungsi dipanggil.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // 1. Jika koneksi sudah ada di cache, langsung gunakan (mencegah tumpukan koneksi)
  if (cached.conn) {
    return cached.conn;
  }

  // 2. Jika belum ada koneksi, buat koneksi baru
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Perhatikan: useNewUrlParser dan useUnifiedTopology sudah Dihapus di sini
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        return mongoose;
      })
      .catch((error) => {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Di Vercel, hindari process.exit(1) karena akan mematikan paksa instance yang sedang berjalan.
        // Lebih baik lemparkan error agar bisa ditangkap oleh blok try-catch di API route Anda.
        throw error; 
      });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
