document.addEventListener("DOMContentLoaded", async () => {
  const servicesContainer = document.getElementById("services-container");
  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.log("User is not logged in. Viewing services as a guest.");
  }

  try {
    const response = await axios.get("/services", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const services = response.data.data;
    if (services.length === 0) {
      servicesContainer.innerHTML =
        "<p>No services available at the moment.</p>";
      return;
    }

    renderServices(services);
  } catch (error) {
    servicesContainer.innerHTML =
      "<p>Could not load services. Please try again later.</p>";
    console.error("Error fetching services:", error);
  }
});

async function renderServices(services) {
  const servicesContainer = document.getElementById("services-container");
  servicesContainer.innerHTML = "";

  for (const service of services) {
    let avgRating = "No reviews yet";
    try {
      const reviewResponse = await axios.get(`/reviews/service/${service.id}`);
      const reviews = reviewResponse.data.data;
      if (reviews.length > 0) {
        const totalRating = reviews.reduce(
          (acc, review) => acc + review.rating,
          0
        );
        avgRating = `${(totalRating / reviews.length).toFixed(1)} ★ (${
          reviews.length
        } reviews)`;
      }
    } catch (error) {
      console.error(`Could not fetch reviews for service ${service.id}`);
    }

    const serviceCard = document.createElement("div");
    serviceCard.className = "service-card";
    serviceCard.innerHTML = `
      <h3>${service.name}</h3>
      <p class="service-rating"><strong>Rating:</strong> ${avgRating}</p>
      <p>${service.description}</p>
      <div class="service-details">
          <span>Duration: ${service.duration} mins</span>
          <span>Price: ₹${service.price}</span>
      </div>
      <button class="btn book-service-btn" data-service-id="${service.id}">Book Now</button>
    `;
    servicesContainer.appendChild(serviceCard);
  }
}

document
  .getElementById("services-container")
  .addEventListener("click", function (e) {
    if (e.target.classList.contains("book-service-btn")) {
      const serviceId = e.target.getAttribute("data-service-id");
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please log in to book an appointment.");
        openModal("login");
        return;
      }

      // Redirect to the booking page with the service ID
      window.location.href = `/booking.html?serviceId=${serviceId}`;
    }
  });
