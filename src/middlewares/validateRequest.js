const { sendError } = require("../utils/responseHandler");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: true });

    if (error) {
      return sendError(res, error.details[0].message, 400);
    }

    next();
  };
};

module.exports = validateRequest;
