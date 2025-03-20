const Joi = require("joi");

const bookingSchema = Joi.object({
  servicePriceId: Joi.string().uuid().required().messages({
    "any.required": "Service Price ID is required",
    "string.uuid": "Invalid Service Price ID format",
  }),
  bookingDate: Joi.date().greater("now").required().messages({
    "any.required": "Booking date is required",
    "date.greater": "Booking date cannot be in the past",
  }),
  bookingTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "any.required": "Booking time is required",
      "string.pattern.base": "Invalid time format (HH:mm required)",
    }),
  licensePlate: Joi.string().min(5).max(10).required().messages({
    "any.required": "License plate is required",
    "string.min": "License plate must be at least 5 characters",
    "string.max": "License plate cannot exceed 10 characters",
  }),
  status: Joi.string()
    .valid("pending", "confirmed", "completed", "canceled")
    .default("pending")
    .messages({
      "any.only": "Invalid status value",
    }),
});

module.exports = bookingSchema;
