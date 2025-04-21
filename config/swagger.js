const swaggerAutogen = require("swagger-autogen")();
const fs = require("fs");

const doc = {
  info: {
    title: "Car Wash API",
    description: "Dokumentasi API untuk layanan Car Wash",
  },
  host: "localhost:5000",
  schemes: ["http"],
  basePath: "/api", // Pastikan API menggunakan prefix "/api"
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/index.js"]; // Pastikan path ke file routes Anda benar

const generateSwagger = async () => {
  try {
    if (!fs.existsSync(outputFile)) {
      console.log("⚡ Generating Swagger documentation...");
      await swaggerAutogen(outputFile, routes, doc); // Tambahkan objek 'doc' sebagai argumen ketiga
      console.log("✅ Swagger documentation generated!");
    } else {
      console.log("⚡ Menggunakan file Swagger yang sudah ada.");
    }
  } catch (error) {
    console.error("❌ Gagal menghasilkan dokumentasi Swagger:", error);
  }
};

module.exports = generateSwagger;
