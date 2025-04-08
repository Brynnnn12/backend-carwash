"use strict";
const { Profile, User } = require("../models");
const cloudinary = require("cloudinary").v2;
const asyncHandler = require("../middlewares/asyncHandler");

const { profileSchema } = require("../validations/profileValidator");

exports.getProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      status: "fail",
      message: "Unauthorized. Please log in.",
    });
  }

  const profile = await Profile.findOne({
    where: { userId: req.user.id },
    include: [
      {
        model: User,
        as: "user",
        attributes: {
          exclude: ["password", "roleId", "createdAt", "updatedAt"],
        },
      },
    ],
    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
  });

  if (!profile) {
    return res.status(404).json({
      status: "fail",
      message: "Profile not found for this user.",
    });
  }

  res.status(200).json({
    status: "success",
    data: profile,
  });
});

exports.createProfile = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return res
      .status(401)
      .json({ status: "fail", message: "Unauthorized. Please log in." });
  }

  const userId = req.user.id;
  const { name, address, phoneNumber } = req.body;

  // Cek apakah user sudah memiliki profil
  const existingProfile = await Profile.findOne({ where: { userId } });
  if (existingProfile) {
    return res
      .status(400)
      .json({ status: "fail", message: "User already has a profile" });
  }

  // Validasi input
  const { error } = profileSchema.validate({ name, address, phoneNumber });
  if (error) {
    return res
      .status(400)
      .json({ status: "fail", message: error.details[0].message });
  }

  // Upload avatar jika ada file

  // Buat profil
  const newProfile = await Profile.create({
    name,
    address,
    avatar: req.file ? req.file.path : null,
    phoneNumber,
    userId,
  });

  res.status(201).json({
    status: "success",
    message: "Profile created successfully",
    data: newProfile,
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return res
      .status(401)
      .json({ status: "fail", message: "Unauthorized. Please log in." });
  }

  const userId = req.user.id;
  const { name, address, phoneNumber } = req.body;

  // Cari profil user
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) {
    return res
      .status(404)
      .json({ status: "fail", message: "Profile not found" });
  }

  // Validasi input
  const { error } = profileSchema.validate({ name, address, phoneNumber });
  if (error) {
    return res
      .status(400)
      .json({ status: "fail", message: error.details[0].message });
  }

  // Siapkan data update
  const updateData = {
    name: name || profile.name,
    address: address || profile.address,
    phoneNumber: phoneNumber || profile.phoneNumber,
  };

  // Handle avatar update
  if (req.file) {
    if (profile.avatar?.includes("cloudinary.com")) {
      const publicId = profile.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader
        .destroy(`carwash/avatar/${publicId}`)
        .catch(console.error);
    }

    const formattedName = (name || profile.name || "unknown")
      .replace(/\s+/g, "_")
      .toLowerCase();
    updateData.avatar = (
      await cloudinary.uploader.upload(req.file.path, {
        folder: "carwash/avatar",
        public_id: `avatar_${formattedName}_${Date.now()}`,
      })
    ).secure_url;
  }

  // Update profil
  await profile.update(updateData);

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: updateData,
  });
});
