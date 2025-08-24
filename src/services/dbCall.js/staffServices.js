const sequelize = require("../../utils/dbConnect");
const User = require("../../models/User");
const StaffProfile = require("../../models/StaffProfile");
const Service = require("../../models/Service");
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
        {
          model: Service,
          attributes: ["name"],
          through: { attributes: [] },
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
      include: [{ model: User }, { model: Service }],
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

    await updateUserById(staffProfile.userId, data);

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
      include: [User],
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

const unassignServiceFromStaff = async (staffId, serviceId) => {
  try {
    const staff = await getStaffById(staffId);
    const service = await serviceServices.getServiceById(serviceId);
    const result = await staff.removeService(service);
    return result;
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
  assignServiceToStaff,
  unassignServiceFromStaff,
};
