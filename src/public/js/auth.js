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
    authModalCloseBtn: document.querySelector("#auth-modal .close-btn"), // More specific selector for the auth modal
    authModal: document.getElementById("auth-modal"),
  };

  function updateNavUI(isLoggedIn) {
    const loggedInElements = document.querySelectorAll(".logged-in");
    const loggedOutElements = document.querySelectorAll(".logged-out");
    const userRole = localStorage.getItem("userRole");

    if (isLoggedIn) {
      loggedInElements.forEach((el) => {
        if (el.classList.contains("customer-link") && userRole !== "customer") {
          el.style.display = "none";
        } else if (
          el.classList.contains("admin-link") &&
          userRole !== "admin" &&
          userRole !== "staff"
        ) {
          el.style.display = "none";
        } else {
          // Check if it's in the sidebar or a regular nav link
          if (el.parentElement.id === "admin-sidebar") {
            el.style.display = "block";
          } else {
            el.style.display = "list-item";
          }
        }
      });
      loggedOutElements.forEach((el) => (el.style.display = "none"));
    } else {
      loggedInElements.forEach((el) => (el.style.display = "none"));
      loggedOutElements.forEach((el) => (el.style.display = "list-item"));
    }
  }

  // --- Auth Event Listeners ---
  elements.loginBtn?.addEventListener("click", () => openModal("login"));
  elements.signupBtn?.addEventListener("click", () => openModal("signup"));

  // Use the logout button from the sidebar
  const sidebarLogoutBtn = document.querySelector("#admin-sidebar #logout-btn");
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener("click", () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      window.location.href = "/";
    });
  }

  // Use the logout button from the main nav (for non-admin pages)
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      window.location.href = "/";
    });
  }

  elements.authModalCloseBtn?.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target == elements.authModal) closeModal();
  });

  // --- Initial UI State ---
  if (localStorage.getItem("accessToken")) {
    updateNavUI(true);
  } else {
    updateNavUI(false);
  }

  // --- Admin Sidebar Logic ---
  const menuBtn = document.querySelector(".menu-btn");
  const sidebarCloseBtn = document.querySelector(".sidebar .close-btn");
  const sidebar = document.getElementById("admin-sidebar");

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent the window click listener from closing it immediately
      document.body.classList.add("sidebar-open");
    });
  }

  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener("click", () => {
      document.body.classList.remove("sidebar-open");
    });
  }

  window.addEventListener("click", (event) => {
    if (document.body.classList.contains("sidebar-open")) {
      if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
        document.body.classList.remove("sidebar-open");
      }
    }
  });
});
