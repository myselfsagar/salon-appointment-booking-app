const User = require("../models/User");
const ForgotPassword = require("../models/ForgotPassword");
const { sendSuccess } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const userServices = require("../services/dbCall.js/userServices");

const sendPasswordResetEmailController = asyncHandler(
  async (request, response, next) => {
    const { email } = request.body;
    if (!email) {
      throw new ErrorHandler("Email is mandatory", 400);
    }

    const user = await userServices.getUserByEmail(email);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const mailresponse = await emailService.sendPasswordResetEmail(user);

    return sendSuccess(response, mailresponse, "Password reset email sent");
  }
);

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
  sendPasswordResetEmail: sendPasswordResetEmailController,
  verifyResetRequest,
  updatepassword,
};
