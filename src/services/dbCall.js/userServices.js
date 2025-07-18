const User = require("../../models/User");
const ErrorHandler = require("../../utils/errorHandler");

const createUser = async (userData) => {
  try {
    return await User.create(userData);
  } catch (error) {
    throw error;
  }
};

const getUserForAuth = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }
  return user;
};

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }
    delete user.password;

    return user;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }
    delete user.password;

    return user;
  } catch (error) {
    throw error;
  }
};

const updateMyProfile = async (data) => {
  try {
    const updateFields = {};
    if (data.firstName) updateFields.firstName = data.firstName;
    if (data.lastName) updateFields.lastName = data.lastName;
    if (data.phone) updateFields.phone = data.phone;

    // Update and return the updated user
    await User.update(updateFields, { where: { id: data.id } });
    const updatedUser = await User.findByPk(data.id);

    delete updatedUser.password;
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getUserForAuth,
  getUserByEmail,
  getUserById,
  updateMyProfile,
};
