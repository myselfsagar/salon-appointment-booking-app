const { sendSuccess, sendError } = require("../utils/responseHandler");
const userServices = require("../services/dbCall.js/userServices");

const getMyProfile = async (req, res) => {
  try {
    const user = await userServices.getUserById(req.userId);

    if (!user) {
      return sendError(res, "No user found", 404);
    }

    return sendSuccess(res, user, "Profile fetched");
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userData = req.body;
    userData.id = req.userId;
    const user = await userServices.updateMyProfile(userData);

    return sendSuccess(res, user, "profile updated successfully");
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
