const router = require("express").Router();
const userControllers = require("../controllers/user");
const { authMiddleware } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const schemas = require("../utils/validationSchemas");

router.get("/me", authMiddleware, userControllers.getMyProfile);

router.put(
  "/me",
  authMiddleware,
  validateRequest(schemas.updateUser),
  userControllers.updateMyProfile
);

module.exports = router;
