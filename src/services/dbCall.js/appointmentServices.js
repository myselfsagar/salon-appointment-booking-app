const { Op, Sequelize } = require("sequelize");
const Appointment = require("../../models/Appointment");
const Service = require("../../models/Service");
const StaffProfile = require("../../models/StaffProfile");
const User = require("../../models/User");
const ErrorHandler = require("../../utils/errorHandler");
const {
  toDate,
  isSlotAvailable,
} = require("../../utils/Helper/appointmentHelper");

const findAvailableSlots = async (date, serviceId) => {
  const service = await Service.findByPk(serviceId);
  if (!service) throw new ErrorHandler("Service not found", 404);

  const capableStaff = await StaffProfile.findAll({
    include: [{ model: Service, where: { id: serviceId }, attributes: [] }],
  });
  if (capableStaff.length === 0) return [];

  const staffIds = capableStaff.map((s) => s.id);
  const appointments = await Appointment.findAll({
    where: {
      staffId: { [Op.in]: staffIds },
      status: "scheduled",
      appointmentDateTime: {
        [Op.gte]: toDate(date),
        [Op.lt]: new Date(toDate(date).getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: [{ model: Service, attributes: ["duration"] }],
    order: [["appointmentDateTime", "ASC"]],
  });

  const dayOfWeek = toDate(date)
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();

  const allSlots = capableStaff.flatMap((staff) =>
    generateSlotsForStaff(staff, service, date, appointments, dayOfWeek)
  );

  const uniqueSlots = [...new Set(allSlots)];
  return uniqueSlots.sort();
};

const findFirstAvailableStaff = async (serviceId, appointmentDateTime) => {
  const service = await Service.findByPk(serviceId);
  if (!service) throw new ErrorHandler("Service not found", 404);

  const potentialSlotStart = new Date(appointmentDateTime);
  const potentialSlotEnd = new Date(
    potentialSlotStart.getTime() + service.duration * 60000
  );

  const capableStaff = await StaffProfile.findAll({
    include: [{ model: Service, where: { id: serviceId }, attributes: [] }],
  });
  if (capableStaff.length === 0) return null;

  const capableStaffIds = capableStaff.map((s) => s.id);

  // Find staff who have a conflicting appointment
  const busyStaffIds = new Set(
    (
      await Appointment.findAll({
        where: {
          staffId: { [Op.in]: capableStaffIds },
          status: "scheduled",
          appointmentDateTime: { [Op.lt]: potentialSlotEnd }, // Starts before the potential slot ends
        },
        include: [
          {
            model: Service,
            where: Sequelize.where(
              Sequelize.fn(
                "DATE_ADD",
                Sequelize.col("appointmentDateTime"),
                Sequelize.literal(`INTERVAL \`Service\`.\`duration\` MINUTE`)
              ),
              { [Op.gt]: potentialSlotStart } // And ends after the potential slot starts
            ),
          },
        ],
      })
    ).map((a) => a.staffId)
  );

  // Find the first capable staff member who is NOT busy and is working
  for (const staff of capableStaff) {
    if (!busyStaffIds.has(staff.id)) {
      const date = potentialSlotStart.toISOString().split("T")[0];
      const dayOfWeek = new Date(date)
        .toLocaleString("en-US", { weekday: "long" })
        .toLowerCase();
      const daySchedule = staff.availability
        ? staff.availability[dayOfWeek]
        : undefined;

      if (daySchedule && daySchedule.length > 0) {
        const workingHours = daySchedule[0].split("-");
        const [startHour, startMinute] = workingHours[0].split(":").map(Number);
        const [endHour, endMinute] = workingHours[1].split(":").map(Number);
        const staffWorkStart = new Date(date);
        staffWorkStart.setUTCHours(startHour, startMinute, 0, 0);
        const staffWorkEnd = new Date(date);
        staffWorkEnd.setUTCHours(endHour, endMinute, 0, 0);

        if (
          potentialSlotStart >= staffWorkStart &&
          potentialSlotEnd <= staffWorkEnd
        ) {
          return staff; // This staff is capable, not busy, and working.
        }
      }
    }
  }

  return null; // No available staff found
};

const bookAppointment = async (bookingData) => {
  const { customerId, serviceId, appointmentDateTime } = bookingData;
  const availableStaff = await findFirstAvailableStaff(
    serviceId,
    appointmentDateTime
  );
  if (!availableStaff) {
    throw new ErrorHandler(
      "The selected time slot is no longer available. Please try another.",
      409
    );
  }
  const appointment = await Appointment.create({
    customerId,
    staffId: availableStaff.id,
    serviceId,
    appointmentDateTime,
  });
  return appointment;
};

function generateSlotsForStaff(staff, service, date, appointments, dayOfWeek) {
  const slots = [];
  const daySchedule = staff.availability?.[dayOfWeek];
  if (!daySchedule || daySchedule.length === 0) return slots;

  const [start, end] = daySchedule[0].split("-");
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  let slotTime = new Date(date);
  slotTime.setUTCHours(startHour, startMinute, 0, 0);
  const staffWorkEnd = new Date(date);
  staffWorkEnd.setUTCHours(endHour, endMinute, 0, 0);

  while (slotTime < staffWorkEnd) {
    const slotEndTime = new Date(slotTime.getTime() + service.duration * 60000);
    if (isSlotAvailable(slotTime, slotEndTime, appointments, staff.id)) {
      slots.push(slotTime.toISOString());
    }
    slotTime = new Date(slotTime.getTime() + service.duration * 60000);
  }
  return slots;
}

const getAppointmentDetails = async (appointmentId) => {
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [
      { model: User, attributes: ["id", "firstName", "lastName", "email"] },
      {
        model: StaffProfile,
        include: [{ model: User, attributes: ["firstName", "lastName"] }],
      },
      { model: Service },
    ],
  });
  if (!appointment) {
    throw new ErrorHandler("Appointment not found", 404);
  }
  return appointment;
};

const getAppointmentsByCustomerId = async (customerId) => {
  try {
    const appointments = await Appointment.findAll({
      where: { customerId: customerId },
      include: [
        { model: Service, attributes: ["id", "name", "duration", "price"] },
        {
          model: StaffProfile,
          include: [{ model: User, attributes: ["firstName", "lastName"] }],
        },
      ],
      order: [["appointmentDateTime", "DESC"]], // Show most recent first
    });
    return appointments;
  } catch (error) {
    throw error;
  }
};

const getAllAppointments = async (date) => {
  try {
    const whereCondition = {};

    // If a date is provided, filter appointments for that specific day
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      whereCondition.appointmentDateTime = {
        [Op.between]: [startDate, endDate],
      };
    }

    const appointments = await Appointment.findAll({
      where: whereCondition,
      include: [
        { model: Service, attributes: ["name"] },
        {
          model: StaffProfile,
          include: [{ model: User, attributes: ["firstName", "lastName"] }],
        },
        { model: User, as: "user", attributes: ["firstName", "lastName"] },
      ],
      order: [["appointmentDateTime", "DESC"]],
    });
    return appointments;
  } catch (error) {
    throw error;
  }
};

