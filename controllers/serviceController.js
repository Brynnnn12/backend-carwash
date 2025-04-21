const asyncHandler = require("../middlewares/asyncHandler");
const { Service } = require("../models");
const { paginate } = require("../utils/paginate");
const { serviceSchema } = require("../validations/serviceValidator");

// Get all services
exports.getAll = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);

  const result = await paginate(Service, {
    page,
    limit,
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });

  if (!result || result.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Tidak ada layanan yang ditemukan",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Semua layanan berhasil ditemukan",
    data: result.data,
    pagination: result.pagination,
  });
});

// Get service by ID
exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findByPk(id);
  if (!service) {
    return res
      .status(404)
      .json({ success: false, message: "Service tidak ditemukan" });
  }
  return res.status(200).json({
    success: true,
    message: "Detail layanan berhasil ditemukan",
    data: service,
  });
});

// Create new service
exports.create = asyncHandler(async (req, res) => {
  const { error } = serviceSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { name, description, price } = req.body;
  const newService = await Service.create({ name, description, price });

  return res.status(201).json({
    success: true,
    message: "Service berhasil dibuat",
    data: newService,
  });
});

// Update service by ID
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = serviceSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const service = await Service.findByPk(id);
  if (!service) {
    return res
      .status(404)
      .json({ success: false, message: "Service tidak ditemukan" });
  }

  await service.update(req.body);
  return res.status(200).json({
    success: true,
    message: "Service berhasil diperbarui",
    data: service,
  });
});

// Delete service by ID
exports.deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findByPk(id);
  if (!service) {
    return res
      .status(404)
      .json({ success: false, message: "Service tidak ditemukan" });
  }

  await service.destroy();
  return res
    .status(204)
    .json({ success: true, message: "Service berhasil dihapus" });
});
