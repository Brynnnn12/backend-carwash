const { Transaction } = require("../models");
const transactionSchema = require("../validations/transactionValidator");
const cloudinary = require("cloudinary").v2;
const asyncHandler = require("../middlewares/asyncHandler");

exports.getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findByPk(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      status: "fail",
      message: "Transaksi tidak ditemukan",
    });
  }

  // Pastikan hanya pemilik transaksi atau admin yang bisa mengakses
  if (transaction.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "Anda tidak memiliki izin untuk melihat transaksi ini",
    });
  }

  res.status(200).json({
    status: "success",
    transaction,
  });
});

// ✅ Membuat transaksi baru (hanya user yang login)
exports.createTransaction = asyncHandler(async (req, res) => {
  // Validasi input
  const { error, value } = transactionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message,
    });
  }

  if (!req.file) {
    return res.status(400).json({
      status: "fail",
      message: "Bukti pembayaran wajib diunggah",
    });
  }

  // ✅ Upload bukti pembayaran ke Cloudinary
  const imageResult = await cloudinary.uploader.upload(req.file.path, {
    folder: "carwash/payment_proofs",
  });

  // ✅ Simpan transaksi ke database
  const transaction = await Transaction.create({
    ...value,
    userId: req.user.id, // Pastikan userId berasal dari user yang login
    paymentProof: imageResult.secure_url,
    isPaid: false, // Default saat pertama kali dibuat
  });

  res.status(201).json({
    status: "success",
    message: "Transaksi berhasil dibuat",
    transaction,
  });
});

// ✅ Update transaksi (hanya pemilik atau admin)
exports.updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validasi input
  const { error, value } = transactionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message,
    });
  }

  // Cek transaksi
  const existingTransaction = await Transaction.findByPk(id);
  if (!existingTransaction) {
    return res.status(404).json({
      status: "fail",
      message: "Transaksi tidak ditemukan",
    });
  }

  // Pastikan hanya pemilik atau admin yang bisa update transaksi
  if (existingTransaction.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "Anda tidak memiliki izin untuk mengubah transaksi ini",
    });
  }

  const updateData = { ...value };

  // Jika ada file bukti pembayaran baru
  if (req.file) {
    // Upload ke Cloudinary
    const imageResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "carwash/payment_proofs",
    });
    updateData.paymentProof = imageResult.secure_url;

    // Hapus gambar lama jika ada
    if (existingTransaction.paymentProof) {
      const publicId = existingTransaction.paymentProof
        .split("/")
        .pop()
        .split(".")[0];
      await cloudinary.uploader.destroy(`carwash/payment_proofs/${publicId}`);
    }
  }

  // Hapus `isPaid` agar tidak bisa diubah langsung
  delete updateData.isPaid;

  // Update transaksi
  await existingTransaction.update(updateData);
  const updatedTransaction = await Transaction.findByPk(id);

  res.status(200).json({
    status: "success",
    message: "Transaksi berhasil diperbarui",
    transaction: updatedTransaction,
  });
});

// ✅ Update status pembayaran (hanya admin)
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPaid } = req.body;

  // Pastikan user adalah admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Unauthorized! Hanya admin yang bisa mengubah status pembayaran",
    });
  }

  // Cek transaksi
  const transaction = await Transaction.findByPk(id);
  if (!transaction) {
    return res.status(404).json({
      status: "fail",
      message: "Transaksi tidak ditemukan",
    });
  }

  // Konversi `isPaid` ke boolean
  const newIsPaidStatus = isPaid === "true" || isPaid === true;

  // Update status pembayaran
  await transaction.update({ isPaid: newIsPaidStatus });

  res.status(200).json({
    status: "success",
    message: "Status pembayaran berhasil diperbarui",
    transaction,
  });
});

// ✅ Hapus transaksi (hanya pemilik atau admin)
exports.deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Cek transaksi
  const transaction = await Transaction.findByPk(id);
  if (!transaction) {
    return res.status(404).json({
      status: "fail",
      message: "Transaksi tidak ditemukan",
    });
  }

  // Pastikan hanya pemilik atau admin yang bisa menghapus transaksi
  if (transaction.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "Anda tidak memiliki izin untuk menghapus transaksi ini",
    });
  }

  // Hapus bukti pembayaran dari Cloudinary jika ada
  if (transaction.paymentProof) {
    const publicId = transaction.paymentProof.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`carwash/payment_proofs/${publicId}`);
  }

  // Hapus transaksi dari database
  await transaction.destroy();

  res.status(200).json({
    status: "success",
    message: "Transaksi berhasil dihapus",
  });
});
