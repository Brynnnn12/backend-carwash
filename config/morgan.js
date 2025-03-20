const morgan = require("morgan");
const logger = require("./logging");

// Tentukan format log berdasarkan mode aplikasi
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";

// Gunakan Winston sebagai output log Morgan
const winstonStream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = morgan(morganFormat, { stream: winstonStream });
