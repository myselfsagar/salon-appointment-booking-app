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

router.get("/", authMiddleware, staffController.getAllStaffs);

router.get(
  "/:id",
  authMiddleware,
  checkRole("staff", "admin"),
  staffController.getStaffById
);

router.put(
  "/:id",
  authMiddleware,
  checkRole("staff", "admin"),
  validateRequest(schemas.updateStaff),
  staffController.updateStaff
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  staffController.deleteStaff
);

router.post(
  "/:staffId/services/:serviceId",
  authMiddleware,
  checkRole("admin"),
  staffController.assignService
);

router.delete(
  "/:staffId/services/:serviceId",
  authMiddleware,
  checkRole("admin"),
  staffController.unassignService
);

module.exports = router;
