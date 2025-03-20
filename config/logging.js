const winston = require("winston");
const path = require("path");
require("winston-daily-rotate-file");
const fs = require("fs");

// Tentukan direktori logs
const logDir = path.join(__dirname, "../logs");

// Pastikan direktori logs ada
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Format log yang rapi
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message }) =>
      `${timestamp} [${level.toUpperCase()}]: ${message}`
  )
);

// Transport untuk menyimpan log INFO
const transportInfo = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "info-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "14d",
  level: "info",
});

// Transport untuk menyimpan log ERROR
const transportError = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
  level: "error",
});

// Konfigurasi logger utama
const transports = [transportInfo, transportError];

// Jika bukan di production, log juga ke console
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: transports,
});

module.exports = logger;
