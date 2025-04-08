const Joi = require("joi");

const bookingSchema = Joi.object({
  servicePriceId: Joi.string().uuid().required().messages({
    "string.base": "ID harga layanan harus berupa teks",
    "string.guid": "ID harga layanan harus berupa UUID yang valid",
    "any.required": "ID harga layanan wajib diisi",
  }),
  bookingDate: Joi.date().greater("now").required().messages({
    "any.required": "Tanggal booking wajib diisi",
    "date.greater": "Tanggal booking tidak boleh di masa lalu",
  }),
  bookingTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "any.required": "Jam booking wajib diisi",
      "string.pattern.base": "Format jam tidak valid (gunakan format HH:mm)",
    }),
  licensePlate: Joi.string().min(5).max(10).required().messages({
    "any.required": "Plat nomor wajib diisi",
    "string.min": "Plat nomor minimal 5 karakter",
    "string.max": "Plat nomor maksimal 10 karakter",
  }),
});

module.exports = bookingSchema;
