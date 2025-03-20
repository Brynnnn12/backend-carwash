const Joi = require("joi");

const servicePriceSchema = Joi.object({
  serviceId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.empty": "Service ID tidak boleh kosong.",
      "string.guid": "Service ID harus berupa UUID.",
    }),

  car_type: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Tipe kendaraan tidak boleh kosong.",
      "string.min": "Tipe kendaraan minimal 2 karakter.",
      "string.max": "Tipe kendaraan maksimal 50 karakter.",
    }),

  price: Joi.number()
    .integer()
    .min(10000)
    .required()
    .messages({
      "number.base": "Harga harus berupa angka.",
      "number.integer": "Harga harus berupa angka bulat.",
      "number.min": "Harga minimal adalah 10000.",
    }),
});

module.exports = { servicePriceSchema };
