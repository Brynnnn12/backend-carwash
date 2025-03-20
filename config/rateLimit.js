const rateLimit = require("express-rate-limit");

// Konfigurasi middleware rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Rentang waktu dalam milidetik (15 menit)
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Maksimum permintaan dalam rentang waktu yang ditentukan
  message: "Terlalu banyak permintaan, coba lagi nanti.", // Pesan yang dikirim jika batas tercapai
});

module.exports = limiter;
