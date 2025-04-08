const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan"),
      false
    );
  }
};

// Storage untuk avatar
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const userId = req.user?.username || "user";
    return {
      folder: "carwash/avatar",
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
      transformation: [
        {
          width: 400,
          height: 400,
          crop: "thumb",
          gravity: "face",
          quality: "auto",
        },
      ],
      public_id: `avatar_${userId}_${Date.now()}`,
    };
  },
});

// Storage untuk payment proof
const paymentProofStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // console.log("🧾 DEBUG req.user di upload Cloudinary:", req.user.username);

    const userId = req.user?.username || "user";
    return {
      folder: "carwash/payment_proofs",
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
      transformation: [
        { width: 800, height: 600, crop: "limit", quality: "auto" },
      ],
      public_id: `paymentproof_${userId}_${Date.now()}`,
    };
  },
});

// Multer instance
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

const uploadPaymentProof = multer({
  storage: paymentProofStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

module.exports = {
  uploadAvatar,
  uploadPaymentProof,
};
