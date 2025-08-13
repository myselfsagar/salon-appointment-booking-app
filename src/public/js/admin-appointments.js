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
  const serviceFilter = document.getElementById("service-filter");
  const staffFilter = document.getElementById("staff-filter");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");

  // --- Populate Filter Dropdowns ---
  async function populateFilters() {
    try {
      const [servicesRes, staffRes] = await Promise.all([
        axios.get("/services", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/staff", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // Populate services
      servicesRes.data.data.forEach((service) => {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = service.name;
        serviceFilter.appendChild(option);
      });

      // Populate staff
      staffRes.data.data.forEach((staff) => {
        const option = document.createElement("option");
        option.value = staff.id;
        option.textContent = `${staff.user.firstName} ${staff.user.lastName}`;
        staffFilter.appendChild(option);
      });
    } catch (error) {
      console.error("Failed to populate filters:", error);
    }
  }

  // --- Fetch and Render Appointments ---
  async function fetchAppointments() {
    try {
      const selectedDate = dateFilter.value;
      const selectedService = serviceFilter.value;
      const selectedStaff = staffFilter.value;

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {},
      };

      if (selectedDate) config.params.date = selectedDate;
      if (selectedService) config.params.serviceId = selectedService;
      if (selectedStaff) config.params.staffId = selectedStaff;

      const response = await axios.get("/appointments", config);
      renderAppointmentList(response.data.data);
    } catch (error) {
      appointmentListContainer.innerHTML =
        "<p>Failed to load appointments.</p>";
    }
  }

  function renderAppointmentList(appointments) {
    if (appointments.length === 0) {
      appointmentListContainer.innerHTML =
        "<p>No appointments found for the selected filters.</p>";
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

  // --- Event Listeners ---
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
        showToast("Status updated successfully!", "success");
      } catch (error) {
        showToast("Failed to update status.", "error");
        fetchAppointments(); // Revert dropdown on failure
      }
    }
  });

  dateFilter.addEventListener("change", fetchAppointments);
  serviceFilter.addEventListener("change", fetchAppointments);
  staffFilter.addEventListener("change", fetchAppointments);

  // Add event listener for the new reset button
  resetFiltersBtn.addEventListener("click", () => {
    // Reset the value of each filter control
    dateFilter.value = "";
    serviceFilter.selectedIndex = 0;
    staffFilter.selectedIndex = 0;

    // Fetch the appointments again with the cleared filters
    fetchAppointments();
  });

  // --- Initial Load ---
  populateFilters();
  fetchAppointments();
});
