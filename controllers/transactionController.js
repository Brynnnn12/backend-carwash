const { Transaction, Booking, ServicePrice, Service } = require("../models");
const transactionSchema = require("../validations/transactionValidator");
const cloudinary = require("cloudinary").v2;
const asyncHandler = require("../middlewares/asyncHandler");
const { paginate } = require("../utils/paginate");

exports.getTransactionById = asyncHandler(async (req, res) => {
  // Validasi user
  if (!req.user || !req.user.id || !req.user.role) {
    return res.status(401).json({
      status: "fail",
      message: "User tidak terautentikasi",
    });
  }

  // Ambil transaksi berdasarkan ID
  const transaction = await Transaction.findByPk(req.params.id, {
    include: {
      model: Booking,
      as: "booking",
      attributes: ["userId", "bookingDate", "licensePlate", "bookingTime"],
      include: {
        model: ServicePrice,
        as: "servicePrice",
        attributes: ["car_type", "price"],
        include: {
          model: Service,
          as: "service",
          attributes: ["name"],
        },
      },
    },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });

  // Jika transaksi tidak ditemukan
  if (!transaction) {
    return res.status(404).json({
      status: "fail",
      message: "Transaksi tidak ditemukan",
    });
  }

  // Hanya admin atau pemilik transaksi yang bisa mengakses
  if (transaction.booking.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "Anda tidak memiliki izin untuk melihat transaksi ini",
    });
  }

  // Response berhasil
  return res.status(200).json({
    status: "success",
    message: "Transaksi berhasil ditemukan",
    data: transaction,
  });
});

exports.getAllTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);

  const isAdmin = req.user.role.name === "admin";

  const whereBooking = isAdmin ? {} : { userId: req.user.id };

  const transactions = await paginate(Transaction, {
    page,
    limit,

    include: {
      model: Booking,
      as: "booking",
      attributes: ["bookingDate", "status"],
      where: whereBooking,
      include: {
        model: ServicePrice,
        as: "servicePrice",
        attributes: ["car_type", "price"],
        include: {
          model: Service,
          as: "service",
          attributes: ["name"],
        },
      },
    },
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });

  if (!transactions || transactions.data.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "Transaksi tidak ditemukan",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "Transaksi berhasil ditemukan",
    data: transactions.data,
    pagination: transactions.pagination,
  });
});

// ✅ Membuat transaksi baru (hanya user yang login)
// exports.createTransaction = asyncHandler(async (req, res) => {
//   // Validasi input
//   const { error, value } = transactionSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({
//       status: "fail",
//       message: error.details[0].message,
//     });
//   }

//   if (!req.file) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Bukti pembayaran wajib diunggah",
//     });
//   }

//   // ✅ Ambil harga dari service yang dipilih di Booking
//   const booking = await Booking.findByPk(value.bookingId, {
//     include: {
//       model: ServicePrice,
//       as: "servicePrice",
//     },
//   });

//   if (!booking) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Booking tidak ditemukan",
//     });
//   }

//   if (booking.userId !== req.user.id) {
//     return res.status(403).json({
//       status: "fail",
//       message: "Kamu tidak berhak mengakses booking ini",
//     });
//   }

//   // ✅ Cek apakah transaksi sudah ada untuk booking ini
//   const existingTransaction = await Transaction.findOne({
//     where: { bookingId: value.bookingId },
//   });

//   if (existingTransaction) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Transaksi untuk booking ini sudah dibuat",
//     });
//   }

//   const totalAmount = booking.servicePrice.price;

//   // ✅ Simpan transaksi ke database
//   const transaction = await Transaction.create({
//     bookingId: value.bookingId,
//     userId: req.user.id,
//     totalAmount, // Ambil dari harga service
//     paymentProof: req.file.path,
//     isPaid: false,
//   });

//   return res.status(201).json({
//     status: "success",
//     message: "Transaksi berhasil dibuat",
//     data: transaction,
//   });
// });

// ✅ Update transaksi (hanya pemilik atau admin)
exports.updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // ✅ Ambil user yang login
  console.log(userId);

  // Validasi input (pastikan schema juga nggak ada isPaid ya)
  const { error, value } = transactionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: error.details[0].message,
    });
  }

  const existingTransaction = await Transaction.findByPk(id, {
    include: {
      model: Booking,
      as: "booking",
      attributes: ["userId"],
    },
  });

  if (!existingTransaction) {
    return res.status(404).json({
      status: "fail",
      message: "Transaksi tidak ditemukan",
    });
  }

  // 🔒 Hanya user pemilik atau admin yang boleh update
  if (
    existingTransaction.booking.userId !== userId &&
    req.user.role?.name !== "admin"
  ) {
    return res.status(403).json({
      status: "fail",
      message: "Anda tidak memiliki izin untuk mengubah transaksi ini",
    });
  }

  console.log("Transaksi userId:", existingTransaction.userId);
  console.log("User login id:", userId);

  // Update transaksi
  const updateData = { ...value };

  // Jika ada file bukti pembayaran baru
  if (req.file) {
    updateData.paymentProof = req.file.path;

    // Hapus bukti lama dari Cloudinary
    if (existingTransaction.paymentProof) {
      const oldUrl = existingTransaction.paymentProof;
      const filename = oldUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`carwash/payment_proofs/${filename}`);
    }
  }

  // Langsung update tanpa perlu hapus isPaid lagi
  await existingTransaction.update(updateData);

  const updatedTransaction = await Transaction.findByPk(id);

  return res.status(200).json({
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
  if (req.user.role.name !== "admin") {
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

  return res.status(200).json({
    status: "success",
    message: "Status pembayaran berhasil diperbarui",
    data: transaction,
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
  if (transaction.userId !== req.user.id && req.user.role.name !== "admin") {
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

  return res.status(204).json({
    status: "success",
    message: "Transaksi berhasil dihapus",
  });
});
