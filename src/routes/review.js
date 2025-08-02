const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const reviewController = require("../controllers/review");

router.post("/", authMiddleware, reviewController.createReview);
router.get("/service/:serviceId", reviewController.getServiceReviews);

module.exports = router;
