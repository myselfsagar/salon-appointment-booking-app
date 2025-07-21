function toDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new ErrorHandler("Invalid date", 400);
  return d;
}

function isSlotAvailable(slotStart, slotEnd, appointments, staffId) {
  return !appointments.some((a) => {
    if (a.staffId !== staffId) return false;
    const apptStart = new Date(a.appointmentDateTime);
    const apptEnd = new Date(apptStart.getTime() + a.service.duration * 60000);
    return slotStart < apptEnd && slotEnd > apptStart;
  });
}

module.exports = {
  toDate,
  isSlotAvailable,
};
