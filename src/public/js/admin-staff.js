document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    window.location.href = "/";
    return;
  }

  // --- All DOM Elements ---
  const staffListContainer = document.getElementById("staff-list-container");
  const staffModal = document.getElementById("staff-modal");
  const addStaffBtn = document.getElementById("add-staff-btn");
  const staffForm = document.getElementById("staff-form");
  const modalTitle = document.getElementById("modal-title");
  const staffIdInput = document.getElementById("staff-id");
  const assignServiceModal = document.getElementById("assign-service-modal");
  const assignModalTitle = document.getElementById("assign-modal-title");
  const serviceAssignmentContainer = document.getElementById(
    "service-assignment-container"
  );
  const saveAssignmentsBtn = document.getElementById("save-assignments-btn");
  let currentStaffId = null;

  // Hide admin-only elements if the user is not an admin
  if (userRole !== "admin") {
    addStaffBtn.style.display = "none";
  }

  // --- Helper function to build availability UI ---
  function buildAvailabilityUI(availability) {
    const weeklyContainer = document.getElementById(
      "weekly-availability-container"
    );
    const overrideContainer = document.getElementById(
      "override-availability-container"
    );
    weeklyContainer.innerHTML = "";
    overrideContainer.innerHTML = "";

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Build weekly availability UI
    days.forEach((day) => {
      const dayData = availability?.weekly?.find((d) => d.day === day) || {
        isAvailable: true,
        slots: [{ start: "09:00", end: "17:00" }],
      };
      const dayDiv = document.createElement("div");
      dayDiv.className = "day-availability";
      dayDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
          <strong style="width: 100px;">${day}</strong>
          <input type="checkbox" data-day="${day}" class="is-available-checkbox" ${
        dayData.isAvailable ? "checked" : ""
      }>
          <div class="slots-container" data-day="${day}">
            ${dayData.slots
              .map(
                (slot) => `
              <div class="slot-group" style="margin-bottom: 5px;">
                <input type="time" value="${slot.start}"> - <input type="time" value="${slot.end}">
                <button type="button" class="remove-slot-btn">&times;</button>
              </div>
            `
              )
              .join("")}
          </div>
          <button type="button" class="add-slot-btn" data-day="${day}">+</button>
        </div>
      `;
      weeklyContainer.appendChild(dayDiv);
    });

    // Build override availability UI
    if (availability?.overrides) {
      availability.overrides.forEach((override) => {
        const overrideDiv = document.createElement("div");
        overrideDiv.className = "override-availability";
        overrideDiv.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
            <input type="date" value="${override.date}" class="override-date">
            <input type="checkbox" class="is-available-checkbox" ${
              override.isAvailable ? "checked" : ""
            }>
            <div class="slots-container">
              ${override.slots
                .map(
                  (slot) => `
                <div class="slot-group" style="margin-bottom: 5px;">
                  <input type="time" value="${slot.start}"> - <input type="time" value="${slot.end}">
                  <button type="button" class="remove-slot-btn">&times;</button>
                </div>
              `
                )
                .join("")}
            </div>
            <button type="button" class="add-slot-btn">+</button>
            <button type="button" class="remove-override-btn">&times;</button>
          </div>
        `;
        overrideContainer.appendChild(overrideDiv);
      });
    }

    document.getElementById("add-override-btn").onclick = () => {
      const overrideDiv = document.createElement("div");
      overrideDiv.className = "override-availability";
      overrideDiv.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
            <input type="date" class="override-date">
            <input type="checkbox" class="is-available-checkbox" checked>
            <div class="slots-container">
              <div class="slot-group" style="margin-bottom: 5px;">
                <input type="time" value="09:00"> - <input type="time" value="17:00">
                <button type="button" class="remove-slot-btn">&times;</button>
              </div>
            </div>
            <button type="button" class="add-slot-btn">+</button>
            <button type="button" class="remove-override-btn">&times;</button>
          </div>
        `;
      overrideContainer.appendChild(overrideDiv);
    };

    staffModal.onclick = (e) => {
      if (e.target.classList.contains("add-slot-btn")) {
        const slotsContainer = e.target.previousElementSibling;
        const slotGroup = document.createElement("div");
        slotGroup.className = "slot-group";
        slotGroup.style.marginBottom = "5px";
        slotGroup.innerHTML = `
          <input type="time" value="09:00"> - <input type="time" value="17:00">
          <button type="button" class="remove-slot-btn">&times;</button>
        `;
        slotsContainer.appendChild(slotGroup);
      }
      if (e.target.classList.contains("remove-slot-btn")) {
        e.target.parentElement.remove();
      }
      if (e.target.classList.contains("remove-override-btn")) {
        e.target.closest(".override-availability").remove();
      }
    };
  }

  // --- Staff Management Functions ---
  async function fetchStaff() {
    try {
      const response = await api.get("/staff");
      renderStaffList(response.data.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      staffListContainer.innerHTML = "<p>Could not load staff members.</p>";
    }
  }

  function renderStaffList(staffList) {
    if (staffList.length === 0) {
      staffListContainer.innerHTML = "<p>No staff members found.</p>";
      return;
    }
    staffListContainer.innerHTML = staffList
      .map((staff) => {
        const serviceNames = staff.services.map((s) => s.name).join(", ");

        // Conditionally render admin-only buttons
        const adminActions =
          userRole === "admin"
            ? `
            <button class="btn assign-btn">Assign Services</button>
            <button class="btn delete-btn" style="background-color: #dc3545;">Delete</button>
        `
            : "";

        return `
        <div class="staff-card" data-id="${staff.id}">
            <div>
                <strong>${staff.user.firstName} ${
          staff.user.lastName
        }</strong><br>
                <small>${staff.specialization || "No specialization"}</small>
                <div class="assigned-services">
                    <strong>Services:</strong> ${serviceNames || "None"}
                </div>
            </div>
            <div class="staff-actions">
                <button class="btn edit-btn">Edit</button>
                ${adminActions}
            </div>
        </div>`;
      })
      .join("");
  }

  function showStaffModal(staff = null) {
    staffForm.reset();
    buildAvailabilityUI(staff ? staff.availability : null);

    if (staff) {
      modalTitle.textContent = "Edit Staff";
      staffIdInput.value = staff.id;
      document.getElementById("firstName").value = staff.user.firstName;
      document.getElementById("lastName").value = staff.user.lastName;
      document.getElementById("email").value = staff.user.email;
      document.getElementById("phone").value = staff.user.phone;
      document.getElementById("specialization").value = staff.specialization;
    } else {
      modalTitle.textContent = "Add Staff";
      staffIdInput.value = "";
    }
    staffModal.style.display = "block";
  }

  // --- Service Assignment Functions ---
  async function showAssignServiceModal(staffId) {
    currentStaffId = staffId;
    serviceAssignmentContainer.innerHTML = "<p>Loading services...</p>";
    assignServiceModal.style.display = "block";

    try {
      const [servicesResponse, staffResponse] = await Promise.all([
        api.get("/services"),
        api.get(`/staff/${staffId}`),
      ]);

      const allServices = servicesResponse.data.data;
      const staffDetails = staffResponse.data.data;
      assignModalTitle.textContent = `Assign Services to ${staffDetails.user.firstName}`;
      const assignedServiceIds = new Set(
        staffDetails.services.map((s) => s.id)
      );

      serviceAssignmentContainer.innerHTML = allServices
        .map(
          (service) => `
        <div>
          <input type="checkbox" id="service-${service.id}" value="${
            service.id
          }" ${assignedServiceIds.has(service.id) ? "checked" : ""}>
          <label for="service-${service.id}">${service.name}</label>
        </div>`
        )
        .join("");
    } catch (error) {
      serviceAssignmentContainer.innerHTML = "<p>Failed to load services.</p>";
    }
  }

  // --- Event Listeners ---
  addStaffBtn.addEventListener("click", () => showStaffModal());
  staffModal
    .querySelector(".close-btn")
    .addEventListener("click", () => (staffModal.style.display = "none"));
  assignServiceModal
    .querySelector(".close-btn")
    .addEventListener(
      "click",
      () => (assignServiceModal.style.display = "none")
    );

  staffListContainer.addEventListener("click", async (e) => {
    const card = e.target.closest(".staff-card");
    if (!card) return;

    const id = card.dataset.id;

    if (e.target.classList.contains("edit-btn")) {
      const response = await api.get(`/staff/${id}`);
      showStaffModal(response.data.data);
    } else if (e.target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this staff member?")) {
        try {
          await api.delete(`/staff/${id}`);
          fetchStaff();
        } catch (error) {
          alert("Failed to delete staff member.");
        }
      }
    } else if (e.target.classList.contains("assign-btn")) {
      showAssignServiceModal(id);
    }
  });

  // Handle Add/Edit Staff form submission
  staffForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = staffIdInput.value;

    // --- Collect Availability Data ---
    const availability = {
      weekly: [],
      overrides: [],
    };

    // Weekly
    document
      .querySelectorAll("#weekly-availability-container .day-availability")
      .forEach((dayDiv) => {
        const day = dayDiv.querySelector("strong").textContent;
        const isAvailable = dayDiv.querySelector(
          ".is-available-checkbox"
        ).checked;
        const slots = [];
        dayDiv
          .querySelectorAll(".slots-container .slot-group")
          .forEach((slotGroup) => {
            const inputs = slotGroup.querySelectorAll('input[type="time"]');
            slots.push({ start: inputs[0].value, end: inputs[1].value });
          });
        availability.weekly.push({ day, isAvailable, slots });
      });

    // Overrides
    document
      .querySelectorAll(
        "#override-availability-container .override-availability"
      )
      .forEach((overrideDiv) => {
        const date = overrideDiv.querySelector(".override-date").value;
        if (date) {
          // Only add if a date is selected
          const isAvailable = overrideDiv.querySelector(
            ".is-available-checkbox"
          ).checked;
          const slots = [];
          overrideDiv
            .querySelectorAll(".slots-container .slot-group")
            .forEach((slotGroup) => {
              const inputs = slotGroup.querySelectorAll('input[type="time"]');
              slots.push({ start: inputs[0].value, end: inputs[1].value });
            });
          availability.overrides.push({ date, isAvailable, slots });
        }
      });

    const data = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      specialization: document.getElementById("specialization").value,
      availability: availability, // Add the structured availability data
    };

    try {
      if (id) {
        await api.put(`/staff/${id}`, data);
      } else {
        await api.post("/staff", data);
      }
      staffModal.style.display = "none";
      fetchStaff();
    } catch (error) {
      alert(error.response.data.message);
    }
  });

  saveAssignmentsBtn.addEventListener("click", async () => {
    const checkboxes = serviceAssignmentContainer.querySelectorAll(
      'input[type="checkbox"]'
    );
    const assignedServiceIds = new Set();
    checkboxes.forEach((cb) =>
      cb.checked ? assignedServiceIds.add(parseInt(cb.value)) : null
    );

    try {
      const staffResponse = await api.get(`/staff/${currentStaffId}`);
      const originalAssignedIds = new Set(
        staffResponse.data.data.services.map((s) => s.id)
      );
      const promises = [];

      for (const id of assignedServiceIds) {
        if (!originalAssignedIds.has(id)) {
          promises.push(
            api.post(`/staff/${currentStaffId}/services/${id}`, {})
          );
        }
      }

      for (const id of originalAssignedIds) {
        if (!assignedServiceIds.has(id)) {
          promises.push(api.delete(`/staff/${currentStaffId}/services/${id}`));
        }
      }

      await Promise.all(promises);
      alert("Assignments updated successfully!");
      assignServiceModal.style.display = "none";
      fetchStaff();
    } catch (error) {
      alert("Failed to update assignments.");
    }
  });

  // --- Initial Load ---
  fetchStaff();
});
