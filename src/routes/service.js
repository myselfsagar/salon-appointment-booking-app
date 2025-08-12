const router = require("express").Router();
const serviceControllers = require("../controllers/service");
const { authMiddleware } = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const validateRequest = require("../middlewares/validateRequest");
const schemas = require("../utils/validationSchemas");

router.post(
  "/",
  authMiddleware,
  checkRole("staff", "admin"),
  validateRequest(schemas.createService),
  serviceControllers.createService
);

router.get("/", serviceControllers.getAllServices);

router.get("/:id", authMiddleware, serviceControllers.getServiceById);

router.put(
  "/:id",
  authMiddleware,
  checkRole("staff", "admin"),
  validateRequest(schemas.updateService),
  serviceControllers.updateService
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  serviceControllers.deleteService
);

module.exports = router;
