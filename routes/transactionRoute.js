const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const upload = require("../utils/fileUpload");
const {
  permissionMiddleware,
  authMiddleware,
} = require("../middlewares/authHandler"); // Asumsikan ada middleware untuk cek admin

// CRUD Routes
router.post(
  "/",
  authMiddleware,
  upload.single("paymentProof"),
  transactionController.createTransaction
);

// router.get("/", authMiddleware, transactionController.getAllTransactions);
router.get("/:id", authMiddleware, transactionController.getransactionById);

router.put(
  "/:id",
  authMiddleware,
  upload.single("paymentProof"),
  transactionController.updateTransaction
);

// Route khusus untuk update status pembayaran (isPaid) - hanya admin
router.put(
  "/:id/payment-status",
  authMiddleware,
  permissionMiddleware("admin"), // Middleware untuk verifikasi admin
  transactionController.updatePaymentStatus
);

router.delete("/:id", authMiddleware, transactionController.deleteTransaction);

module.exports = router;
