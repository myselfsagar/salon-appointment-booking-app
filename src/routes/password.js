const router = require("express").Router();
const passwordControllers = require("../controllers/password");

router.post("/forgotPassword", passwordControllers.sendPasswordResetEmail);
router.get("/resetPassword/:resetId", passwordControllers.verifyResetRequest);
router.post("/updatePassword", passwordControllers.updatepassword);

module.exports = router;
