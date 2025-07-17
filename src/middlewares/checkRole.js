const ErrorHandler = require("../utils/errorHandler");

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ErrorHandler(
        `Role (${req.user.role}) is not authorized to access this resource`,
        403
      );
    }
    next();
  };
};

module.exports = checkRole;
