const Joi = require("joi");

const profileSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  address: Joi.string().min(5).max(100).required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .required(),
  userId: Joi.required(),
});

module.exports = { profileSchema };
