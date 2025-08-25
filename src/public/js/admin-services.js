document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    window.location.href = "/";
    return;
  }

  // DOM Elements
  const serviceListContainer = document.getElementById(
    "service-list-container"
  );
  const serviceModal = document.getElementById("service-modal");
  const addServiceBtn = document.getElementById("add-service-btn");
  const serviceForm = document.getElementById("service-form");
  const modalTitle = document.getElementById("modal-title");
  const serviceIdInput = document.getElementById("service-id");

  // Hide admin-only elements if the user is not an admin
  if (userRole !== "admin") {
    addServiceBtn.style.display = "none";
  }

  // Fetch and render all services
  async function fetchServices() {
    try {
      const response = await api.get("/services");
      renderServiceList(response.data.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      serviceListContainer.innerHTML = "<p>Could not load services.</p>";
    }
  }

  function renderServiceList(services) {
    if (services.length === 0) {
      serviceListContainer.innerHTML = "<p>No services found.</p>";
      return;
    }

    serviceListContainer.innerHTML = services
      .map((service) => {
        const rating = parseFloat(service.averageRating);
        const reviewCount = parseInt(service.reviewCount);
        let ratingDisplay = "No reviews yet";
        if (reviewCount > 0) {
          ratingDisplay = `<strong>Rating:</strong> ${
            !isNaN(rating) ? rating.toFixed(1) : "N/A"
          } ★ (${reviewCount} reviews)`;
        }

        // Conditionally render the delete button for admins only
        const deleteButton =
          userRole === "admin"
            ? `<button class="btn delete-btn" style="background-color: #dc3545;">Delete</button>`
            : "";

        return `
            <div class="service-admin-card" data-id="${service.id}">
                <div>
                    <strong>${service.name}</strong> (${service.category})<br>
                    <small>Duration: ${service.duration} mins | Price: $${service.price}</small>
                    <div class="service-rating-admin">${ratingDisplay}</div>
                </div>
                <div class="service-actions">
                    <button class="btn edit-btn">Edit</button>
                    ${deleteButton}
                </div>
            </div>
            `;
      })
      .join("");
  }

  // Show modal for adding/editing a service
  function showServiceModal(service = null) {
    serviceForm.reset();
    if (service) {
      modalTitle.textContent = "Edit Service";
      serviceIdInput.value = service.id;
      document.getElementById("name").value = service.name;
      document.getElementById("description").value = service.description;
      document.getElementById("duration").value = service.duration;
      document.getElementById("price").value = service.price;
      document.getElementById("category").value = service.category;
    } else {
      modalTitle.textContent = "Add Service";
      serviceIdInput.value = "";
    }
    serviceModal.style.display = "block";
  }

  // Event listeners
  addServiceBtn.addEventListener("click", () => showServiceModal());
  serviceModal
    .querySelector(".close-btn")
    .addEventListener("click", () => (serviceModal.style.display = "none"));

  serviceListContainer.addEventListener("click", async (e) => {
    const card = e.target.closest(".service-admin-card");
    if (!card) return;

    const id = card.dataset.id;

    if (e.target.classList.contains("edit-btn")) {
      const response = await api.get(`/services/${id}`);
      showServiceModal(response.data.data);
    }

    if (e.target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this service?")) {
        try {
          await api.delete(`/services/${id}`);
          fetchServices(); // Refresh list
        } catch (error) {
          alert("Failed to delete service.");
        }
      }
    }
  });

  // Handle form submission
  serviceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = serviceIdInput.value;
    const data = Object.fromEntries(new FormData(e.target).entries());

    // Convert number fields from string to number
    data.duration = parseInt(data.duration);
    data.price = parseFloat(data.price);

    // The id is in the URL, so it should not be in the request body
    delete data.id;

    try {
      if (id) {
        // Update existing service
        await api.put(`/services/${id}`, data);
      } else {
        // Create new service
        await api.post("/services", data);
      }
      serviceModal.style.display = "none";
      fetchServices(); // Refresh list
    } catch (error) {
      alert("Failed to save service. Please check the details.");
    }
  });

  // Initial load
  fetchServices();
});
