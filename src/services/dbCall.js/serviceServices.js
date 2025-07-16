const Service = require("../../models/Service");
const ErrorHandler = require("../../utils/errorHandler");

const createService = async (data) => {
  try {
    return await Service.create(data);
  } catch (error) {
    throw error;
  }
};

const getAllServices = async ({ category }) => {
  try {
    let whereCondition = {};
    if (category) whereCondition.category = category;

    return await Service.findAll({ where: whereCondition });
  } catch (error) {
    throw error;
  }
};

const getServiceById = async (id) => {
  try {
    const service = await Service.findByPk(id);
    if (!service) {
      throw new ErrorHandler("Service not found", 404);
    }
  } catch (error) {
    throw error;
  }
};

const updateService = async (data) => {
  try {
    const updateFields = {};
    if (data.name) updateFields.name = data.name;
    if (data.description) updateFields.description = data.description;
    if (data.duration) updateFields.duration = data.duration;
    if (data.price) updateFields.price = data.price;
    if (data.category) updateFields.category = data.category;

    // Update and return the updated user
    await Service.update(updateFields, {
      where: { id: data.serviceId },
    });

    const updatedService = await getServiceById(data.serviceId);
    return updatedService;
  } catch (error) {
    console.log(error);
    return sendError(res, error.message);
  }
};

const deleteService = async (id) => {
  try {
    return await Service.destroy({ where: { id } });
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
