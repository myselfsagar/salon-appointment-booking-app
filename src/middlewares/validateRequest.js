const { sendError } = require("../utils/responseHandler");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      errors: {
        wrap: {
          label: "",
        },
      },
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", ");
      return sendError(res, errorMessages, 400);
    }

    next();
  };
};

module.exports = validateRequest;
