"use strict";
const { Profile, User } = require("../models");
const cloudinary = require("cloudinary").v2;

const { profileSchema } = require("../validations/profileValidator");

exports.getProfile = async (req, res) => {
  try {
    // ✅ Pastikan pengguna sudah login dan memiliki ID
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized. Please log in.",
      });
    }

    const userId = req.user.id; // ID user dari token atau sesi login

    // ✅ Cari profil berdasarkan userId
    const profile = await Profile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["id", "roleId", "password", "createdAt", "updatedAt"],
          }, // Sembunyikan ID dan roleId
        },
      ],
      attributes: { exclude: ["id", "createdAt", "updatedAt"] }, // Sembunyikan ID, createdAt, updatedAt
    });
    // ✅ Jika profil tidak ditemukan
    if (!profile) {
      return res.status(404).json({
        status: "fail",
        message: "Profile not found for this user.",
      });
    }

    // ✅ Kirim respons profil
    res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (error) {
    // ✅ Tangani error tak terduga
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.createProfile = async (req, res) => {
  try {
    // Pastikan user yang login ada
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized. Please log in.",
      });
    }

    // Ambil userId dari sesi user yang login, jangan dari req.body
    const userId = req.user.id;
    const { name, address, phoneNumber } = req.body;

    // Cek apakah user sudah punya profile
    const existingProfile = await Profile.findOne({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({
        status: "fail",
        message: "User already has a profile",
      });
    }

    // Validasi request body
    const { error } = profileSchema.validate({ name, address, phoneNumber });
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    // Jika ada file, upload avatar ke Cloudinary
    let avatarUrl = null;
    if (req.file) {
      // Format nama untuk publicId Cloudinary
      const formattedName = name
        ? name.replace(/\s+/g, "_").toLowerCase()
        : "unknown_user";
      const publicId = `avatar_${formattedName}_${Date.now()}`;

      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "carwash/avatar",
        public_id: publicId,
      });
      avatarUrl = imageResult.secure_url;
    }

    // Buat profile baru dengan userId dari sesi
    const newProfile = await Profile.create({
      name,
      address,
      avatar: avatarUrl,
      phoneNumber,
      userId,
    });

    res.status(201).json({
      status: "success",
      message: "Profile created successfully",
      data: newProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // ✅ Pastikan user yang login ada
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized. Please log in.",
      });
    }

    const userId = req.user.id; // Ambil ID dari sesi user yang login
    const { name, address, phoneNumber } = req.body;

    // ✅ Cari profil user yang sedang login
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return res.status(404).json({
        status: "fail",
        message: "Profile not found",
      });
    }

    // ✅ Validasi request body
    const { error } = profileSchema.validate({ name, address, phoneNumber });
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    // ✅ Siapkan data update
    const updateData = {
      name: name || profile.name,
      address: address || profile.address,
      phoneNumber: phoneNumber || profile.phoneNumber,
    };

    // ✅ Jika ada file avatar baru, update avatar
    if (req.file) {
      // Hapus avatar lama dari Cloudinary jika ada
      if (profile.avatar && profile.avatar.includes("cloudinary.com")) {
        try {
          const publicId = profile.avatar.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`carwash/avatar/${publicId}`);
        } catch (error) {
          console.error("Error deleting old avatar:", error);
        }
      }

      // Upload avatar baru ke Cloudinary
      const formattedName = name
        ? name.replace(/\s+/g, "_").toLowerCase()
        : profile.name.replace(/\s+/g, "_").toLowerCase() || "unknown_user";
      const publicId = `/avatar_${formattedName}_${Date.now()}`;

      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "carwash/avatar",
        public_id: publicId,
      });

      updateData.avatar = imageResult.secure_url;
    }

    // ✅ Update profil dengan data baru
    await profile.update(updateData);

    // ✅ Ambil data profil terbaru
    const updatedProfile = await Profile.findOne({ where: { userId } });

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        name: updatedProfile.name,
        address: updatedProfile.address,
        phoneNumber: updatedProfile.phoneNumber,
        avatar: updatedProfile.avatar,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
