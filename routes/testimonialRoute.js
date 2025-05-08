const express = require("express");
const router = express.Router();
const {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");
const { authMiddleware } = require("../middlewares/authHandler");

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     tags:
 *       - Testimonials
 *     summary: Get all testimonials
 *     responses:
 *       200:
 *         description: List of testimonials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   rating:
 *                     type: integer
 *                   comment:
 *                     type: string
 */
router.get("/", getAllTestimonials);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   get:
 *     tags:
 *       - Testimonials
 *     summary: Get testimonial by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Testimonial details
 *       404:
 *         description: Testimonial not found
 */
router.get("/:id", authMiddleware, getTestimonialById);

/**
 * @swagger
 * /api/testimonials:
 *   post:
 *     tags:
 *       - Testimonials
 *     summary: Create new testimonial
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Testimonial created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   put:
 *     tags:
 *       - Testimonials
 *     summary: Update testimonial
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Testimonial updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Testimonial not found
 */
router.put("/:id", authMiddleware, updateTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   delete:
 *     tags:
 *       - Testimonials
 *     summary: Delete testimonial
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Testimonial deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Testimonial not found
 */
router.delete("/:id", authMiddleware, deleteTestimonial);

module.exports = router;
