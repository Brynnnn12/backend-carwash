const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authMiddleware } = require("../middlewares/authHandler");

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags:
 *       - Bookings
 *     summary: Create new booking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - servicePriceId
 *               - licensePlate
 *               - bookingTime
 *               - bookingDate
 *             properties:
 *               servicePriceId:
 *                 type: integer
 *               licensePlate:
 *                 type: string
 *               bookingDate:
 *                 type: string
 *                 format: date
 *               bookingTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input data
 */
router.post("/", authMiddleware, bookingController.createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get all bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
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
 *                   servicePriceId:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [pending, confirmed, completed, cancelled]
 *                   bookingDate:
 *                     type: string
 *                     format: date-time
 *                   bookingTime:
 *                     type: string
 *                     format: time
 */
router.get("/", authMiddleware, bookingController.getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get booking by ID
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
 *         description: Booking details
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authMiddleware, bookingController.getBookingById);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     tags:
 *       - Bookings
 *     summary: Update booking
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
 *               servicePriceId:
 *                 type: integer
 *               licensePlate:
 *                 type: string
 *               bookingDate:
 *                 type: string
 *                 format: date
 *               bookingTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authMiddleware, bookingController.updateBooking);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     tags:
 *       - Bookings
 *     summary: Delete booking
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
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authMiddleware, bookingController.deleteBooking);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     tags:
 *       - Bookings
 *     summary: Update booking status
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid status
 */
router.patch(
  "/:id/status",
  authMiddleware,
  bookingController.updateBookingStatus
);

module.exports = router;
