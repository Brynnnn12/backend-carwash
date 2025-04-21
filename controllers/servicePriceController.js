const { ServicePrice, Service } = require("../models");
const { servicePriceSchema } = require("../validations/servicePriceValidator");
const asyncHandler = require("../middlewares/asyncHandler");
const { paginate } = require("../utils/paginate");

exports.createServicePrice = asyncHandler(async (req, res) => {
  // Destrukturisasi req.body
  const { serviceId, car_type, price } = req.body;

  // Validasi input dengan Joi
  const { error } = servicePriceSchema.validate({
    serviceId,
    car_type,
    price,
  });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Cek apakah serviceId ada dalam database
  const service = await Service.findByPk(serviceId);
  if (!service) {
    return res.status(404).json({ error: "Service tidak ditemukan" });
  }

  // Simpan data ke database
  const newServicePrice = await ServicePrice.create({
    serviceId,
    car_type,
    price,
  });
  return res.status(201).json({
    success: true,
    message: "Harga layanan berhasil ditambahkan",
    data: newServicePrice,
  });
});

exports.getAllServicePrices = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);

  const servicePrices = await paginate(ServicePrice, {
    page,
    limit,
    include: [
      {
        model: Service,
        as: "service",
        attributes: ["name"],
      },
    ],
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["createdAt", "updatedAt", "serviceId"],
    },
  });
  if (!servicePrices || servicePrices.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Tidak ada harga layanan yang ditemukan",
    });
  }
  return res.status(200).json({
    success: true,
    message: "List harga layanan",
    data: servicePrices.data,
    pagination: servicePrices.pagination,
  });
});

exports.getServicePriceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const servicePrice = await ServicePrice.findByPk(id, {
    include: "service",
  });

  if (!servicePrice) {
    return res.status(404).json({ error: "Harga layanan tidak ditemukan" });
  }

  return res.status(200).json({
    success: true,
    message: "Detail harga layanan",
    data: servicePrice,
  });
});

exports.updateServicePrice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { serviceId, car_type, price } = req.body;

  const servicePrice = await ServicePrice.findByPk(id);
  if (!servicePrice) {
    res.status(404);
    throw new Error("Harga layanan tidak ditemukan");
  }

  const { error } = servicePriceSchema.validate({ serviceId, car_type, price });
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  await servicePrice.update({ serviceId, car_type, price });

  res.status(200).json({
    success: true,
    message: "Harga layanan berhasil diperbarui",
    data: servicePrice,
  });
});

exports.deleteServicePrice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const servicePrice = await ServicePrice.findByPk(id);

  if (!servicePrice) {
    return res.status(404).json({ error: "Harga layanan tidak ditemukan" });
  }

  await servicePrice.destroy();
  return res.status(204).json({
    success: true,
    message: "Harga layanan berhasil dihapus",
  });
});
