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

// Rute untuk testimonial
router.get("/", getAllTestimonials);
router.get("/:id", authMiddleware, getTestimonialById);
router.post("/", authMiddleware, createTestimonial);
router.put("/", authMiddleware, updateTestimonial);
router.delete("/", authMiddleware, deleteTestimonial);

module.exports = router;
