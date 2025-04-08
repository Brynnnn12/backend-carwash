const Joi = require("joi");

const transactionSchema = Joi.object({
  bookingId: Joi.string().uuid().required().messages({
    "string.base": "Booking ID harus berupa string",
    "string.guid": "Booking ID harus berupa UUID yang valid",
    "any.required": "Booking ID diperlukan",
  }),
});

module.exports = transactionSchema;
