document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
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

  // --- Staff Management Functions ---
  async function fetchStaff() {
    try {
      const response = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        // Create a list of service names
        const serviceNames = staff.services.map((s) => s.name).join(", ");

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
                <button class="btn assign-btn">Assign Services</button>
                <button class="btn edit-btn">Edit</button>
                <button class="btn delete-btn" style="background-color: #dc3545;">Delete</button>
            </div>
        </div>`;
      })
      .join("");
  }

  function showStaffModal(staff = null) {
    staffForm.reset();
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
        axios.get("/services", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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
          }" 
                    ${assignedServiceIds.has(service.id) ? "checked" : ""}>
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

  // Main listener for all actions on the staff list
  staffListContainer.addEventListener("click", async (e) => {
    const card = e.target.closest(".staff-card");
    if (!card) return;

    const id = card.dataset.id;

    if (e.target.classList.contains("edit-btn")) {
      const response = await axios.get(`/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showStaffModal(response.data.data);
    } else if (e.target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this staff member?")) {
        try {
          await axios.delete(`/staff/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
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
    const data = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      specialization: document.getElementById("specialization").value,
    };

    try {
      if (id) {
        await axios.put(`/staff/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/staff", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      staffModal.style.display = "none";
      fetchStaff();
    } catch (error) {
      alert(error.response.data.message);
    }
  });

  // Handle saving service assignments
  saveAssignmentsBtn.addEventListener("click", async () => {
    const checkboxes = serviceAssignmentContainer.querySelectorAll(
      'input[type="checkbox"]'
    );
    const assignedServiceIds = new Set();
    checkboxes.forEach((cb) => {
      if (cb.checked) {
        assignedServiceIds.add(parseInt(cb.value));
      }
    });

    try {
      const staffResponse = await axios.get(`/staff/${currentStaffId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const originalAssignedIds = new Set(
        staffResponse.data.data.services.map((s) => s.id)
      );
      const promises = [];

      for (const id of assignedServiceIds) {
        if (!originalAssignedIds.has(id)) {
          promises.push(
            axios.post(
              `/staff/${currentStaffId}/services/${id}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            )
          );
        }
      }

      for (const id of originalAssignedIds) {
        if (!assignedServiceIds.has(id)) {
          promises.push(
            axios.delete(`/staff/${currentStaffId}/services/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          );
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
