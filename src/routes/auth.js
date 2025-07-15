const router = require("express").Router();
const authControllers = require("../controllers/auth");
const validateRequest = require("../middlewares/validateRequest");
const schemas = require("../utils/validationSchemas");

router.post(
  "/signup",
  validateRequest(schemas.signup),
  authControllers.signupController
);
router.post(
  "/login",
  validateRequest(schemas.login),
  authControllers.loginController
);
router.post("/logout", authControllers.logoutController);

module.exports = router;
