const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const appointmentServices = require("../services/dbCall.js/appointmentServices");
const serviceServices = require("../services/dbCall.js/serviceServices");
const emailService = require("../services/emailService"); // Import emailService
const { sendSuccess } = require("../utils/responseHandler");
const Appointment = require("../models/Appointment");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = asyncHandler(async (req, res, next) => {
  const { serviceId, appointmentDateTime } = req.body;
  const customerId = req.user.id;

  const service = await serviceServices.getServiceById(serviceId);
  const availableStaff = await appointmentServices.findFirstAvailableStaff(
    serviceId,
    appointmentDateTime
  );

  if (!availableStaff) {
    return next(
      new ErrorHandler("The selected time slot is no longer available.", 409)
    );
  }

  const options = {
    amount: service.price * 100, // Amount in the smallest currency unit (paise)
    currency: "INR",
    receipt: `receipt_appointment_${new Date().getTime()}`,
  };

  const order = await instance.orders.create(options);

  // Create the appointment with 'pending' status
  await appointmentServices.bookAppointment({
    customerId,
    staffId: availableStaff.id,
    serviceId,
    appointmentDateTime,
    razorpayOrderId: order.id,
  });

  sendSuccess(
    res,
    {
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
      serviceName: service.name,
      customerName: req.user.firstName,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
    },
    "Order created successfully"
  );
});

const verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Signature is valid, find the appointment and update its status
    const appointment = await Appointment.findOne({
      where: { razorpayOrderId: razorpay_order_id },
    });
    if (appointment) {
      appointment.status = "scheduled";
      await appointment.save();

      // --- Send Confirmation Email ---
      const appointmentDetails =
        await appointmentServices.getAppointmentDetails(appointment.id);
      await emailService.sendBookingConfirmationEmail(
        req.user,
        appointmentDetails
      );

      sendSuccess(
        res,
        { appointmentId: appointment.id },
        "Payment verified and appointment scheduled."
      );
    } else {
      return next(
        new ErrorHandler("Appointment not found for this order.", 404)
      );
    }
  } else {
    return next(
      new ErrorHandler("Payment verification failed. Invalid signature.", 400)
    );
  }
});

module.exports = { createRazorpayOrder, verifyPayment };
