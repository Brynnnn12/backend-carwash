const swaggerAutogen = require("swagger-autogen")();
const fs = require("fs");

const doc = {
  info: {
    title: "Car Wash API",
    description: "Dokumentasi API untuk layanan Car Wash",
  },
  host: "localhost:3000",
  schemes: ["http"],
  basePath: "/api", // Pastikan API menggunakan prefix "/api"
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/index.js"];

const generateSwagger = async () => {
  if (!fs.existsSync(outputFile)) {
    console.log("⚡ Generating Swagger documentation...");
    await swaggerAutogen(outputFile, routes);
    console.log("✅ Swagger documentation generated!");
  } else {
    console.log("⚡ Menggunakan file Swagger yang sudah ada.");
  }
};

module.exports = generateSwagger;
