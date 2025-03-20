const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authHandler");

const {
  createProfile,

  getProfile,
  updateProfile,
} = require("../controllers/profileController");
const upload = require("../utils/fileUpload");

//rute get profile
router.get("/", authMiddleware, getProfile);

// **Route untuk upload Avatar**
router.post("/", authMiddleware, upload.single("avatar"), createProfile);
router.put("/", authMiddleware, upload.single("avatar"), updateProfile);

module.exports = router;
