const jwt = require("jsonwebtoken");
const userServices = require("../services/dbCall.js/userServices");
const { sendError } = require("../utils/responseHandler");

exports.authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization?.startsWith("Bearer ")) {
      return sendError(res, "Unauthorized, token missing", 401);
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

    const user = await userServices.getUserById(decoded.userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Session expired, please sign in again", 401);
    } else if (error.name === "JsonWebTokenError") {
      return sendError(res, "Invalid token, please sign in", 401);
    } else {
      console.log("Unexpected Authentication Error::", error);
      sendError(res, `Internal Server Error - ${error.message}`);
    }
  }
};
