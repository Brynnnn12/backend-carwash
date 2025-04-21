const { Booking, ServicePrice, Profile, User, Service } = require("../models");
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

exports.createBooking = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { error, value } = bookingSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  const bookingCount = await Booking.count({
    where: { userId, createdAt: { [Op.between]: getTodayRange() } },
  });

  if (bookingCount >= 2)
    return res
      .status(400)
      .json({ success: false, message: "Maksimal 2 booking per hari." });

  const servicePrice = await ServicePrice.findByPk(value.servicePriceId);
  if (!servicePrice)
    return res
      .status(404)
      .json({ success: false, message: "Service price tidak ditemukan" });

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

  const newBooking = await Booking.create({
    ...value,
    userId,
    servicePriceId: value.servicePriceId,
    status: "pending",
  });

  return res.status(201).json({
    success: true,
    message: "Booking berhasil dibuat",
    data: newBooking,
  });
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const userId = req.user.id; // ✅ Ambil userId dari user yang sedang login

  const bookings = await Booking.findAll({
    where: { userId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["username", "email"],
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
  });

  return res.status(200).json({
    status: "success",
    message: "Booking berhasil ditemukan",
    data: bookings,
  });
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // ✅ Ambil userId dari user yang login

  const booking = await Booking.findOne({
    where: { id, userId }, // ✅ Hanya ambil booking milik user
    include: [
      {
        model: User,
        as: "user",
        attributes: ["username", "email"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["name", "phoneNumber", "address"], // atau field lain yg kamu butuh
          },
        ],
      },
      {
        model: ServicePrice,
        as: "servicePrice",
        attributes: ["car_type", "price"],
      },
    ],
    order: [["createdAt", "DESC"]],
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
  const userId = req.user.id; // ✅ Ambil userId dari user yang login

  // Cari booking berdasarkan ID dan pastikan hanya user terkait yang bisa menghapusnya
  const booking = await Booking.findOne({ where: { id, userId } });
  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: "Booking tidak ditemukan" });
  }

  // Hapus booking
  await booking.destroy();

  return res.status(204).json({
    status: "success",
    message: "Booking berhasil dihapus",
  });
});
