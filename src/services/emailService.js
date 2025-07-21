const Sib = require("sib-api-v3-sdk");
const ForgotPassword = require("../models/ForgotPassword");
const ErrorHandler = require("../utils/errorHandler");

const client = Sib.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();

const sendPasswordResetEmail = async (user, transaction = null) => {
  if (!user || !user.email || !user.id) {
    throw new ErrorHandler(
      "User details are required to send a password reset email.",
      400
    );
  }

  const sender = { email: "ssahu6244@gmail.com", name: "From Admin SAGAR" };
  const receivers = [{ email: user.email }];

  const resetResponse = await ForgotPassword.create(
    { userId: user.id },
    { transaction }
  );
  const { id } = resetResponse;

  const mailresponse = await tranEmailApi.sendTransacEmail({
    sender,
    to: receivers,
    subject: "Saloon Booking App - Reset Your password",
    htmlContent: `
              <!DOCTYPE html>
                <html>
                <head>
                    <title>Password Reset</title>
                </head>
                <body>
                    <h1>Reset Your Password</h1>
                    <p>Click the button below to reset your password (Valid for 5 minute):</p><br>
                    <button><a href="${process.env.WEBSITE}/password/resetPassword/${id}">Reset Password</a></button>
                </body>
                </html>`,
  });

  return mailresponse;
};

const sendBookingConfirmationEmail = async (user, appointmentDetails) => {
  const sender = { email: "ssahu6244@gmail.com", name: "From Admin SAGAR" };
  const receivers = [{ email: user.email }];

  const serviceName = appointmentDetails.service.name;
  const staffName = `${appointmentDetails.staff_profile.user.firstName} ${appointmentDetails.staff_profile.user.lastName}`;
  const formattedDate = new Date(
    appointmentDetails.appointmentDateTime
  ).toLocaleString();

  await tranEmailApi.sendTransacEmail({
    sender,
    to: receivers,
    subject: "Your Appointment is Confirmed!",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Appointment Confirmation</title>
      </head>
      <body>
          <h1>Your Booking is Confirmed!</h1>
          <p>Hi ${user.firstName},</p>
          <p>Here are the details of your appointment:</p>
          <ul>
              <li><strong>Service:</strong> ${serviceName}</li>
              <li><strong>With:</strong> ${staffName}</li>
              <li><strong>Date & Time:</strong> ${formattedDate}</li>
          </ul>
          <p>We look forward to seeing you!</p>
      </body>
      </html>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
};
