const express = require("express");
const router = express.Router();
const serviceRoutes = require("./serviceRoute");
const servicePriceRoutes = require("./servicePriceRoute");
const bookingRoutes = require("./bookingRoute");
const authRoutes = require("./authRoute");
const profileRoutes = require("./profileRoute");
const transactionRoutes = require("./transactionRoute");
const testimonialRoutes = require("./testimonialRoute");

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/services", serviceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/service-price", servicePriceRoutes);
router.use("/transactions", transactionRoutes);
router.use("/testimonials", testimonialRoutes);

module.exports = router;
