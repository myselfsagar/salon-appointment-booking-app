const router = require("express").Router();
const authRoutes = require("./auth");
const userRoutes = require("./user");
const serviceRoutes = require("./service");
const staffRoutes = require("./staff");
const appointmentRoutes = require("./appointment.js");
const paymentRoutes = require("./payment.js");
const passwordRoutes = require("./password.js");
const reviewRoutes = require("./review.js");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/password", passwordRoutes);
router.use("/services", serviceRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/staff", staffRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);

module.exports = router;
