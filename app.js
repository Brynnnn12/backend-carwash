require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const logger = require("./config/logging");
const morganMiddleware = require("./config/morgan");
const routes = require("./routes");
const limiter = require("./config/rateLimit");
const cors = require("./config/cors");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const swaggerUi = require("swagger-ui-express");
const generateSwagger = require("./config/swagger");

const app = express();

// Middleware Logging
app.use(morganMiddleware);

// Middleware dasar
app.use(cors);
app.use(
  helmet({
    contentSecurityPolicy: false, // Jika ada error terkait CSP, matikan ini
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  compression({
    level: 6, // 0 (no compression) - 9 (max compression)
    threshold: 1024, // Hanya kompres jika ukuran lebih dari 1KB
  })
);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Mode Production: Matikan header X-Powered-By
if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}

// Generate Swagger lalu jalankan server
generateSwagger().then(() => {
  // Baru setelah Swagger digenerate, kita require file JSON-nya
  const swaggerDocument = require("./swagger-output.json");

  // Middleware Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Routess
  app.use("/api", routes);

  // Middleware untuk menangani error dan not found
  app.use(notFound);
  app.use(errorHandler);

  // Menjalankan Server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server berjalan di port ${port}`);
    console.log(`Swagger Docs tersedia di http://localhost:${port}/api-docs`);
  });
});
