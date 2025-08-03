const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const Appointment = require("../models/Appointment");
const Review = require("../models/Review");
const User = require("../models/User");
const Service = require("../models/Service");

// @desc    Create a new review
// @route   POST /reviews
const createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, appointmentId } = req.body;
  const customerId = req.user.id;

  // 1. Find the appointment
  const appointment = await Appointment.findByPk(appointmentId);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found.", 404));
  }

  // 2. Check if the review is valid
  if (appointment.customerId !== customerId) {
    return next(
      new ErrorHandler("You can only review your own appointments.", 403)
    );
  }
  if (appointment.status !== "completed") {
    return next(
      new ErrorHandler("You can only review completed appointments.", 400)
    );
  }

  // 3. Check if a review already exists for this appointment
  const existingReview = await Review.findOne({ where: { appointmentId } });
  if (existingReview) {
    return next(
      new ErrorHandler("You have already reviewed this appointment.", 409)
    );
  }

  // 4. Create the review
  const review = await Review.create({
    rating,
    comment,
    appointmentId,
    customerId,
    serviceId: appointment.serviceId,
  });

  sendSuccess(res, review, "Thank you for your review!", 201);
});

// @desc    Get reviews for a specific service
// @route   GET /reviews/service/:serviceId
const getServiceReviews = asyncHandler(async (req, res, next) => {
  const { serviceId } = req.params;
  const reviews = await Review.findAll({
    where: { serviceId },
    include: [
      {
        model: User,
        attributes: ["firstName", "lastName"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  sendSuccess(res, reviews, "Reviews fetched successfully.");
});

// @desc    Get all reviews (for admin)
// @route   GET /reviews
const getAllReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.findAll({
    include: [
      { model: User, attributes: ["firstName", "lastName"] },
      { model: Service, attributes: ["name"] },
    ],
    order: [["createdAt", "DESC"]],
  });
  sendSuccess(res, reviews, "All reviews fetched successfully.");
});

// @desc    Add a staff response to a review
// @route   PATCH /reviews/:reviewId/respond
const addStaffResponse = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const { response } = req.body;

  if (!response) {
    return next(new ErrorHandler("Response text is required.", 400));
  }

  const review = await Review.findByPk(reviewId);

  if (!review) {
    return next(new ErrorHandler("Review not found.", 404));
  }

  review.staffResponse = response;
  await review.save();

  sendSuccess(res, review, "Response added successfully.");
});

module.exports = {
  createReview,
  getServiceReviews,
  getAllReviews,
  addStaffResponse,
};
