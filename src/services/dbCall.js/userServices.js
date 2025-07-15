const User = require("../../models/User");

const createUser = async (userData) => {
  try {
    return await User.create(userData);
  } catch (error) {
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    return await User.findOne({
      where: { email },
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmail,
};
