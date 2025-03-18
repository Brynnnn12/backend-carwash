const cors = require("cors");

const corsOptions = {
  origin: ["http://localhost:3000", "http://yourdomain.com"], // Sesuaikan dengan frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Mengizinkan cookies dan header autentikasi
};

module.exports = cors(corsOptions);
