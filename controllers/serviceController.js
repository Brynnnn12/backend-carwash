const asyncHandler = require("../middlewares/asyncHandler");
const { Service } = require("../models");
const { serviceSchema } = require("../validations/serviceValidator");

// Get all services
exports.getAll = asyncHandler(async (req, res) => {
  const services = await Service.findAll();
  res.status(200).json({
    success: true,
    message: "List of all services",
    data: services,
  });
});

// Get service by ID
exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findByPk(id);
  if (!service) {
    return res
      .status(404)
      .json({ success: false, message: "Service not found" });
  }
  res.status(200).json({ success: true, data: service });
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

  res.status(201).json({
    success: true,
    message: "Service created successfully",
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
      .json({ success: false, message: "Service not found" });
  }

  await service.update(req.body);
  res.status(200).json({
    success: true,
    message: "Service updated successfully",
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
      .json({ success: false, message: "Service not found" });
  }

  await service.destroy();
  res
    .status(200)
    .json({ success: true, message: "Service deleted successfully" });
});
