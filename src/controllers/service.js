const serviceServices = require("../services/dbCall.js/serviceServices");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const createService = async (req, res) => {
  try {
    const reqData = req.body;
    const service = await serviceServices.createService(reqData);
    return sendSuccess(res, service, "Service created", 201);
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

const getAllServices = async (req, res) => {
  try {
    const { category } = req.query;
    const services = await serviceServices.getAllServices({ category });
    return sendSuccess(res, services, "All services fetched");
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await serviceServices.getServiceById(id);

    if (!service) {
      return sendError(res, "No service found", 404);
    }

    return sendSuccess(res, service, "Service fetched");
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const service = await serviceServices.getServiceById(id);
    if (!service) {
      return sendError(res, "No service found", 404);
    }

    const updatedService = await serviceServices.updateService({
      ...userData,
      serviceId: id,
    });

    return sendSuccess(res, updatedService, "service updated successfully");
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await serviceServices.getServiceById(id);
    if (!service) {
      return sendError(res, "No service found", 404);
    }

    const isDeleted = await serviceServices.deleteService(id);

    return sendSuccess(res, isDeleted, "Service deleted", 204);
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
