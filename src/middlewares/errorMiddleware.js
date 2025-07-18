const { sendError } = require("../utils/responseHandler");

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  console.error("ERROR 💥", err);

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Session expired, please sign in again", 401);
  } else if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token, please sign in", 401);
  }

  return sendError(res, err.message, err.statusCode);
};

module.exports = errorMiddleware;
