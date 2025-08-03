const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const reviewController = require("../controllers/review");

// Public and Customer Routes
router.post("/", authMiddleware, reviewController.createReview);
router.get("/service/:serviceId", reviewController.getServiceReviews);

// Admin & Staff Routes
router.get(
  "/",
  authMiddleware,
  checkRole("admin", "staff"),
  reviewController.getAllReviews
);

router.patch(
  "/:reviewId/respond",
  authMiddleware,
  checkRole("admin", "staff"),
  reviewController.addStaffResponse
);

module.exports = router;
