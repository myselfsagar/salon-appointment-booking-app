const router = require("express").Router();
const authRoutes = require("./auth");
const userRoutes = require("./user");
const serviceRoutes = require("./service");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/services", serviceRoutes);

module.exports = router;
