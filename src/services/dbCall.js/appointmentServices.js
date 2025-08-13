const { Op, Sequelize } = require("sequelize");
const Appointment = require("../../models/Appointment");
const Service = require("../../models/Service");
const StaffProfile = require("../../models/StaffProfile");
const User = require("../../models/User");
const Review = require("../../models/Review");
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

      const daySchedule = getStaffScheduleForDay(staff, date, dayOfWeek);

      if (daySchedule.isAvailable) {
        for (const slot of daySchedule.slots) {
          const [startHour, startMinute] = slot.start.split(":").map(Number);
          const [endHour, endMinute] = slot.end.split(":").map(Number);

          const staffWorkStart = new Date(date);
          staffWorkStart.setHours(startHour, startMinute, 0, 0);
          const staffWorkEnd = new Date(date);
          staffWorkEnd.setHours(endHour, endMinute, 0, 0);

          if (
            potentialSlotStart >= staffWorkStart &&
            potentialSlotEnd <= staffWorkEnd
          ) {
            return staff; // This staff is capable, not busy, and working.
          }
        }
      }
    }
  }

  return null; // No available staff found
};

const getStaffScheduleForDay = (staff, date, dayOfWeek) => {
  if (staff.availability && staff.availability.overrides) {
    const override = staff.availability.overrides.find((o) => o.date === date);
    if (override) {
      return override;
    }
  }

  if (staff.availability && staff.availability.weekly) {
    const weeklySchedule = staff.availability.weekly.find(
      (d) => d.day.toLowerCase() === dayOfWeek
    );
    if (weeklySchedule) {
      return weeklySchedule;
    }
  }

  return { isAvailable: false, slots: [] };
};

function generateSlotsForStaff(staff, service, date, appointments, dayOfWeek) {
  const slots = [];
  const schedule = getStaffScheduleForDay(staff, date, dayOfWeek);

  if (!schedule.isAvailable) return slots;

  for (const slot of schedule.slots) {
    const [startHour, startMinute] = slot.start.split(":").map(Number);
    const [endHour, endMinute] = slot.end.split(":").map(Number);

    let slotTime = new Date(date);
    slotTime.setHours(startHour, startMinute, 0, 0);
    const staffWorkEnd = new Date(date);
    staffWorkEnd.setHours(endHour, endMinute, 0, 0);

    while (slotTime < staffWorkEnd) {
      const slotEndTime = new Date(
        slotTime.getTime() + service.duration * 60000
      );
      if (isSlotAvailable(slotTime, slotEndTime, appointments, staff.id)) {
        slots.push(slotTime.toISOString());
      }
      slotTime = new Date(slotTime.getTime() + service.duration * 60000);
    }
  }

  return slots;
}

const bookAppointment = async (bookingData) => {
  const {
    customerId,
    staffId,
    serviceId,
    appointmentDateTime,
    razorpayOrderId,
  } = bookingData;

  const appointment = await Appointment.create({
    customerId,
    staffId,
    serviceId,
    appointmentDateTime,
    razorpayOrderId,
    status: "pending",
  });

  return appointment;
};

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
        { model: Review },
      ],
      order: [["appointmentDateTime", "DESC"]],
    });
    return appointments;
  } catch (error) {
    throw error;
  }
};

const getAllAppointments = async ({
  date,
  serviceId,
  staffId,
  page,
  limit,
}) => {
  try {
    const whereCondition = {};
    const offset = (page - 1) * limit;

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.appointmentDateTime = {
        [Op.between]: [startDate, endDate],
      };
    }
    if (serviceId) whereCondition.serviceId = serviceId;
    if (staffId) whereCondition.staffId = staffId;

    const { count, rows } = await Appointment.findAndCountAll({
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
      limit,
      offset,
    });

    return {
      appointments: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    };
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

const rescheduleAppointment = async (
  appointmentId,
  customerId,
  newAppointmentDateTime
) => {
  const appointment = await getAppointmentDetails(appointmentId);

  if (appointment.customerId !== customerId) {
    throw new ErrorHandler(
      "You are not authorized to reschedule this appointment",
      403
    );
  }

  const availableStaff = await findFirstAvailableStaff(
    appointment.serviceId,
    newAppointmentDateTime
  );

  if (!availableStaff) {
    throw new ErrorHandler(
      "The selected time slot is no longer available.",
      409
    );
  }

  appointment.appointmentDateTime = newAppointmentDateTime;
  appointment.staffId = availableStaff.id;
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
  rescheduleAppointment,
  getAppointmentsForReminders,
};
