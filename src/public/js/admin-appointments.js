document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "/";
    return;
  }

  const appointmentListContainer = document.getElementById(
    "appointment-list-container"
  );
  const dateFilter = document.getElementById("date-filter");

  async function fetchAppointments() {
    try {
      const selectedDate = dateFilter.value;

      // Build the params for the API call
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {},
      };

      if (selectedDate) {
        config.params.date = selectedDate;
      }

      const response = await axios.get("/appointments", config);
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

        // Create the status dropdown
        const statusOptions = ["scheduled", "completed", "cancelled"]
          .map(
            (s) =>
              `<option value="${s}" ${s === app.status ? "selected" : ""}>${
                s.charAt(0).toUpperCase() + s.slice(1)
              }</option>`
          )
          .join("");

        return `
            <div class="appointment-admin-card" data-id="${app.id}">
                <h4>${app.service.name}</h4>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>With:</strong> ${staffName}</p>
                <p><strong>When:</strong> ${appointmentDate}</p>
                <div class="status-updater">
                    <label>Status:</label>
                    <select class="status-select">${statusOptions}</select>
                </div>
            </div>
        `;
      })
      .join("");
  }

  // Add an event listener to handle status changes
  appointmentListContainer.addEventListener("change", async (e) => {
    if (e.target.classList.contains("status-select")) {
      const appointmentId = e.target.closest(".appointment-admin-card").dataset
        .id;
      const newStatus = e.target.value;

      try {
        await axios.patch(
          `/appointments/${appointmentId}`,
          { status: newStatus },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Status updated successfully!");
        // You might want to add a visual confirmation instead of an alert
      } catch (error) {
        alert("Failed to update status.");
        // Revert the dropdown on failure
        fetchAppointments();
      }
    }
  });

  dateFilter.addEventListener("change", fetchAppointments);
  fetchAppointments();
});
