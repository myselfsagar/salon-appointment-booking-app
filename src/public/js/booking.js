document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get("serviceId");
  const token = localStorage.getItem("accessToken");

  if (!serviceId || !token) {
    window.location.href = "/services.html"; // Redirect if no service ID or not logged in
    return;
  }

  const dateInput = document.getElementById("appointment-date");
  const slotsContainer = document.getElementById("slots-container");
  const serviceDetailsContainer = document.getElementById(
    "service-details-container"
  );
  const bookingMessage = document.getElementById("booking-message");

  // Set min date to today
  dateInput.min = new Date().toISOString().split("T")[0];

  // Fetch and display service details
  async function fetchServiceDetails() {
    try {
      const response = await axios.get(`/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const service = response.data.data;
      serviceDetailsContainer.innerHTML = `
                <h3>${service.name}</h3>
                <p>${service.description}</p>
            `;
    } catch (error) {
      console.error("Failed to load service details", error);
      serviceDetailsContainer.innerHTML =
        "<p>Could not load service details.</p>";
    }
  }

  // Fetch available slots when a date is selected
  dateInput.addEventListener("change", async () => {
    const selectedDate = dateInput.value;
    if (!selectedDate) return;

    slotsContainer.innerHTML = "<p>Loading available slots...</p>";
    try {
      const response = await axios.get("/appointments/slots", {
        params: { date: selectedDate, serviceId: serviceId },
        headers: { Authorization: `Bearer ${token}` },
      });

      const slots = response.data.data.availableSlots;
      renderSlots(slots);
    } catch (error) {
      slotsContainer.innerHTML = "<p>Could not load slots for this date.</p>";
    }
  });

  // Render the available time slots as buttons
  function renderSlots(slots) {
    if (slots.length === 0) {
      slotsContainer.innerHTML =
        "<p>No available slots for this date. Please try another day.</p>";
      return;
    }
    slotsContainer.innerHTML = slots
      .map(
        (slot) =>
          `<button class="btn slot-btn" data-datetime="${slot}">${new Date(
            slot
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</button>`
      )
      .join("");
  }

  // Handle slot button click to book the appointment
  slotsContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("slot-btn")) {
      const appointmentDateTime = e.target.getAttribute("data-datetime");

      try {
        const response = await axios.post(
          "/appointments",
          {
            serviceId: serviceId,
            appointmentDateTime: appointmentDateTime,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        bookingMessage.textContent = "Appointment booked successfully!";
        bookingMessage.className = "form-message success";
        bookingMessage.style.display = "block";
        setTimeout(() => {
          bookingMessage.style.display = "none";
        }, 3000);
        slotsContainer.innerHTML = ""; // Clear slots after booking
      } catch (error) {
        bookingMessage.textContent =
          error.response?.data?.message || "Failed to book appointment.";
        bookingMessage.className = "form-message error";
        bookingMessage.style.display = "block";
      }
    }
  });

  // Initial load of service details
  fetchServiceDetails();
});
