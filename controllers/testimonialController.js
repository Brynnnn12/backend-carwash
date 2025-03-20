const { Testimonial, User } = require("../models");
const { testimonialSchema } = require("../validations/testimonialValidations");

exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      include: {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
      },
    });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByPk(id, {
      include: { model: User, as: "user", attributes: ["id", "name", "email"] },
    });

    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil userId dari sesi user yang login
    const { rating, comment } = req.body;

    // Validasi input
    const { error } = testimonialSchema.validate({ rating, comment });
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    // Cek apakah user sudah memiliki testimonial
    const existingTestimonial = await Testimonial.findOne({
      where: { userId },
    });
    if (existingTestimonial) {
      return res.status(400).json({
        success: false,
        message: "Anda hanya bisa membuat satu testimonial",
      });
    }

    const testimonial = await Testimonial.create({ userId, rating, comment });
    res.status(201).json({
      success: true,
      data: testimonial,
      message: "Testimonial berhasil ditambahkan",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Validasi input
    const { error } = testimonialSchema.validate({ rating, comment });
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial tidak ditemukan" });
    }

    if (testimonial.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki izin untuk mengubah testimonial ini",
      });
    }

    await testimonial.update({ rating, comment });
    res.status(200).json({
      success: true,
      data: testimonial,
      message: "Testimonial berhasil diperbarui",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Ambil user yang login

    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial tidak ditemukan" });
    }

    // Cek apakah testimonial ini milik user yang sedang login
    if (testimonial.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki izin untuk menghapus testimonial ini",
      });
    }

    await testimonial.destroy();
    res
      .status(200)
      .json({ success: true, message: "Testimonial berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
