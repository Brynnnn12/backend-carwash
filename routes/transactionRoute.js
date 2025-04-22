const express = require("express");
const router = express.Router();
const {
  getTransactionById,
  createTransaction,
  updateTransaction,
  updatePaymentStatus,
  deleteTransaction,
  getAllTransactions,
} = require("../controllers/transactionController");
const { uploadPaymentProof } = require("../utils/fileUpload");
const {
  permissionMiddleware,
  authMiddleware,
} = require("../middlewares/authHandler"); // Asumsikan ada middleware untuk cek admin

// CRUD Routes
// router.post(
//   "/",
//   authMiddleware,
//   uploadPaymentProof.single("paymentProof"),
//   createTransaction
// );

router.get("/", authMiddleware, getAllTransactions);
router.get("/:id", authMiddleware, getTransactionById);

router.put(
  "/:id",
  authMiddleware,
  uploadPaymentProof.single("paymentProof"),
  updateTransaction
);

// Route khusus untuk update status pembayaran (isPaid) - hanya admin
router.put(
  "/:id/payment-status",
  authMiddleware,
  permissionMiddleware("admin"), // Middleware untuk verifikasi admin
  updatePaymentStatus
);

router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;
