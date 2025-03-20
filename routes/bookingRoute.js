const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authMiddleware } = require("../middlewares/authHandler");

// CRUD Routes
router.post("/", authMiddleware, bookingController.createBooking);
router.get("/", authMiddleware, bookingController.getAllBookings);
router.get("/:id", authMiddleware, bookingController.getBookingById);
router.put("/:id", authMiddleware, bookingController.updateBooking);
router.delete("/:id", authMiddleware, bookingController.deleteBooking);
router.patch(
  "/:id/status",
  authMiddleware, // Pastikan user login
  bookingController.updateBookingStatus
);

module.exports = router;
