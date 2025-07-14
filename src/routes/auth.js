const router = require("express").Router();
const authControllers = require("../controllers/auth");

router.post("/signup", authControllers.signupController);
router.post("/login", authControllers.loginController);
router.post("/logout", authControllers.logoutController);

module.exports = router;
