const { ServicePrice, Service } = require("../models");
const { servicePriceSchema } = require("../validations/servicePriceValidator");

const createServicePrice = async (req, res) => {
  try {
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
      message: "Harga layanan berhasil ditambahkan",
      data: newServicePrice,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getAllServicePrices = async (req, res) => {
  try {
    const servicePrices = await ServicePrice.findAll({ include: "service" });
    return res.status(200).json(servicePrices);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getServicePriceById = async (req, res) => {
  try {
    const { id } = req.params;
    const servicePrice = await ServicePrice.findByPk(id, {
      include: "service",
    });

    if (!servicePrice) {
      return res.status(404).json({ error: "Harga layanan tidak ditemukan" });
    }

    return res.status(200).json(servicePrice);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateServicePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceId, car_type, price } = req.body;

    const servicePrice = await ServicePrice.findByPk(id);
    // console.log("ServicePrice ditemukan:", servicePrice);
    if (!servicePrice) {
      return res.status(404).json({ error: "Harga layanan tidak ditemukan" });
    }

    const { error } = servicePriceSchema.validate({
      serviceId,
      car_type,
      price,
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await ServicePrice.update(
      { serviceId, car_type, price },
      { where: { id } }
    );
    return res
      .status(200)
      .json({ message: "Harga layanan berhasil diperbarui" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteServicePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const servicePrice = await ServicePrice.findByPk(id);

    if (!servicePrice) {
      return res.status(404).json({ error: "Harga layanan tidak ditemukan" });
    }

    await servicePrice.destroy();
    return res.status(200).json({ message: "Harga layanan berhasil dihapus" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createServicePrice,
  getAllServicePrices,
  getServicePriceById,
  updateServicePrice,
  deleteServicePrice,
};
