const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authHandler");

const {
  createProfile,
  getProfile,
  updateProfile,
} = require("../controllers/profileController");
const { uploadAvatar } = require("../utils/fileUpload");

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 address:
 *                   type: string
 *                 avatar:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getProfile);

/**
 * @swagger
 * /api/profile:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Create user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input data
 */
router.post("/", authMiddleware, uploadAvatar.single("avatar"), createProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     tags:
 *       - Profile
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Profile not found
 */
router.put("/", authMiddleware, uploadAvatar.single("avatar"), updateProfile);

module.exports = router;
