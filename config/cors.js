const cors = require("cors");

// Konfigurasi opsi CORS (Cross-Origin Resource Sharing)
const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (misalnya dari backend ke backend)
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      "http://localhost:3000",
      "https://button-carwash.vercel.app",
      "http://localhost:5000",
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Akses tidak diizinkan oleh CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Mengekspor middleware CORS dengan konfigurasi yang telah dibuat
module.exports = cors(corsOptions);
