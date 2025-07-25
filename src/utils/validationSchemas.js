const joi = require("joi");

const validationSchemas = {
  signup: joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    phone: joi
      .string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits.",
        "any.required": "Phone number is required.",
      }),
    password: joi.string().min(6).required(),
  }),
  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),
  updateUser: joi.object({
    firstName: joi.string(),
    lastName: joi.string(),
    phone: joi
      .string()
      .pattern(/^[0-9]{10}$/)
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits.",
      }),
  }),
  createService: joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    duration: joi.number().required(),
    price: joi.number().required(),
    category: joi.string().required(),
  }),
  updateService: joi.object({
    name: joi.string(),
    description: joi.string(),
    duration: joi.number(),
    price: joi.number(),
    category: joi.string(),
  }),
  createStaff: joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    phone: joi
      .string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits.",
      }),
    specialization: joi.string().allow(""),
    availability: joi.object(),
  }),
  updateStaff: joi.object({
    firstName: joi.string(),
    lastName: joi.string(),
    email: joi.string().email(),
    phone: joi
      .string()
      .pattern(/^[0-9]{10}$/)
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits.",
      }),
    specialization: joi.string().allow(""),
    availability: joi.object(),
  }),
  createAppointment: joi.object({
    serviceId: joi.number().integer().required(),
    appointmentDateTime: joi.date().iso().required(),
  }),
};

module.exports = validationSchemas;
