const { sendSuccess, sendError } = require("../utils/responseHandler");
const userServices = require("../services/dbCall.js/userServices");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signupController = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const isUser = await userServices.getUserByEmail(email);
    if (isUser) {
      return sendError(res, "User already exist", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userServices.createUser({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    return sendSuccess(res, "Signup successful", 201);
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userServices.getUserByEmail(email);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return sendError(res, "Incorrect password", 401);
    }

    const access_token = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return sendSuccess(res, { access_token }, "Login successful");
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

const logoutController = async (req, res) => {
  try {
    return sendSuccess(res, "Logout");
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

module.exports = {
  signupController,
  loginController,
  logoutController,
};
