const router = require("express").Router();
const userControllers = require("../controllers/user");
const { authMiddleware } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const schemas = require("../utils/validationSchemas");
const checkRole = require("../middlewares/checkRole");

router.get("/me", authMiddleware, userControllers.getMyProfile);

router.put(
  "/me",
  authMiddleware,
  validateRequest(schemas.updateUser),
  userControllers.updateMyProfile
);

router.get(
  "/",
  authMiddleware,
  checkRole("admin"),
  userControllers.getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  userControllers.getUserById
);

router.put(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  validateRequest(schemas.updateUser),
  userControllers.updateUserById
);

module.exports = router;
