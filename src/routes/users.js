const router = require("express").Router();
const userControllers = require("../controllers/users");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get("/me", authMiddleware, userControllers.getMyProfile);
router.put("/me", authMiddleware, userControllers.updateMyProfile);

module.exports = router;
