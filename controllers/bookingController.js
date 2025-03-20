const { Booking, ServicePrice } = require("../models");
const bookingSchema = require("../validations/bookingValidator");
const { Op } = require("sequelize");

exports.createBooking = async (req, res) => {
  try {
    // Ambil userId dari user yang sedang login
    const userId = req.user.id; // Pastikan middleware autentikasi mengisi req.user.id
    const { error, value } = bookingSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Cek jumlah booking user untuk hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setHours(23, 59, 59, 999);

    const bookingCount = await Booking.count({
      where: {
        userId: userId,
        createdAt: {
          [Op.between]: [today, tomorrow],
        },
      },
    });

    if (bookingCount >= 2) {
      return res.status(400).json({
        success: false,
        message:
          "Anda hanya dapat melakukan booking maksimal 2 kali dalam sehari.",
      });
    }

    // Pastikan servicePrice ada
    const servicePrice = await ServicePrice.findByPk(value.servicePriceId);
    if (!servicePrice) {
      return res.status(404).json({ message: "Service price not found" });
    }

    // Tambahkan userId dari user yang sedang login
    const newBooking = await Booking.create({
      ...value,
      userId: userId, // Isi userId otomatis
    });

    res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari booking berdasarkan ID
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Pastikan booking hanya bisa diupdate oleh user yang membuatnya
    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this booking",
      });
    }

    // Validasi input menggunakan Joi
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    // Update data booking
    await booking.update(value);

    res.status(200).json({
      status: "success",
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Pastikan user yang mengakses adalah admin
    if (req.user.role.name !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only admins can update booking status",
      });
    }

    // Cari booking berdasarkan ID
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Update status booking
    await booking.update({ status });

    res.status(200).json({
      status: "success",
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await booking.destroy();
    res.status(200).json({
      status: "success",
      message: "Booking deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
