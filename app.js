require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware dasar
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: process.env.CORS_METHODS,
  credentials: true,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: "Terlalu banyak permintaan, coba lagi nanti.",
});
app.use(limiter);

// Middleware Logging (Gunakan hanya di development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mode Production: Matikan header X-Powered-By
if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}


// Rute


const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server Berjalan Diport ${port}`)
})
