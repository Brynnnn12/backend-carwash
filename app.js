require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");
const logger = require("./config/logging");
const morganMiddleware = require("./config/morgan");
const routes = require("./routes");
const limiter = require("./config/rateLimit");
const cors = require("./config/cors");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

// Middleware Logging
app.use(morganMiddleware);

// Middleware dasar
app.use(cors);
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Mode Production: Matikan header X-Powered-By
if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}

// Serve static files
app.use(
  "/carwash/buktipembayaran",
  express.static(path.join(__dirname, "public/uploads"))
);

// Routes
app.use("/api", routes);

// Middleware untuk menangani error dan not found
app.use(notFound);
app.use(errorHandler);

// Menjalankan Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server berjalan di port ${port}`);
});
