const User = require("../models/User");
const ForgotPassword = require("../models/ForgotPassword");
const { sendSuccess } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const Sib = require("sib-api-v3-sdk");
const userServices = require("../services/dbCall.js/userServices");

// Setup Sendinblue email client
const client = Sib.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();

const sendPasswordResetEmail = asyncHandler(async (request, response, next) => {
  const { email } = request.body;
  if (!email) {
    throw new ErrorHandler("Email is mandatory", 400);
  }

  const user = await userServices.getUserByEmail(email);
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const sender = { email: "ssahu6244@gmail.com", name: "From Admin SAGAR" };
  const receivers = [{ email }];

  const resetResponse = await ForgotPassword.create({ userId: user.id });
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
                    <button><a href="${process.env.WEBSITE}/password/resetPassword/{{params.role}}">Reset Password</a></button>
                </body>
                </html>`,
    params: {
      role: id,
    },
  });

  return sendSuccess(response, mailresponse, "Password reset email sent");
});

const verifyResetRequest = asyncHandler(async (request, response, next) => {
  let { resetId } = request.params;
  const passwordReset = await ForgotPassword.findByPk(resetId);
  if (passwordReset.isActive) {
    passwordReset.isActive = false;
    await passwordReset.save();
    return response.sendFile("resetPassword.html", { root: "src/views" });
  } else {
    throw new ErrorHandler("Link has expired", 403);
  }
});

const updatepassword = asyncHandler(async (request, response, next) => {
  const { resetId, newPassword } = request.body;
  const passwordReset = await ForgotPassword.findByPk(resetId);

  const currentTime = new Date();
  const createdAtTime = new Date(passwordReset.createdAt);
  const timeDifference = currentTime - createdAtTime;
  const timeLimit = 10 * 60 * 1000;
  if (timeDifference > timeLimit) {
    throw new ErrorHandler("Link has expired", 403);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.update(
    { password: hashedPassword },
    { where: { id: passwordReset.userId } }
  );

  passwordReset.isActive = false;
  await passwordReset.save();

  return sendSuccess(response, {}, "Password updated successfully.");
});

module.exports = {
  sendPasswordResetEmail,
  verifyResetRequest,
  updatepassword,
};
