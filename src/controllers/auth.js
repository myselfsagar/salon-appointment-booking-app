const { sendSuccess } = require("../utils/responseHandler");
const userServices = require("../services/dbCall.js/userServices");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

const signupController = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;

  const isUser = await userServices.getUserByEmail(email);
  if (isUser) {
    throw new ErrorHandler(
      "An account with this email address already exists.",
      409
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userServices.createUser({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
  });

  return sendSuccess(res, {}, "Signup successful", 201);
});

const loginController = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userServices.getUserForAuth(email);

  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    throw new ErrorHandler("Incorrect password", 401);
  }

  const access_token = jwt.sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: "1d" }
  );

  return sendSuccess(res, { access_token }, "Login successful");
});

const logoutController = asyncHandler(async (req, res, next) => {
  return sendSuccess(res, "Logout");
});

module.exports = {
  signupController,
  loginController,
  logoutController,
};
