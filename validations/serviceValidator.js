const Joi = require("joi");

const serviceSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/) // Hanya huruf dan spasi
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.base": "Nama harus berupa teks.",
      "string.empty": "Nama tidak boleh kosong.",
      "string.min": "Nama minimal 3 karakter.",
      "string.max": "Nama maksimal 50 karakter.",
      "string.pattern.base": "Nama hanya boleh berisi huruf dan spasi.",
    }),

  description: Joi.string()
    .trim()
    .min(5)
    .max(255) // Menambah panjang maksimal
    .required()
    .messages({
      "string.empty": "Deskripsi tidak boleh kosong.",
      "string.min": "Deskripsi minimal 5 karakter.",
      "string.max": "Deskripsi maksimal 255 karakter.",
    }),

  price: Joi.number()
    .positive() // Tidak boleh negatif atau nol
    .min(20000) // Harga minimal 20.000
    .precision(2) // Maksimal 2 angka desimal
    .required()
    .messages({
      "number.base": "Harga harus berupa angka.",
      "number.positive": "Harga harus lebih dari 0.",
      "number.min": "Harga minimal adalah 20.000.",
      "number.precision": "Harga maksimal 2 angka desimal.",
    }),
});

module.exports = { serviceSchema };
