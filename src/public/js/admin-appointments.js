document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "/";
    return;
  }

  const appointmentListContainer = document.getElementById(
    "appointment-list-container"
  );

  async function fetchAppointments() {
    try {
      const response = await axios.get("/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      renderAppointmentList(response.data.data);
    } catch (error) {
      appointmentListContainer.innerHTML =
        "<p>Failed to load appointments.</p>";
    }
  }

  function renderAppointmentList(appointments) {
    if (appointments.length === 0) {
      appointmentListContainer.innerHTML = "<p>No appointments found.</p>";
      return;
    }

    appointmentListContainer.innerHTML = appointments
      .map((app) => {
        const customerName = app.user
          ? `${app.user.firstName} ${app.user.lastName}`
          : "N/A";
        const staffName = app.staff_profile
          ? `${app.staff_profile.user.firstName} ${app.staff_profile.user.lastName}`
          : "N/A";
        const appointmentDate = new Date(
          app.appointmentDateTime
        ).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "long",
          timeStyle: "short",
        });

        return `
                <div class="appointment-admin-card">
                    <h4>${app.service.name}</h4>
                    <p><strong>Customer:</strong> ${customerName}</p>
                    <p><strong>With:</strong> ${staffName}</p>
                    <p><strong>When:</strong> ${appointmentDate}</p>
                    <p><strong>Status:</strong> <span class="status-${app.status}">${app.status}</span></p>
                </div>
            `;
      })
      .join("");
  }

  fetchAppointments();
});
