const { sendError } = require("../utils/responseHandler");

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  console.error("ERROR 💥", err);

  return sendError(res, err.message, err.statusCode);
};

module.exports = errorMiddleware;
