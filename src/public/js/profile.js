document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "/"; // Redirect home if not logged in
    return;
  }

  const profileContainer = document.getElementById("profile-container");
  const appointmentsContainer = document.getElementById(
    "appointments-container"
  );

  async function fetchProfile() {
    try {
      const response = await axios.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      renderProfile(response.data.data);
    } catch (error) {
      profileContainer.innerHTML = "<p>Could not load profile.</p>";
    }
  }

  function renderProfile(user) {
    profileContainer.innerHTML = `
            <form id="profile-form">
                <div class="form-group">
                    <label>First Name:</label>
                    <input type="text" name="firstName" value="${user.firstName}" required>
                </div>
                <div class="form-group">
                    <label>Last Name:</label>
                    <input type="text" name="lastName" value="${user.lastName}" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" value="${user.email}" disabled>
                </div>
                <div class="form-group">
                    <label>Phone:</label>
                    <input type="tel" name="phone" value="${user.phone}" required>
                </div>
                <button type="submit" class="btn update-profile-btn">Update Profile</button>
                 <div id="profile-message" class="form-message"></div>
            </form>
        `;

    // Add form submission handler
    document
      .getElementById("profile-form")
      .addEventListener("submit", handleProfileUpdate);
  }

  async function handleProfileUpdate(e) {
    e.preventDefault();
    const profileMessage = document.getElementById("profile-message");
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      await axios.put("/users/me", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      profileMessage.textContent = "Profile updated successfully!";
      profileMessage.className = "form-message success";
      profileMessage.style.display = "block";
      setTimeout(() => {
        profileMessage.style.display = "none";
      }, 3000);
    } catch (error) {
      profileMessage.textContent =
        error.response?.data?.message || "Failed to update profile.";
      profileMessage.className = "form-message error";
      profileMessage.style.display = "block";
    }
  }

  async function fetchAppointments() {
    try {
      const response = await axios.get("/appointments/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      renderAppointments(response.data.data);
    } catch (error) {
      appointmentsContainer.innerHTML = "<p>Could not load appointments.</p>";
    }
  }

  function renderAppointments(appointments) {
    if (appointments.length === 0) {
      appointmentsContainer.innerHTML =
        "<p>You have no appointments scheduled.</p>";
      return;
    }

    appointmentsContainer.innerHTML = appointments
      .map((app) => {
        const staffName = app.staff_profile
          ? `${app.staff_profile.user.firstName} ${app.staff_profile.user.lastName}`
          : "N/A";

        // Create a date object from the appointmentDateTime string
        const appointmentDateTime = new Date(app.appointmentDateTime);

        // Format date and time specifically for IST (Asia/Kolkata)
        const appointmentDate = appointmentDateTime.toLocaleDateString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        );
        const appointmentTime = appointmentDateTime.toLocaleTimeString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        );

        const isCancellable =
          new Date(app.appointmentDateTime) >
          new Date(Date.now() + 24 * 60 * 60 * 1000);

        return `
                <div class="appointment-card" data-appointment-id="${
                  app.id
                }" data-service-id="${app.service.id}">
                    <h4>${app.service.name}</h4>
                    <p><strong>Date:</strong> ${appointmentDate}</p>
                    <p><strong>Time:</strong> ${appointmentTime}</p>
                    <p><strong>With:</strong> ${staffName}</p>
                    <p><strong>Status:</strong> <span class="status-${
                      app.status
                    }">${app.status}</span></p>
                    ${
                      app.status === "scheduled" && isCancellable
                        ? `
                        <div class="appointment-actions">
                            <button class="btn reschedule-btn">Reschedule</button>
                            <button class="btn cancel-btn">Cancel</button>
                        </div>
                        `
                        : ""
                    }
                </div>
            `;
      })
      .join("");
  }

  appointmentsContainer.addEventListener("click", async (e) => {
    const target = e.target;
    const card = target.closest(".appointment-card");
    if (!card) return;

    const appointmentId = card.dataset.appointmentId;
    const serviceId = card.dataset.serviceId;

    if (target.classList.contains("cancel-btn")) {
      if (confirm("Are you sure you want to cancel this appointment?")) {
        try {
          await axios.patch(
            `/appointments/${appointmentId}/cancel`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          alert("Appointment cancelled successfully.");
          fetchAppointments(); // Refresh the list
        } catch (error) {
          alert(
            error.response?.data?.message || "Failed to cancel appointment."
          );
        }
      }
    }

    if (target.classList.contains("reschedule-btn")) {
      if (
        confirm(
          "This will cancel your current appointment and let you pick a new time. Are you sure?"
        )
      ) {
        try {
          await axios.patch(
            `/appointments/${appointmentId}/cancel`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Redirect to booking page to choose a new slot
          window.location.href = `/booking.html?serviceId=${serviceId}`;
        } catch (error) {
          alert(
            error.response?.data?.message ||
              "Failed to start rescheduling process."
          );
        }
      }
    }
  });

  fetchProfile();
  fetchAppointments();
});
