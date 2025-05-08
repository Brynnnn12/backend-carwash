const {
  Booking,
  ServicePrice,
  Transaction,
  Profile,
  User,
  Service,
} = require("../models");
const bookingSchema = require("../validations/bookingValidator");
const { Op } = require("sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date();
  tomorrow.setHours(23, 59, 59, 999);
  return [today, tomorrow];
};

// exports.createBooking = asyncHandler(async (req, res) => {
//   const userId = req.user.id;
//   const { error, value } = bookingSchema.validate(req.body);
//   if (error)
//     return res
//       .status(400)
//       .json({ success: false, message: error.details[0].message });

//   const bookingCount = await Booking.count({
//     where: { userId, createdAt: { [Op.between]: getTodayRange() } },
//   });

//   if (bookingCount >= 2)
//     return res
//       .status(400)
//       .json({ success: false, message: "Maksimal 2 booking per hari." });

//   const servicePrice = await ServicePrice.findByPk(value.servicePriceId);
//   if (!servicePrice)
//     return res
//       .status(404)
//       .json({ success: false, message: "Service price tidak ditemukan" });

//   if (value.licensePlate) {
//     const existingBooking = await Booking.findOne({
//       where: {
//         licensePlate: value.licensePlate,
//         createdAt: { [Op.between]: getTodayRange() },
//       },
//     });

//     if (existingBooking)
//       return res.status(400).json({
//         success: false,
//         message: "Plat nomor sudah digunakan hari ini",
//       });
//   }

//   const newBooking = await Booking.create({
//     ...value,
//     userId,
//     servicePriceId: value.servicePriceId,
//     status: "pending",
//   });

//   //transaksi otomatis dibuat

//   return res.status(201).json({
//     success: true,
//     message: "Booking berhasil dibuat",
//     data: newBooking,
//   });
// });
exports.createBooking = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { error, value } = bookingSchema.validate(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  const bookingCount = await Booking.count({
    where: { userId, createdAt: { [Op.between]: getTodayRange() } },
  });

  if (bookingCount >= 2)
    return res.status(400).json({
      success: false,
      message: "Maksimal 2 booking per hari.",
    });

  const servicePrice = await ServicePrice.findByPk(value.servicePriceId);
  if (!servicePrice)
    return res.status(404).json({
      success: false,
      message: "Service price tidak ditemukan",
    });

  if (value.licensePlate) {
    const existingBooking = await Booking.findOne({
      where: {
        licensePlate: value.licensePlate,
        createdAt: { [Op.between]: getTodayRange() },
      },
    });

    if (existingBooking)
      return res.status(400).json({
        success: false,
        message: "Plat nomor sudah digunakan hari ini",
      });
  }

  // Buat Booking
  const newBooking = await Booking.create({
    ...value,
    userId,
    servicePriceId: value.servicePriceId,
    status: "pending",
  });

  // Buat Transaction otomatis
  const totalAmount = servicePrice.price;
  const existingTransaction = await Transaction.findOne({
    where: { bookingId: newBooking.id },
  });

  if (!existingTransaction) {
    await Transaction.create({
      bookingId: newBooking.id,
      userId,
      totalAmount,
      isPaid: false,
      paymentProof: null, // Belum diupload
    });
  }

  return res.status(201).json({
    success: true,
    message: "Booking & transaksi berhasil dibuat",
    data: newBooking,
  });
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role?.name === "admin";

  const queryOptions = {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["username", "email"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["name", "phoneNumber", "address"],
          },
        ],
      },
      {
        model: ServicePrice,
        as: "servicePrice",
        attributes: ["car_type", "price"],
        include: [
          {
            model: Service,
            as: "service",
            attributes: ["name"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  };

  if (!isAdmin) {
    queryOptions.where = { userId: req.user.id };
  }

  const bookings = await Booking.findAll(queryOptions);

  return res.status(200).json({
    status: "success",
    message: "Daftar booking berhasil ditemukan",
    data: bookings,
  });
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user.role?.name === "admin";
  const userId = req.user.id;

  const booking = await Booking.findOne({
    where: isAdmin ? { id } : { id, userId }, // ⬅️ Admin bisa ambil booking siapa saja
    include: [
      {
        model: User,
        as: "user",
        attributes: ["username", "email"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["name", "phoneNumber", "address"],
          },
        ],
      },
      {
        model: ServicePrice,
        as: "servicePrice",
        attributes: ["car_type", "price"],
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });

  if (!booking) return res.status(404).json({ message: "Booking not found" });

  return res.status(200).json({
    status: "success",
    message: "Booking berhasil ditemukan",
    data: booking,
  });
});

exports.updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // ✅ Ambil userId dari user yang login

  // Cari booking berdasarkan ID dan pastikan hanya milik user yang bisa diupdate
  const booking = await Booking.findOne({
    where: { id, userId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["username"],
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });
  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  }

  // Validasi input menggunakan Joi
  const { error, value } = bookingSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  // Update booking
  await booking.update(value);

  return res.status(204).json({
    status: "success",
    message: "Booking updated successfully",
    data: booking,
  });
});

exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // ✅ Hanya admin yang bisa update status booking
  if (req.user.role.name !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Unauthorized! Only admins can update booking status",
    });
  }

  // ✅ Cek apakah booking ada
  const booking = await Booking.findByPk(id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  // ✅ Update status booking
  // ✅ Update status booking
  await booking.update({ status });

  // ✅ Ambil ulang booking lengkap dengan user + profile
  const updatedBooking = await Booking.findByPk(id, {
    include: [
      {
        model: User,
        as: "user", // <-- WAJIB ditulis
        include: [
          {
            model: Profile,
            as: "profile", // kalau pakai alias juga
          },
        ],
      },
    ],
  });

  return res.status(200).json({
    status: "success",
    message: "Booking status updated successfully",
    data: updatedBooking,
  });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user.role?.name === "admin";
  const userId = req.user.id;

  // Cari booking, admin bisa hapus semua, user hanya milik sendiri
  const booking = await Booking.findOne({
    where: isAdmin ? { id } : { id, userId },
  });

  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: "Booking tidak ditemukan" });
  }

  await booking.destroy();

  return res.status(200).json({
    success: true,
    message: "Booking berhasil dihapus",
  });
});
