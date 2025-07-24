document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    // In a real app, you'd also check if the user is an admin
    window.location.href = "/";
    return;
  }

  // DOM Elements
  const staffListContainer = document.getElementById("staff-list-container");
  const staffModal = document.getElementById("staff-modal");
  const addStaffBtn = document.getElementById("add-staff-btn");
  const staffForm = document.getElementById("staff-form");
  const modalTitle = document.getElementById("modal-title");
  const staffIdInput = document.getElementById("staff-id");

  // Fetch and render all staff members
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
      .map(
        (staff) => `
            <div class="staff-card" data-id="${staff.id}">
                <div>
                    <strong>${staff.user.firstName} ${
          staff.user.lastName
        }</strong><br>
                    <small>${
                      staff.specialization || "No specialization"
                    }</small>
                </div>
                <div class="staff-actions">
                    <button class="btn edit-btn">Edit</button>
                    <button class="btn delete-btn" style="background-color: #dc3545;">Delete</button>
                </div>
            </div>
        `
      )
      .join("");
  }

  // Show modal for adding/editing staff
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

  // Event listeners
  addStaffBtn.addEventListener("click", () => showStaffModal());
  staffModal
    .querySelector(".close-btn")
    .addEventListener("click", () => (staffModal.style.display = "none"));

  staffListContainer.addEventListener("click", async (e) => {
    const card = e.target.closest(".staff-card");
    if (!card) return;

    const id = card.dataset.id;

    if (e.target.classList.contains("edit-btn")) {
      const response = await axios.get(`/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showStaffModal(response.data.data);
    }

    if (e.target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this staff member?")) {
        try {
          await axios.delete(`/staff/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchStaff(); // Refresh list
        } catch (error) {
          alert("Failed to delete staff member.");
        }
      }
    }
  });

  // Handle form submission
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
        // Update existing staff
        await axios.put(`/staff/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new staff
        await axios.post("/staff", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      staffModal.style.display = "none";
      fetchStaff(); // Refresh list
    } catch (error) {
      alert("Failed to save staff member. Please check the details.");
    }
  });

  // Initial load
  fetchStaff();
});
