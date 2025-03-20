const { Service } = require("../models");
const { serviceSchema } = require("../validations/serviceValidator");

// Get all services
exports.getAll = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.status(200).json({
      success: true,
      message: "List of all services",
      data: services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
// Get service by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
// Create new service
exports.create = async (req, res) => {
  try {
    // Validate input
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
// Update service by ID
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
// Delete service by ID
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    await service.destroy();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
