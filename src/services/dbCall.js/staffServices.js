const sequelize = require("../../utils/dbConnect");
const User = require("../../models/User");
const StaffProfile = require("../../models/StaffProfile");
const serviceServices = require("./serviceServices");
const emailService = require("../emailService");
const ErrorHandler = require("../../utils/errorHandler");

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
    await emailService.sendPasswordResetEmail(newUser, t);

    await t.commit();

    return newUser;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAllStaffs = async () => {
  try {
    return await StaffProfile.findAll({
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
      ],
    });
  } catch (error) {
    throw error;
  }
};

const getStaffById = async (staffId) => {
  try {
    const staff = await StaffProfile.findByPk(staffId, {
      include: [{ model: User }],
    });

    if (!staff) {
      throw new ErrorHandler("Staff not found", 404);
    }

    if (staff.user && staff.user.password) {
      delete staff.user.password;
    }

    return staff;
  } catch (error) {
    throw error;
  }
};

const updateStaff = async (data) => {
  try {
    const staffProfile = await StaffProfile.findByPk(data.staffId);
    if (!staffProfile) {
      throw new ErrorHandler("Staff not found", 404);
    }

    const user = await User.findByPk(staffProfile.userId);
    if (!user) {
      throw new ErrorHandler("Associated user not found", 404);
    }

    // --- Update User Model ---
    const userUpdateFields = {};
    if (data.firstName) userUpdateFields.firstName = data.firstName;
    if (data.lastName) userUpdateFields.lastName = data.lastName;
    if (data.email) userUpdateFields.email = data.email;
    if (data.phone) userUpdateFields.phone = data.phone;

    if (Object.keys(userUpdateFields).length > 0) {
      await user.update(userUpdateFields);
    }

    // --- Update StaffProfile Model ---
    const staffProfileUpdateFields = {};
    if (data.specialization)
      staffProfileUpdateFields.specialization = data.specialization;
    if (data.availability)
      staffProfileUpdateFields.availability = data.availability;

    if (Object.keys(staffProfileUpdateFields).length > 0) {
      await staffProfile.update(staffProfileUpdateFields);
    }

    // Fetch and return the updated staff profile
    const updatedStaff = await StaffProfile.findByPk(data.staffId, {
      include: [User], // Include user data in the response
    });

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

const assignServiceToStaff = async (staffId, serviceId) => {
  const t = await sequelize.transaction();
  try {
    const staff = await getStaffById(staffId);
    const service = await serviceServices.getServiceById(serviceId);

    const stffService = await staff.addService(service, { transaction: t });

    await t.commit();
    return stffService;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createStaff,
  getAllStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
  assignServiceToStaff,
};
