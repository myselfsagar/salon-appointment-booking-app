// --- Globally Accessible Functions ---
function openModal(formToShow = "login") {
  const authModal = document.getElementById("auth-modal");
  if (!authModal) return; // Exit if modal isn't on the page

  const loginForm = document.getElementById("login-form-container");
  const signupForm = document.getElementById("signup-form-container");
  const forgotForm = document.getElementById("forgot-password-container");

  authModal.style.display = "block";
  loginForm.style.display = "none";
  signupForm.style.display = "none";
  forgotForm.style.display = "none";

  if (formToShow === "login") loginForm.style.display = "block";
  else if (formToShow === "signup") signupForm.style.display = "block";
  else if (formToShow === "forgot") forgotForm.style.display = "block";
}

function closeModal() {
  const authModal = document.getElementById("auth-modal");
  if (authModal) {
    authModal.style.display = "none";
  }
}

// --- Page Load Logic ---
document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const elements = {
    loginBtn: document.getElementById("login-btn"),
    signupBtn: document.getElementById("signup-btn"),
    logoutBtn: document.getElementById("logout-btn"),
    closeBtn: document.querySelector(".close-btn"),
    authModal: document.getElementById("auth-modal"),
  };

  function updateNavUI(isLoggedIn) {
    const loggedInElements = document.querySelectorAll(".logged-in");
    const loggedOutElements = document.querySelectorAll(".logged-out");

    if (isLoggedIn) {
      loggedInElements.forEach((el) => (el.style.display = "list-item"));
      loggedOutElements.forEach((el) => (el.style.display = "none"));
    } else {
      loggedInElements.forEach((el) => (el.style.display = "none"));
      loggedOutElements.forEach((el) => (el.style.display = "list-item"));
    }
  }

  // --- Event Listeners ---
  elements.loginBtn?.addEventListener("click", () => openModal("login"));
  elements.signupBtn?.addEventListener("click", () => openModal("signup"));
  elements.logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/"; // Redirect to home on logout
  });

  elements.closeBtn?.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target == elements.authModal) closeModal();
  });

  // --- Initial UI State ---
  if (localStorage.getItem("accessToken")) {
    updateNavUI(true);
  } else {
    updateNavUI(false);
  }
});
