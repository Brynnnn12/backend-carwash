const { Booking, ServicePrice, User } = require("../models");
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
  const userId = req.user.id; // ✅ User ID dari user yang sedang login
  const { error, value } = bookingSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  const bookingCount = await Booking.count({
    where: { userId, createdAt: { [Op.between]: getTodayRange() } }, // ✅ Filter berdasarkan user yang login
  });

  if (bookingCount >= 2)
    return res
      .status(400)
      .json({ success: false, message: "Maksimal 2 booking per hari." });

  const servicePrice = await ServicePrice.findByPk(value.servicePriceId);
  if (!servicePrice)
    return res
      .status(404)
      .json({ success: false, message: "Service price not found" });

  const newBooking = await Booking.create({ ...value, userId }); // ✅ Booking dibuat atas nama user yang login

  return res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: newBooking,
  });
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const userId = req.user.id; // ✅ Ambil userId dari user yang sedang login

  const bookings = await Booking.findAll({
    where: { userId }, // ✅ Filter hanya booking milik user yang login
    include: [
      { model: User, as: "user", attributes: ["id", "username", "email"] },
      {
        model: ServicePrice,
        as: "servicePrice",
        attributes: ["id", "car_type", "price"],
      },
    ],
  });

  res.status(200).json({
    status: "success",
    message: "Bookings retrieved successfully",
    data: bookings,
  });
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // ✅ Ambil userId dari user yang login

  const booking = await Booking.findOne({
    where: { id, userId }, // ✅ Hanya ambil booking milik user
    include: [
      { model: User, as: "user", attributes: ["id", "username", "email"] },
      {
        model: ServicePrice,
        as: "servicePrice",
        attributes: ["id", "car_type", "price"],
      },
    ],
  });

  if (!booking) return res.status(404).json({ message: "Booking not found" });

  res.status(200).json({
    status: "success",
    message: "Booking retrieved successfully",
    data: booking,
  });
});

exports.updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // ✅ Ambil userId dari user yang login

  // Cari booking berdasarkan ID dan pastikan hanya milik user yang bisa diupdate
  const booking = await Booking.findOne({ where: { id, userId } });
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

  res.status(200).json({
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

  // ✅ Validasi status dengan Joi
  const { error } = bookingSchema.validate({ status });
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
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
  await booking.update({ status });

  res.status(200).json({
    status: "success",
    message: "Booking status updated successfully",
    data: booking,
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
      .json({ success: false, message: "Booking not found" });
  }

  // Hapus booking
  await booking.destroy();

  res.status(200).json({
    status: "success",
    message: "Booking deleted successfully",
  });
});
