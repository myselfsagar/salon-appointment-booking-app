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
  const paginationContainer = document.getElementById("pagination-container");

  // Pagination State
  let currentPage = 1;
  const limit = 10;

  // --- Populate Filter Dropdowns ---
  async function populateFilters() {
    try {
      const [servicesRes, staffRes] = await Promise.all([
        api.get("/services"),
        api.get("/staff"),
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
      const config = {
        params: {
          date: dateFilter.value || undefined,
          serviceId: serviceFilter.value || undefined,
          staffId: staffFilter.value || undefined,
          page: currentPage,
          limit: limit,
        },
      };

      const response = await api.get("/appointments", config);
      const {
        appointments,
        totalPages,
        currentPage: page,
      } = response.data.data;

      renderAppointmentList(appointments);
      renderPaginationControls(totalPages, page);
    } catch (error) {
      appointmentListContainer.innerHTML =
        "<p>Failed to load appointments.</p>";
      paginationContainer.innerHTML = ""; // Clear pagination on error
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

  // --- Render Pagination Controls (New Function) ---
  function renderPaginationControls(totalPages, page) {
    paginationContainer.innerHTML = ""; // Clear old controls
    if (totalPages <= 1) return;

    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.className = "btn";
    prevButton.disabled = page === 1;
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        fetchAppointments();
      }
    });

    const pageIndicator = document.createElement("span");
    pageIndicator.textContent = `Page ${page} of ${totalPages}`;
    pageIndicator.style.margin = "0 1rem";

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.className = "btn";
    nextButton.disabled = page === totalPages;
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        fetchAppointments();
      }
    });

    paginationContainer.style.textAlign = "center";
    paginationContainer.style.marginTop = "2rem";
    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageIndicator);
    paginationContainer.appendChild(nextButton);
  }

  // --- Event Listeners ---
  function handleFilterChange() {
    currentPage = 1; // Reset to the first page on any filter change
    fetchAppointments();
  }

  dateFilter.addEventListener("change", handleFilterChange);
  serviceFilter.addEventListener("change", handleFilterChange);
  staffFilter.addEventListener("change", handleFilterChange);

  resetFiltersBtn.addEventListener("click", () => {
    dateFilter.value = "";
    serviceFilter.selectedIndex = 0;
    staffFilter.selectedIndex = 0;
    handleFilterChange();
  });

  appointmentListContainer.addEventListener("change", async (e) => {
    if (e.target.classList.contains("status-select")) {
      const appointmentId = e.target.closest(".appointment-admin-card").dataset
        .id;
      const newStatus = e.target.value;

      try {
        await api.patch(`/appointments/${appointmentId}`, {
          status: newStatus,
        });
        showToast("Status updated successfully!", "success");
      } catch (error) {
        showToast("Failed to update status.", "error");
        fetchAppointments(); // Revert dropdown on failure
      }
    }
  });

  // --- Initial Load ---
  populateFilters();
  fetchAppointments();
});
