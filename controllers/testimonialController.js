const { testimonialSchema } = require("../validations/testimonialValidations");
const asyncHandler = require("../middlewares/asyncHandler");
const paginate = require("../utils/paginate");
const { Testimonial, User, Profile } = require("../models");

exports.getAllTestimonials = asyncHandler(async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1); // Pastikan page minimal 1
    const limit = Math.max(1, parseInt(req.query.limit) || 10); // Pastikan limit minimal 1

    const testimonials = await paginate(Testimonial, {
      page,
      limit,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
          include: [
            {
              model: Profile,
              as: "profile",
              attributes: ["avatar"], // Ambil avatar dari Profile
            },
          ],
        },
      ],
    });

    if (!testimonials || testimonials.data.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No testimonials found" });
    }

    res.json({ success: true, ...testimonials });
  } catch (error) {
    next(error); // Kirim error ke middleware error handler
  }
});

exports.getTestimonialById = asyncHandler(async (req, res) => {
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
});

exports.createTestimonial = asyncHandler(async (req, res) => {
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
});

exports.updateTestimonial = asyncHandler(async (req, res) => {
  const { error, value } = testimonialSchema.validate(req.body);
  if (error) throw new Error(error.details[0].message);

  // Cari testimonial milik user berdasarkan userId dari token
  const testimonial = await Testimonial.findOne({
    where: { userId: req.user.id },
  });
  if (!testimonial) throw new Error("Testimonial tidak ditemukan");

  await testimonial.update(value);
  res.json({
    success: true,
    data: testimonial,
    message: "Testimonial diperbarui",
  });
});

exports.deleteTestimonial = asyncHandler(async (req, res) => {
  // Cari testimonial berdasarkan userId dari token
  const testimonial = await Testimonial.findOne({
    where: { userId: req.user.id },
  });
  if (!testimonial) throw new Error("Testimonial tidak ditemukan");

  await testimonial.destroy(); // Hapus testimonial
  res.json({
    success: true,
    message: "Testimonial berhasil dihapus",
  });
});
