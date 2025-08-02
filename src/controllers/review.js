const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const Appointment = require("../models/Appointment");
const Review = require("../models/Review");
const User = require("../models/User");

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

module.exports = { createReview, getServiceReviews };
