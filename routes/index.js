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
router.use("/service", serviceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/serviceprice", servicePriceRoutes);
router.use("/transaction", transactionRoutes);
router.use("/testimonial", testimonialRoutes);

module.exports = router;
