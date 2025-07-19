const sequelize = require("../../utils/dbConnect");
const User = require("../../models/User");
const StaffProfile = require("../../models/StaffProfile");
const emailService = require("../emailService");

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
        password: null,
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

    // Step 3: Send the reset password email using the email service
    await emailService.sendPasswordResetEmail(newUser);

    await t.commit();

    return newUser;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAllStaffs = async () => {
  try {
    return await StaffProfile.findAll();
  } catch (error) {
    throw error;
  }
};

const getStaffById = async (staffId) => {
  try {
    const staff = await StaffProfile.findByPk(staffId);
    if (!staff) {
      throw new ErrorHandler("Staff not found", 404);
    }
    delete staff.password;

    return staff;
  } catch (error) {
    throw error;
  }
};

const updateStaff = async (data) => {
  try {
    const updateFields = {};
    if (data.firstName) updateFields.firstName = data.firstName;
    if (data.lastName) updateFields.lastName = data.lastName;
    if (data.email) updateFields.email = data.email;
    if (data.phone) updateFields.phone = data.phone;
    if (data.specialization) updateFields.specialization = data.specialization;
    if (data.availability) updateFields.availability = data.availability;

    // Update and return the updated user
    const [rowsUpdate, [updatedStaff]] = await StaffProfile.update(
      updateFields,
      {
        where: { id: data.staffId },
        returning: true,
      }
    );

    return updatedStaff;
  } catch (error) {
    throw error;
  }
};

const deleteStaff = async (id) => {
  try {
    return await StaffProfile.destroy({ where: { id } });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createStaff,
  getAllStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
};
