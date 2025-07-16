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
    const user = await User.findOne({
      where: { email },
    });
    const userData = user.toJSON();
    delete userData.password;

    return userData;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    const userData = user.toJSON();
    delete userData.password;

    return userData;
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
    const userData = updatedUser.toJSON();
    delete userData.password;
    return userData;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateMyProfile,
};
