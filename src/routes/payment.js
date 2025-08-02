const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/payment");

// This route creates a Razorpay order and links it to a pending appointment
router.post(
  "/create-order",
  authMiddleware,
  paymentController.createRazorpayOrder
);

// This route verifies the payment signature from Razorpay to confirm the booking
router.post("/verify-payment", authMiddleware, paymentController.verifyPayment);

module.exports = router;
