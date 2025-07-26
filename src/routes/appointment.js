const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const appointmentController = require("../controllers/appointment");
const checkRole = require("../middlewares/checkRole");
const validateRequest = require("../middlewares/validateRequest");
const schemas = require("../utils/validationSchemas");

router.get("/me", authMiddleware, appointmentController.getMyAppointments);

router.get("/slots", authMiddleware, appointmentController.getAvailableSlots);

router.post(
  "/",
  authMiddleware,
  validateRequest(schemas.createAppointment),
  appointmentController.createAppointment
);

router.get("/:id", authMiddleware, appointmentController.getAppointmentById);

router.get(
  "/",
  authMiddleware,
  checkRole("admin", "staff"),
  appointmentController.getAllAppointmentsAdmin
);

module.exports = router;
