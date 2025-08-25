document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get("serviceId");
  const isReschedule = params.get("reschedule") === "true";
  const appointmentId = params.get("appointmentId");
  const token = localStorage.getItem("accessToken");

  if (!serviceId || !token) {
    window.location.href = "/services.html"; // Redirect if no service ID or not logged in
    return;
  }

  // --- DOM Elements ---
  const dateInput = document.getElementById("appointment-date");
  const slotsContainer = document.getElementById("slots-container");
  const serviceDetailsContainer = document.getElementById(
    "service-details-container"
  );
  const bookingMessage = document.getElementById("booking-message");
  const confirmationPanel = document.getElementById("confirmation-panel");
  const proceedToPaymentBtn = document.getElementById("proceed-to-payment-btn");

  // --- State Variables ---
  let selectedService = null;
  let selectedDateTime = null;

  // Set min date to today
  dateInput.min = new Date().toISOString().split("T")[0];

  // Fetch and display service details
  async function fetchServiceDetails() {
    try {
      const response = await api.get(`/services/${serviceId}`);
      selectedService = response.data.data; // Store service details
      serviceDetailsContainer.innerHTML = `
        <h3>${selectedService.name}</h3>
        <p>${selectedService.description}</p>
      `;
    } catch (error) {
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
      const response = await api.get("/appointments/slots", {
        params: { date: selectedDate, serviceId: serviceId },
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
  slotsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("slot-btn")) {
      selectedDateTime = e.target.getAttribute("data-datetime");
      const appointmentDate = new Date(selectedDateTime);

      // Populate confirmation panel
      document.getElementById("confirm-service-name").textContent =
        selectedService.name;
      document.getElementById("confirm-date").textContent =
        appointmentDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      document.getElementById("confirm-time").textContent =
        appointmentDate.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      document.getElementById(
        "confirm-price"
      ).textContent = `₹${selectedService.price}`;

      // Show the panel
      confirmationPanel.classList.remove("hidden");
    }
  });

  // --- Event Listener for 'Proceed to Payment' Button ---
  proceedToPaymentBtn.addEventListener("click", async () => {
    if (isReschedule) {
      try {
        await api.patch(`/appointments/${appointmentId}/reschedule`, {
          appointmentDateTime: selectedDateTime,
        });
        alert("Appointment rescheduled successfully!");
        window.location.href = "/profile.html";
      } catch (error) {
        bookingMessage.textContent =
          error.response?.data?.message ||
          "Could not reschedule the appointment.";
        bookingMessage.className = "form-message error";
        bookingMessage.style.display = "block";
      }
    } else {
      try {
        // Step 1: Create an order on the backend
        const response = await api.post("/payments/create-order", {
          serviceId: selectedService.id,
          appointmentDateTime: selectedDateTime,
        });
        const orderDetails = response.data.data;

        // Step 2: Configure and open Razorpay
        const options = {
          key: orderDetails.key,
          amount: orderDetails.amount,
          currency: orderDetails.currency,
          name: "Sagar's Salon & Spa",
          description: `Appointment for ${orderDetails.serviceName}`,
          order_id: orderDetails.orderId,
          handler: async function (response) {
            // Step 3: Verify the payment
            try {
              await api.post("/payments/verify-payment", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              alert("Payment successful! Your appointment is scheduled.");
              window.location.href = "/profile.html";
            } catch (error) {
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: orderDetails.customerName,
            email: orderDetails.customerEmail,
            contact: orderDetails.customerPhone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        bookingMessage.textContent =
          error.response?.data?.message || "Could not proceed to payment.";
        bookingMessage.className = "form-message error";
        bookingMessage.style.display = "block";
      }
    }
  });

  // Initial load of service details
  fetchServiceDetails();
});
