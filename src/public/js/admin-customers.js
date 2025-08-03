document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "/";
    return;
  }

  // DOM Elements
  const customerListContainer = document.getElementById(
    "customer-list-container"
  );
  const customerModal = document.getElementById("customer-modal");
  const customerForm = document.getElementById("customer-form");
  const modalTitle = document.getElementById("modal-title");
  const customerIdInput = document.getElementById("customer-id");

  // Fetch and render all customers
  async function fetchCustomers() {
    try {
      const response = await axios.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      renderCustomerList(response.data.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      customerListContainer.innerHTML = "<p>Could not load customers.</p>";
    }
  }

  function renderCustomerList(customers) {
    if (customers.length === 0) {
      customerListContainer.innerHTML = "<p>No customers found.</p>";
      return;
    }

    customerListContainer.innerHTML = customers
      .map(
        (customer) => `
            <div class="staff-card" data-id="${customer.id}">
                <div>
                    <strong>${customer.firstName} ${customer.lastName}</strong><br>
                    <small>Email: ${customer.email} | Phone: ${customer.phone}</small>
                </div>
                <div class="staff-actions">
                    <button class="btn edit-btn">Edit</button>
                </div>
            </div>
        `
      )
      .join("");
  }

  // Show modal for editing a customer
  function showCustomerModal(customer) {
    customerForm.reset();
    modalTitle.textContent = "Edit Customer";
    customerIdInput.value = customer.id;
    document.getElementById("firstName").value = customer.firstName;
    document.getElementById("lastName").value = customer.lastName;
    document.getElementById("email").value = customer.email;
    document.getElementById("phone").value = customer.phone;
    customerModal.style.display = "block";
  }

  // Event listeners
  customerModal
    .querySelector(".close-btn")
    .addEventListener("click", () => (customerModal.style.display = "none"));

  customerListContainer.addEventListener("click", async (e) => {
    const card = e.target.closest(".staff-card");
    if (!card) return;

    const id = card.dataset.id;

    if (e.target.classList.contains("edit-btn")) {
      try {
        const response = await axios.get(`/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showCustomerModal(response.data.data);
      } catch (error) {
        alert("Could not fetch customer details.");
      }
    }
  });

  // Handle form submission
  customerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = customerIdInput.value;
    const data = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      phone: document.getElementById("phone").value,
    };

    try {
      await axios.put(`/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      customerModal.style.display = "none";
      fetchCustomers(); // Refresh list
    } catch (error) {
      alert("Failed to save customer details. Please check the information.");
    }
  });

  // Initial load
  fetchCustomers();
});
