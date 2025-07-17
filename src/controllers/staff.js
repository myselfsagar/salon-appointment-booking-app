const { sendSuccess } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const staffServices = require("../services/dbCall.js/staffServices");

const createStaffMember = asyncHandler(async (req, res, next) => {
  const staffData = req.body;
  const newStaff = await staffServices.createStaff(staffData);

  sendSuccess(res, newStaff, "Staff member created successfully", 201);
});

module.exports = {
  createStaffMember,
};