const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const appointment = await getAppointmentDetails(appointmentId);
    appointment.status = status;
    await appointment.save();
    return appointment;
  } catch (error) {
    throw error;
  }
};

const cancelAppointmentByUser = async (appointmentId, customerId) => {
  const appointment = await getAppointmentDetails(appointmentId);

  if (appointment.customerId !== customerId) {
    throw new ErrorHandler(
      "You are not authorized to cancel this appointment",
      403
    );
  }

  const appointmentTime = new Date(appointment.appointmentDateTime);
  const now = new Date();
  const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);

  if (hoursDifference < 24) {
    throw new ErrorHandler("Cannot cancel appointment within 24 hours.", 400);
  }

  appointment.status = "cancelled";
  await appointment.save();
  return appointment;
};

const getAppointmentsForReminders = async (startTime, endTime) => {
  return await Appointment.findAll({
    where: {
      appointmentDateTime: { [Op.between]: [startTime, endTime] },
      status: "scheduled",
      reminderSent: false,
    },
    include: [
      { model: Service, attributes: ["name"] },
      {
        model: StaffProfile,
        include: [{ model: User, attributes: ["firstName", "lastName"] }],
      },
    ],
  });
};

module.exports = {
  findAvailableSlots,
  findFirstAvailableStaff,
  bookAppointment,
  getAppointmentDetails,
  getAppointmentsByCustomerId,
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointmentByUser,
  getAppointmentsForReminders,
};
