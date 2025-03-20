const Joi = require("joi");

const transactionSchema = Joi.object({
  bookingId: Joi.string().uuid().required().messages({
    "string.base": "Booking ID harus berupa string",
    "string.guid": "Booking ID harus berupa UUID yang valid",
    "any.required": "Booking ID diperlukan",
  }),
  totalAmount: Joi.number().precision(2).positive().required().messages({
    "number.base": "Total amount harus berupa angka",
    "number.positive": "Total amount harus bernilai positif",
    "any.required": "Total amount diperlukan",
  }),
  isPaid: Joi.boolean().required().messages({
    "boolean.base": "isPaid harus berupa nilai boolean",
    "any.required": "isPaid diperlukan",
  }),
});

module.exports = transactionSchema;
