const Joi = require("joi");

const testimonialSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.base": "Rating harus berupa angka",
    "number.integer": "Rating harus berupa bilangan bulat",
    "number.min": "Rating minimal adalah 1",
    "number.max": "Rating maksimal adalah 5",
    "any.required": "Rating wajib diisi",
  }),
  comment: Joi.string().min(3).required().messages({
    "string.empty": "Komentar wajib diisi",
    "string.min": "Komentar minimal harus memiliki 3 karakter",
    "any.required": "Komentar tidak boleh kosong",
  }),
});

module.exports = { testimonialSchema };
