const router = require("express").Router();
const serviceControllers = require("../controllers/service");
const { authMiddleware } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const schemas = require("../utils/validationSchemas");

router.post(
  "/",
  authMiddleware,
  validateRequest(schemas.createService),
  serviceControllers.createService
);

router.get("/", authMiddleware, serviceControllers.getAllServices);

router.get("/:id", authMiddleware, serviceControllers.getServiceById);

router.put(
  "/:id",
  authMiddleware,
  validateRequest(schemas.updateService),
  serviceControllers.updateService
);

router.delete("/:id", authMiddleware, serviceControllers.deleteService);

module.exports = router;
