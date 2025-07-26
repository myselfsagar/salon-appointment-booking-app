const { sendSuccess } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const staffServices = require("../services/dbCall.js/staffServices");

const createStaffMember = asyncHandler(async (req, res, next) => {
  const staffData = req.body;
  const newStaff = await staffServices.createStaff(staffData);

  sendSuccess(res, newStaff, "Staff member created successfully", 201);
});

const getAllStaffs = asyncHandler(async (req, res, next) => {
  const staffs = await staffServices.getAllStaffs();
  sendSuccess(res, staffs, "All staff members fetched", 200);
});

const getStaffById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const staff = await staffServices.getStaffById(id);

  return sendSuccess(res, staff, "Staff fetched");
});

const updateStaff = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const staffData = req.body;

  await staffServices.getStaffById(id); //check if staff exist

  const updatedStaff = await staffServices.updateStaff({
    ...staffData,
    staffId: id,
  });

  return sendSuccess(res, updatedStaff, "Staff updated successfully");
});

const deleteStaff = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await staffServices.getStaffById(id); //check if staff exist

  const isDeleted = await staffServices.deleteStaff(id);

  return sendSuccess(res, isDeleted, "Staff deleted", 204);
});

const assignService = asyncHandler(async (req, res, next) => {
  const { staffId, serviceId } = req.params;
  const result = await staffServices.assignServiceToStaff(staffId, serviceId);
  sendSuccess(res, result, "Service assigned successfully");
});

const unassignService = asyncHandler(async (req, res, next) => {
  const { staffId, serviceId } = req.params;
  await staffServices.unassignServiceFromStaff(staffId, serviceId);
  sendSuccess(res, {}, "Service unassigned successfully");
});

module.exports = {
  createStaffMember,
  getAllStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
  assignService,
  unassignService,
};
