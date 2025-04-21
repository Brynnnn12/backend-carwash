const express = require("express");
const router = express.Router();
const {
  createServicePrice,
  getAllServicePrices,
  getServicePriceById,
  updateServicePrice,
  deleteServicePrice,
} = require("../controllers/servicePriceController");
const {
  authMiddleware,
  permissionMiddleware,
} = require("../middlewares/authHandler");

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("admin"),
  createServicePrice
);
router.get(
  "/",
  authMiddleware,

  getAllServicePrices
);
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("admin"),
  getServicePriceById
);
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("admin"),
  updateServicePrice
);
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("admin"),
  deleteServicePrice
);

module.exports = router;
