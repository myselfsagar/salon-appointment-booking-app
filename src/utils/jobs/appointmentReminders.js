const cron = require("node-cron");
const appointmentServices = require("../../services/dbCall.js/appointmentServices");
const userServices = require("../../services/dbCall.js/userServices");
const emailService = require("../../services/emailService");

// Schedule the cron job to run every hour
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const remindAfter = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const appointments = await appointmentServices.getAppointmentsForReminders(
      now,
      remindAfter
    );

    for (const appointment of appointments) {
      const user = await userServices.getUserById(appointment.customerId);
      await emailService.sendAppointmentReminderEmail(user, appointment);
      appointment.reminderSent = true;
      await appointment.save();
    }
  } catch (error) {
    console.error("Error sending appointment reminders:", error);
  }
});
