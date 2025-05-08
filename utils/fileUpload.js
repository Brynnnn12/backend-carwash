// Import library yang dibutuhkan
const cloudinary = require("cloudinary").v2; // Library untuk mengakses layanan Cloudinary
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // Storage khusus untuk Cloudinary
const multer = require("multer"); // Middleware untuk menangani upload file
require("dotenv").config(); // Untuk membaca variabel lingkungan dari file .env

// Konfigurasi Cloudinary menggunakan kredensial dari file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Nama cloud dari akun Cloudinary
  api_key: process.env.CLOUDINARY_API_KEY, // API key untuk autentikasi
  api_secret: process.env.CLOUDINARY_API_SECRET, // API secret untuk autentikasi
});

// Filter file untuk memvalidasi tipe file yang diupload
const fileFilter = (req, file, cb) => {
  // Daftar tipe file yang diperbolehkan
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    // Jika tipe file valid, lanjutkan proses upload
    cb(null, true);
  } else {
    // Jika tipe file tidak valid, kirim error
    cb(
      new Error("Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan"),
      false
    );
  }
};

// Konfigurasi storage untuk avatar
const avatarStorage = new CloudinaryStorage({
  cloudinary, // Menggunakan instance Cloudinary yang telah dikonfigurasi
  params: (req, file) => {
    const userId = req.user?.username || "user"; // Menggunakan username pengguna atau default "user"
    return {
      folder: "carwash/avatar", // Folder tempat menyimpan file di Cloudinary
      allowed_formats: ["jpg", "jpeg", "png", "gif"], // Format file yang diperbolehkan
      transformation: [
        {
          width: 400, // Lebar gambar setelah transformasi
          height: 400, // Tinggi gambar setelah transformasi
          crop: "thumb", // Memotong gambar menjadi thumbnail
          gravity: "face", // Fokus pada wajah jika ada
          quality: "auto", // Menyesuaikan kualitas gambar secara otomatis
        },
      ],
      public_id: `avatar_${userId}_${Date.now()}`, // Nama file unik berdasarkan username dan timestamp
    };
  },
});

// Konfigurasi storage untuk bukti pembayaran
const paymentProofStorage = new CloudinaryStorage({
  cloudinary, // Menggunakan instance Cloudinary yang telah dikonfigurasi
  params: (req, file) => {
    const userId = req.user?.username || "user"; // Menggunakan username pengguna atau default "user"
    return {
      folder: "carwash/payment_proofs", // Folder tempat menyimpan file di Cloudinary
      allowed_formats: ["jpg", "jpeg", "png", "gif"], // Format file yang diperbolehkan
      transformation: [
        { width: 800, height: 600, crop: "limit", quality: "auto" }, // Membatasi ukuran gambar maksimal 800x600
      ],
      public_id: `paymentproof_${userId}_${Date.now()}`, // Nama file unik berdasarkan username dan timestamp
    };
  },
});

// Middleware untuk upload avatar
const uploadAvatar = multer({
  storage: avatarStorage, // Menggunakan konfigurasi storage untuk avatar
  limits: { fileSize: 2 * 1024 * 1024 }, // Batas ukuran file maksimal 2 MB
  fileFilter, // Menggunakan filter file untuk memvalidasi tipe file
});

// Middleware untuk upload bukti pembayaran
const uploadPaymentProof = multer({
  storage: paymentProofStorage, // Menggunakan konfigurasi storage untuk bukti pembayaran
  limits: { fileSize: 2 * 1024 * 1024 }, // Batas ukuran file maksimal 2 MB
  fileFilter, // Menggunakan filter file untuk memvalidasi tipe file
});

// Ekspor middleware untuk digunakan di file lain
module.exports = {
  uploadAvatar, // Middleware untuk upload avatar
  uploadPaymentProof, // Middleware untuk upload bukti pembayaran
};
