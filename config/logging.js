const winston = require("winston");
const path = require("path");
require("winston-daily-rotate-file");
const fs = require("fs");
const cliColors = require("cli-color");

// Tentukan direktori logs
const logDir = path.join(__dirname, "./logs");

// Pastikan direktori logs ada
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Format untuk file log
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Format untuk console log yang lebih menarik
const consoleLogFormat = winston.format.combine(
  winston.format((info) => {
    // Tambahkan emoji berdasarkan level
    info.emoji =
      {
        info: "ℹ️",
        error: "❌",
        warn: "⚠️",
        debug: "🐛",
        verbose: "📢",
        silly: "🎃",
      }[info.level] || "";
    return info;
  })(),
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, emoji }) => {
    const coloredTimestamp = cliColors.cyanBright(timestamp);
    return `${coloredTimestamp} ${emoji} ${level}\t: ${message}`;
  })
);

// Transport untuk menyimpan log
const transportInfo = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "info-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "14d",
  level: "info",
  format: fileLogFormat,
});

const transportError = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
  level: "error",
  format: fileLogFormat,
});

const transports = [transportInfo, transportError];

if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: consoleLogFormat,
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  transports: transports,
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
    }),
  ],
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  throw reason;
});

module.exports = logger;
