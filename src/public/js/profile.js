document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "/"; // Redirect home if not logged in
    return;
  }

  // --- DOM Elements ---
  const profileContainer = document.getElementById("profile-container");
  const appointmentsContainer = document.getElementById(
    "appointments-container"
  );
  const reviewModal = document.getElementById("review-modal");
  const reviewForm = document.getElementById("review-form");
  const stars = document.querySelectorAll(".star-rating .star");

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

        const appointmentDateTime = new Date(app.appointmentDateTime);

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

        let actionButtons = "";
        if (app.status === "scheduled" && isCancellable) {
          actionButtons = `<div class="appointment-actions">
              <button class="btn reschedule-btn">Reschedule</button>
              <button class="btn cancel-btn">Cancel</button>
            </div>`;
        } else if (app.status === "completed" && !app.review) {
          let reviewButton = !app.review
            ? `<button class="btn review-btn">Leave a Review</button>`
            : "";

          let invoiceButton = `<button class="btn invoice-btn" data-appointment-id="${app.id}">Download Invoice</button>`;

          let staffResponseHtml = "";
          if (app.review?.staffResponse) {
            staffResponseHtml = `<div class="staff-response"><strong>Staff Response:</strong> ${app.review.staffResponse}</div>`;
          }

          actionButtons = `
            <div class="appointment-actions">
                ${reviewButton}
                ${invoiceButton}
            </div>
            ${
              app.review
                ? `
            <div class="review-display">
                <p><strong>Your Review:</strong> ${"★".repeat(
                  app.review.rating
                )}${"☆".repeat(5 - app.review.rating)}</p>
                <p><em>"${app.review.comment}"</em></p>
                ${staffResponseHtml}
            </div>`
                : ""
            }
          `;
        } else if (app.review) {
          let staffResponseHtml = "";
          if (app.review.staffResponse) {
            staffResponseHtml = `<div class="staff-response"><strong>Staff Response:</strong> ${app.review.staffResponse}</div>`;
          }
          actionButtons = `<div class="appointment-actions">
                              <p><strong>Your Review:</strong> ${"★".repeat(
                                app.review.rating
                              )}${"☆".repeat(5 - app.review.rating)}</p>
                              <p><em>"${app.review.comment}"</em></p>
                              ${staffResponseHtml}
                           </div>`;
        }

        return `
          <div class="appointment-card" data-appointment-id="${app.id}" data-service-id="${app.service.id}">
            <h4>${app.service.name}</h4>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
            <p><strong>With:</strong> ${staffName}</p>
            <p><strong>Status:</strong> <span class="status-${app.status}">${app.status}</span></p>
            ${actionButtons}
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
      window.location.href = `/booking.html?serviceId=${serviceId}&reschedule=true&appointmentId=${appointmentId}`;
    }

    if (target.classList.contains("review-btn")) {
      const card = e.target.closest(".appointment-card");
      const appointmentId = card.dataset.appointmentId;
      document.getElementById("review-appointment-id").value = appointmentId;
      reviewModal.style.display = "block";
    }

    if (target.classList.contains("invoice-btn")) {
      const appointmentId = target.dataset.appointmentId;
      try {
        const response = await axios.get(
          `/appointments/${appointmentId}/invoice`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob", // Important: tell axios to expect a file
          }
        );

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice-${appointmentId}.pdf`); // Set the filename
        document.body.appendChild(link);
        link.click();
        link.remove(); // Clean up the temporary link
      } catch (error) {
        alert("Could not download the invoice.");
        console.error("Invoice download error:", error);
      }
    }
  });

  // --- Review Modal Logic ---
  reviewModal.querySelector(".close-btn").addEventListener("click", () => {
    reviewModal.style.display = "none";
    reviewForm.reset();
  });

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = star.dataset.value;
      document.getElementById("rating-value").value = rating;
      stars.forEach((s) => {
        s.style.color = s.dataset.value <= rating ? "#ffc107" : "#e4e5e9";
      });
    });
  });

  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const reviewMessage = document.getElementById("review-message");
    try {
      const response = await axios.post(
        "/reviews",
        {
          appointmentId: document.getElementById("review-appointment-id").value,
          rating: document.getElementById("rating-value").value,
          comment: document.getElementById("review-comment").value,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      reviewMessage.textContent = "Review submitted successfully!";
      reviewMessage.className = "form-message success";
      reviewMessage.style.display = "block";

      setTimeout(() => {
        reviewModal.style.display = "none";
        reviewForm.reset();
        fetchAppointments(); // Refresh to hide the review button
      }, 2000);
    } catch (error) {
      reviewMessage.textContent =
        error.response?.data?.message || "Failed to submit review.";
      reviewMessage.className = "form-message error";
      reviewMessage.style.display = "block";
    }
  });

  fetchProfile();
  fetchAppointments();
});
