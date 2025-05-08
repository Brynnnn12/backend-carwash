const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "APPLICATION PROGRAMMING INTERFACE (API)",
      // Judul API

      version: "1.0.0",
      description:
        "Dokumentasi API untuk layanan, harga, pengguna, dan lainnya.",
    },
    servers: [
      {
        url: "http://localhost:5000", // Ganti sesuai kebutuhan
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"], // Path ke semua file route yang pakai Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
