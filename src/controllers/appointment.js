const appointmentServices = require("../services/dbCall.js/appointmentServices");
const ErrorHandler = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const asyncHandler = require("./../utils/asyncHandler");
const emailService = require("../services/emailService");

const getAvailableSlots = asyncHandler(async (req, res, next) => {
  const { date, serviceId } = req.query; // e.g., date=2025-09-15
  if (!date || !serviceId) {
    throw new ErrorHandler("Both date and serviceId are required.", 400);
  }

  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today

  if (inputDate < today) {
    throw new ErrorHandler("Can't fetch slot from past", 400); //avoid past date booking
  }

  const slots = await appointmentServices.findAvailableSlots(date, serviceId);
  sendSuccess(res, { availableSlots: slots }, "Available slots fetched");
});

const createAppointment = asyncHandler(async (req, res, next) => {
  const { serviceId, appointmentDateTime } = req.body;
  const customerId = req.user.id;

  const inputDate = new Date(appointmentDateTime);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today

  if (inputDate < today) {
    throw new ErrorHandler("Booking on past dates not allowed", 400); //avoid past date booking
  }

  const newAppointment = await appointmentServices.bookAppointment({
    customerId,
    serviceId,
    appointmentDateTime,
  });

  // Get full appointment details to send in the confirmation email
  const appointmentDetails = await appointmentServices.getAppointmentDetails(
    newAppointment.id
  );

  // Send booking confirmation email
  await emailService.sendBookingConfirmationEmail(req.user, appointmentDetails);

  sendSuccess(res, newAppointment, "Appointment booked successfully", 201);
});

const getAppointmentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await appointmentServices.getAppointmentDetails(id);
  sendSuccess(res, appointment, "Appointment details fetched");
});

const getMyAppointments = asyncHandler(async (req, res, next) => {
  const customerId = req.user.id;
  const appointments = await appointmentServices.getAppointmentsByCustomerId(
    customerId
  );
  sendSuccess(res, appointments, "Your appointments fetched successfully");
});

const getAllAppointmentsAdmin = asyncHandler(async (req, res, next) => {
  const appointments = await appointmentServices.getAllAppointments();
  sendSuccess(res, appointments, "All appointments fetched");
});

module.exports = {
  getAvailableSlots,
  createAppointment,
  getAppointmentById,
  getMyAppointments,
  getAllAppointmentsAdmin,
};
