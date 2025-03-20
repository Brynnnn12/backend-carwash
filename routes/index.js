const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoute");
const profileRoutes = require("./profileRoute");

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

module.exports = router;
