"use strict";
const { Profile, User } = require("../models");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const { profileSchema } = require("../validators/profileValidator");

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
    // ✅ Validasi request body pakai Joi
    const { error } = profileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message, // Ambil pesan error pertama
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "Avatar is required" });
    }

    const { name, address, phoneNumber, userId } = req.body;

    // ✅ Cek apakah userId sudah punya profil
    const existingProfile = await Profile.findOne({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({
        status: "fail",
        message: "User already has a profile",
      });
    }

    // ✅ Jika belum ada, buat profil baru
    const newProfile = await Profile.create({
      id: uuidv4(),
      name,
      address,
      avatar: req.file.path, // URL Cloudinary untuk avatar
      phoneNumber,
      userId,
    });

    res.status(201).json({
      status: "success",
      message: "Profile created successfully",
      data: newProfile,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ status: "fail", message: "Unauthorized. Please log in." });
    }

    const userId = req.user.id;
    const { name, address, phoneNumber } = req.body;

    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return res
        .status(404)
        .json({ status: "fail", message: "Profile not found" });
    }

    let newAvatar = profile.avatar;
    if (
      req.file &&
      profile.avatar &&
      profile.avatar.includes("cloudinary.com")
    ) {
      try {
        const avatarUrlParts = profile.avatar.split("/");
        const avatarPublicId = avatarUrlParts.slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(avatarPublicId);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
      }
      newAvatar = req.file.path;
    }

    await profile.update({
      name: name || profile.name,
      address: address || profile.address,
      phoneNumber: phoneNumber || profile.phoneNumber,
      avatar: newAvatar,
    });

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        name: profile.name,
        address: profile.address,
        phoneNumber: profile.phoneNumber,
        avatar: profile.avatar,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
