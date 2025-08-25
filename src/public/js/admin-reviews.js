document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "/";
    return;
  }

  const reviewListContainer = document.getElementById("review-list-container");
  const responseModal = document.getElementById("review-response-modal");
  const responseForm = document.getElementById("review-response-form");
  const reviewIdInput = document.getElementById("review-id-input");
  const reviewDetailsContainer = document.getElementById(
    "review-details-container"
  );

  async function fetchReviews() {
    try {
      const response = await api.get("/reviews");
      renderReviewList(response.data.data);
    } catch (error) {
      reviewListContainer.innerHTML = "<p>Failed to load reviews.</p>";
      console.error("Error fetching reviews:", error);
    }
  }

  function renderReviewList(reviews) {
    if (reviews.length === 0) {
      reviewListContainer.innerHTML = "<p>No reviews found.</p>";
      return;
    }

    reviewListContainer.innerHTML = reviews
      .map(
        (review) => `
            <div class="review-admin-card" data-review-id="${review.id}">
                <div class="review-content">
                    <p>
                        <strong>${review.user.firstName} ${
          review.user.lastName
        }</strong> reviewed 
                        <strong>${review.service.name}</strong> - 
                        <span class="rating">${"★".repeat(
                          review.rating
                        )}${"☆".repeat(5 - review.rating)}</span>
                    </p>
                    <p class="comment"><em>"${
                      review.comment || "No comment provided."
                    }"</em></p>
                    ${
                      review.staffResponse
                        ? `<p class="staff-response"><strong>Your Response:</strong> ${review.staffResponse}</p>`
                        : '<p class="no-response">No response yet.</p>'
                    }
                </div>
                <button class="btn respond-btn">
                    ${review.staffResponse ? "Edit Response" : "Respond"}
                </button>
            </div>
        `
      )
      .join("");
  }

  reviewListContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("respond-btn")) {
      const card = e.target.closest(".review-admin-card");
      const reviewId = card.dataset.reviewId;
      const reviewData = {
        comment: card.querySelector(".comment").textContent,
        response:
          card
            .querySelector(".staff-response")
            ?.textContent.replace("Your Response: ", "") || "",
      };

      reviewIdInput.value = reviewId;
      reviewDetailsContainer.innerHTML = `<p>${reviewData.comment}</p>`;
      document.getElementById("staff-response-textarea").value =
        reviewData.response;
      responseModal.style.display = "block";
    }
  });

  responseModal.querySelector(".close-btn").addEventListener("click", () => {
    responseModal.style.display = "none";
  });

  responseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const reviewId = reviewIdInput.value;
    const responseText = document.getElementById(
      "staff-response-textarea"
    ).value;

    try {
      await api.patch(`/reviews/${reviewId}/respond`, {
        response: responseText,
      });
      alert("Response submitted successfully!");
      responseModal.style.display = "none";
      fetchReviews();
    } catch (error) {
      alert("Failed to submit response.");
      console.error("Error submitting response:", error);
    }
  });

  fetchReviews();
});
