// const express = require("express");
// const router = express.Router();
// const {
//   getTransactionById,
//   createTransaction,
//   updateTransaction,
//   updatePaymentStatus,
//   deleteTransaction,
//   getAllTransactions,
// } = require("../controllers/transactionController");
// const { uploadPaymentProof } = require("../utils/fileUpload");
// const {
//   permissionMiddleware,
//   authMiddleware,
// } = require("../middlewares/authHandler"); // Asumsikan ada middleware untuk cek admin

// // CRUD Routes
// // router.post(
// //   "/",
// //   authMiddleware,
// //   uploadPaymentProof.single("paymentProof"),
// //   createTransaction
// // );

// router.get("/", authMiddleware, getAllTransactions);
// router.get("/:id", authMiddleware, getTransactionById);

// router.put(
//   "/:id",
//   authMiddleware,
//   uploadPaymentProof.single("paymentProof"),
//   updateTransaction
// );

// // Route khusus untuk update status pembayaran (isPaid) - hanya admin
// router.put(
//   "/:id/payment-status",
//   authMiddleware,
//   permissionMiddleware("admin"), // Middleware untuk verifikasi admin
//   updatePaymentStatus
// );

// router.delete("/:id", authMiddleware, deleteTransaction);

// module.exports = router;

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
} = require("../middlewares/authHandler");

// /**
//  * @swagger
//  * /api/transactions:
//  *   post:
//  *     tags:
//  *       - Transactions
//  *     summary: Create new transaction
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - bookingId
//  *               - totalAmount
//  *               - paymentProof
//  *             properties:
//  *               bookingId:
//  *                 type: integer
//  *               totalAmount:
//  *                 type: number
//  *               paymentProof:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       201:
//  *         description: Transaction created successfully
//  *       401:
//  *         description: Unauthorized
//  *       400:
//  *         description: Invalid input data
//  */
// router.post(
//   "/",
//   authMiddleware,
//   uploadPaymentProof.single("paymentProof"),
//   createTransaction
// );

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get all transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   bookingId:
 *                     type: integer
 *                   totalAmount:
 *                     type: number
 *                   paymentProof:
 *                     type: string
 *                   isPaid:
 *                     type: boolean
 */
router.get("/", authMiddleware, getAllTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get transaction by ID
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
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get("/:id", authMiddleware, getTransactionById);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     tags:
 *       - Transactions
 *     summary: Update transaction
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *               totalAmount:
 *                 type: number
 *               paymentProof:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 */
router.put(
  "/:id",
  authMiddleware,
  uploadPaymentProof.single("paymentProof"),
  updateTransaction
);

/**
 * @swagger
 * /api/transactions/{id}/payment-status:
 *   put:
 *     tags:
 *       - Transactions
 *     summary: Update payment status (Admin only)
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
 *               - isPaid
 *             properties:
 *               isPaid:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Transaction not found
 */
router.put(
  "/:id/payment-status",
  authMiddleware,
  permissionMiddleware("admin"),
  updatePaymentStatus
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     tags:
 *       - Transactions
 *     summary: Delete transaction
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
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 */
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;
