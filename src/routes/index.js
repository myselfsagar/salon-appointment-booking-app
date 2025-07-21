const router = require("express").Router();
const authRoutes = require("./auth");
const userRoutes = require("./user");
const serviceRoutes = require("./service");
const staffRoutes = require("./staff");
const appointmentRoutes = require("./appointment.js");
const passwordRoutes = require("./password.js");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/password", passwordRoutes);
router.use("/services", serviceRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/staff", staffRoutes);

module.exports = router;
