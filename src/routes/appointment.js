const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const appointmentController = require("../controllers/appointment");
const validateRequest = require("../middlewares/validateRequest");
const schemas = require("../utils/validationSchemas");

router.get("/slots", authMiddleware, appointmentController.getAvailableSlots);

router.post(
  "/",
  authMiddleware,
  validateRequest(schemas.createAppointment),
  appointmentController.createAppointment
);

router.get("/:id", authMiddleware, appointmentController.getAppointmentById);

module.exports = router;
