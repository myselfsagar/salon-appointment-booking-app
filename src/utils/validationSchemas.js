const joi = require("joi");

const validationSchemas = {
  signup: joi.object({
    firstName: joi
      .string()
      .trim()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.base": `"firstName" should be a type of 'text'`,
        "string.empty": `"firstName" cannot be an empty field`,
        "string.min": `"firstName" should have a minimum length of {#limit}`,
        "any.required": `"firstName" is a required field`,
      }),
    lastName: joi
      .string()
      .trim()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.base": `"lastName" should be a type of 'text'`,
        "string.empty": `"lastName" cannot be an empty field`,
        "string.min": `"lastName" should have a minimum length of {#limit}`,
        "any.required": `"lastName" is a required field`,
      }),
    email: joi
      .string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": `"email" must be a valid email`,
        "any.required": `"email" is a required field`,
      }),
    phone: joi
      .string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits.",
        "any.required": "Phone number is required.",
      }),
    password: joi.string().min(6).required().messages({
      "string.min": `"password" should have a minimum length of {#limit}`,
      "any.required": `"password" is a required field`,
    }),
  }),

  login: joi.object({
    email: joi
      .string()
      .email({ tlds: { allow: false } })
      .required(),
    password: joi.string().required(),
  }),

  updateUser: joi.object({
    firstName: joi.string().trim().alphanum().min(3).max(30),
    lastName: joi.string().trim().alphanum().min(3).max(30),
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
    duration: joi.number().integer().min(1).required(),
    price: joi.number().min(0).required(),
    category: joi.string().required(),
  }),

  updateService: joi.object({
    name: joi.string(),
    description: joi.string(),
    duration: joi.number().integer().min(1),
    price: joi.number().min(0),
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
    availability: joi.object({
      weekly: joi.array().items(
        joi.object({
          day: joi.string().required(),
          isAvailable: joi.boolean().required(),
          slots: joi.array().items(
            joi.object({
              start: joi
                .string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
              end: joi
                .string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
            })
          ),
        })
      ),
      overrides: joi.array().items(
        joi.object({
          date: joi.date().iso().required(),
          isAvailable: joi.boolean().required(),
          slots: joi.array().items(
            joi.object({
              start: joi
                .string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
              end: joi
                .string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
            })
          ),
        })
      ),
    }),
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
    availability: joi.object({
      weekly: joi.array().items(
        joi.object({
          day: joi.string().required(),
          isAvailable: joi.boolean().required(),
          slots: joi.array().items(
            joi.object({
              start: joi
                .string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
              end: joi
                .string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
            })
          ),
        })
      ),
      overrides: joi.array().items(
        joi.object({
          date: joi.date().iso().required(),
          isAvailable: joi.boolean().required(),
          slots: joi.array().items(
            joi.object({
              start: joi
                .string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
              end: joi
                .string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required(),
            })
          ),
        })
      ),
    }),
  }),

  createAppointment: joi.object({
    serviceId: joi.number().integer().required(),
    appointmentDateTime: joi.date().iso().required(),
  }),
};

module.exports = validationSchemas;
