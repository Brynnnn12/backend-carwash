const Joi = require("joi");

const profileSchema = Joi.object({
  name: Joi.string()
    .trim() // Menghapus spasi di awal dan akhir
    .pattern(/^[a-zA-Z\s]+$/) // Hanya huruf dan spasi
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.base": "Nama harus berupa teks.",
      "string.empty": "Nama tidak boleh kosong.",
      "string.min": "Nama minimal 3 karakter.",
      "string.max": "Nama maksimal 50 karakter.",
      "string.pattern.base": "Nama hanya boleh mengandung huruf dan spasi.",
      "any.required": "Nama wajib diisi.",
    }),

  address: Joi.string().trim().min(5).max(100).required().messages({
    "string.base": "Alamat harus berupa teks.",
    "string.empty": "Alamat tidak boleh kosong.",
    "string.min": "Alamat minimal 5 karakter.",
    "string.max": "Alamat maksimal 100 karakter.",
    "any.required": "Alamat wajib diisi.",
  }),

  phoneNumber: Joi.string()
    .trim()
    .pattern(/^(?:\+62|62|0)[0-9]{9,13}$/) // Format nomor Indonesia
    .required()
    .messages({
      "string.base": "Nomor telepon harus berupa teks.",
      "string.empty": "Nomor telepon tidak boleh kosong.",
      "string.pattern.base":
        "Nomor telepon harus diawali dengan +62, 62, atau 0 dan memiliki panjang 10-15 digit.",
      "any.required": "Nomor telepon wajib diisi.",
    }),
});

module.exports = { profileSchema };
