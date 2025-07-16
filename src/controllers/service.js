const serviceServices = require("../services/dbCall.js/serviceServices");
const { sendSuccess } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

const createService = asyncHandler(async (req, res, next) => {
  const reqData = req.body;
  const service = await serviceServices.createService(reqData);
  return sendSuccess(res, service, "Service created", 201);
});

const getAllServices = asyncHandler(async (req, res, next) => {
  const { category } = req.query;
  const services = await serviceServices.getAllServices({ category });
  return sendSuccess(res, services, "All services fetched");
});

const getServiceById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const service = await serviceServices.getServiceById(id);

  return sendSuccess(res, service, "Service fetched");
});

const updateService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userData = req.body;

  const service = await serviceServices.getServiceById(id);
  if (!service) {
    throw new ErrorHandler("User not found", 404);
  }

  const updatedService = await serviceServices.updateService({
    ...userData,
    serviceId: id,
  });

  return sendSuccess(res, updatedService, "service updated successfully");
});

const deleteService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const service = await serviceServices.getServiceById(id);
  if (!service) {
    throw new ErrorHandler("User not found", 404);
  }

  const isDeleted = await serviceServices.deleteService(id);

  return sendSuccess(res, isDeleted, "Service deleted", 204);
});

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
