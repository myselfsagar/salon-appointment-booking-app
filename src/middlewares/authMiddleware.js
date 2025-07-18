const jwt = require("jsonwebtoken");
const userServices = require("../services/dbCall.js/userServices");
const { sendError } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

exports.authMiddleware = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization?.startsWith("Bearer ")) {
    throw new ErrorHandler("Unauthorized, token missing", 401);
  }

  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

  const user = await userServices.getUserById(decoded.userId);

  req.user = user;
  next();
});
