const morgan = require("morgan");
const logger = require("./logging"); // Impor logger dari Winston

// Tentukan format log berdasarkan environment
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";

// Arahkan log Morgan ke Winston
const winstonStream = {
  write: (message) => logger.info(message.trim()),
};

// Export middleware Morgan
module.exports = morgan(morganFormat, { stream: winstonStream });
