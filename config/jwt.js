const jwt = require("jsonwebtoken");

// Fungsi untuk menandatangani (membuat) token JWT berdasarkan ID pengguna
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN, // Contoh format: "4h" (token berlaku selama 4 jam)
    });
};

// Fungsi untuk membuat dan mengirim token ke client sebagai cookie
const createSendToken = (user, statusCode, res) => {
    // Buat token dengan user ID
    const token = signToken(user.id);
  
    // Opsi konfigurasi untuk cookie
    const cookieOptions = {
      maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000, // Konversi dari hari ke milidetik
      httpOnly: true, // Cookie tidak bisa diakses oleh JavaScript (meningkatkan keamanan dari serangan XSS)
      secure: process.env.NODE_ENV === "production", // Cookie hanya dikirim melalui HTTPS saat dalam mode produksi
      sameSite: "Strict", // Mencegah pengiriman cookie ke situs lain (melindungi dari serangan CSRF)
    };
  
    // Mengatur cookie di response dengan nama 'jwt'
    res.cookie("jwt", token, cookieOptions);
  
    // Mengirim response ke client dengan token dan informasi user
    res.status(statusCode).json({
      status: "success",
      token, // Token dikirim agar bisa digunakan dalam header Authorization
      data: { 
        username: user.username,
        email: user.email // Hanya mengembalikan email pengguna
      },
    });
};

// Fungsi untuk memverifikasi token JWT
const verifyToken = (token) => {
    try {
      // Memeriksa apakah token valid atau tidak menggunakan secret key
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null; // Menghindari crash jika token tidak valid atau sudah kedaluwarsa
    }
};

// Mengekspor fungsi agar bisa digunakan di file lain
module.exports = { signToken, createSendToken, verifyToken };
