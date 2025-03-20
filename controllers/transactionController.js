const { Transaction } = require("../models");
const transactionSchema = require("../validations/transactionValidator");
const cloudinary = require("cloudinary").v2;

const getransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        status: "fail",
        message: "Transaksi tidak ditemukan",
      });
    }
    res.status(200).json({
      status: "success",
      transaction,
    });
  } catch (error) {
    console.error("Error saat mengambil transaksi:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil transaksi",
    });
  }
};
const createTransaction = async (req, res) => {
  try {
    // Validasi input
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message, // Ambil pesan error pertama
      });
    }
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "Bukti pembayaran wajib diunggah",
      });
    }
    // Upload bukti pembayaran ke Cloudinary
    const imageResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "carwash/payment_proofs",
    });
    // Simpan transaksi ke database
    const transaction = await Transaction.create({
      ...value, // Menggunakan langsung hasil validasi
      paymentProof: imageResult.secure_url,
      isPaid: false, // Selalu false saat pembuatan
    });
    res.status(201).json({
      status: "success",
      message: "Transaksi berhasil dibuat",
      transaction,
    });
  } catch (error) {
    console.error("Error saat membuat transaksi:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi input jika ada
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    // Cek apakah transaksi ada
    const existingTransaction = await Transaction.findByPk(id);
    if (!existingTransaction) {
      return res.status(404).json({
        status: "fail",
        message: "Transaksi tidak ditemukan",
      });
    }

    // Persiapkan data update
    const updateData = { ...value };

    // Jika ada file bukti pembayaran baru
    if (req.file) {
      // Upload bukti pembayaran baru ke Cloudinary
      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "carwash/payment_proofs",
      });
      updateData.paymentProof = imageResult.secure_url;

      // Hapus gambar lama dari Cloudinary jika ada
      if (existingTransaction.paymentProof) {
        const publicId = existingTransaction.paymentProof
          .split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(`carwash/payment_proofs/${publicId}`);
      }
    }

    // Hapus isPaid agar tidak bisa diubah melalui endpoint ini
    delete updateData.isPaid;

    // Update transaksi
    await existingTransaction.update(updateData);

    // Ambil data terbaru
    const updatedTransaction = await Transaction.findByPk(id);

    res.status(200).json({
      status: "success",
      message: "Transaksi berhasil diperbarui",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error saat memperbarui transaksi:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid } = req.body;

    // Pastikan user adalah admin
    if (req.user.role.name !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only admins can update booking status",
      });
    }
    // Cek apakah transaksi ada
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({
        status: "fail",
        message: "Transaksi tidak ditemukan",
      });
    }

    // Konversi isPaid ke boolean
    const newIsPaidStatus = isPaid === "true" || isPaid === true;

    // Update status pembayaran
    await transaction.update({ isPaid: newIsPaidStatus });

    res.status(200).json({
      status: "success",
      message: "Status pembayaran berhasil diperbarui",
      transaction,
    });
  } catch (error) {
    console.error("Error saat memperbarui status pembayaran:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah transaksi ada
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({
        status: "fail",
        message: "Transaksi tidak ditemukan",
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
  } catch (error) {
    console.error("Error saat menghapus transaksi:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  updateTransaction,
  updatePaymentStatus, // Tambahkan fungsi ini ke exports
  deleteTransaction,
  getransactionById,
};
