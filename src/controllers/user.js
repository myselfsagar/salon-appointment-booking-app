const { sendSuccess } = require("../utils/responseHandler");
const userServices = require("../services/dbCall.js/userServices");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

const getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await userServices.getUserById(req.user.id);
  return sendSuccess(res, user, "Profile fetched");
});

const updateMyProfile = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  userData.id = req.user.id;
  const user = await userServices.updateMyProfile(userData);

  return sendSuccess(res, user, "profile updated successfully");
});

module.exports = {
  getMyProfile,
  updateMyProfile,
};
