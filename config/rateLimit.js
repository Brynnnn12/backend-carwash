const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: "Terlalu banyak permintaan, coba lagi nanti.",
});

module.exports = limiter;
