const sequelize = require("../../utils/dbConnect");
const User = require("../../models/User");
const StaffProfile = require("../../models/StaffProfile");
const axios = require("axios");

const createStaff = async (staffData) => {
  const t = await sequelize.transaction();

  try {
    // Step 1: Create the User with role 'staff' and null password
    const newUser = await User.create(
      {
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        phone: staffData.phone,
        // password: null,
        role: "staff",
      },
      { transaction: t }
    );

    // Step 2: Create the associated StaffProfile
    await StaffProfile.create(
      {
        userId: newUser.id,
        specialization: staffData.specialization,
        availability: staffData.availability,
      },
      { transaction: t }
    );

    // Step 3: Send the reset password email
    await axios.post(`${process.env.WEBSITE}/password/forgotPassword`, {
      email: staffData.email,
    });

    await t.commit();

    return newUser;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createStaff,
};
