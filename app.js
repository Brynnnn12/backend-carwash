require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const logger = require("./config/logging");
const morganMiddleware = require("./config/morgan");
const routes = require("./routes");
const cors = require("./config/cors");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

// Middleware: Logging & Rate Limit
app.use(morganMiddleware);
// app.use(limiter);

// Middleware: Security & Performance
app.use(cors);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  compression({
    level: 6,
    threshold: 1024,
  })
);

// Middleware: Body Parser & Cookie
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Remove "X-Powered-By" on Production
if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Routes
app.use("/api", routes);

// Not Found & Error Handler
app.use(notFound);
app.use(errorHandler);

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port}`);
  logger.info(
    `📚 API Documentation available at http://localhost:${port}/api-docs`
  );
});
