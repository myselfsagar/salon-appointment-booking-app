const router = require("express").Router();
const staffController = require("../controllers/staff");
const { authMiddleware } = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const validateRequest = require("../middlewares/validateRequest");
const schemas = require("../utils/validationSchemas");

router.post(
  "/",
  authMiddleware,
  checkRole("admin"),
  validateRequest(schemas.createStaff),
  staffController.createStaffMember
);

module.exports = router;
