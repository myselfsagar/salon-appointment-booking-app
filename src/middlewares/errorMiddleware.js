const { sendError } = require("../utils/responseHandler");
const { BaseError } = require("sequelize");
const ErrorHandler = require("../utils/errorHandler");

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  console.error("ERROR 💥", err);

  let error = { ...err };
  error.message = err.message;

  // Handle Sequelize validation errors
  if (err instanceof BaseError) {
    if (err.name === "SequelizeValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(". ");
      error = new ErrorHandler(message, 400);
    }
    if (err.name === "SequelizeUniqueConstraintError") {
      const message = `${Object.keys(err.fields)[0]} already exists.`;
      error = new ErrorHandler(message, 409);
    }
  }

  // Handle JWT errors
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Session expired, please sign in again", 401);
  } else if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token, please sign in", 401);
  }

  return sendError(res, error.message, error.statusCode);
};

module.exports = errorMiddleware;
