document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const elements = {
    loginForm: document.getElementById("login-form"),
    signupForm: document.getElementById("signup-form"),
    forgotPasswordForm: document.getElementById("forgot-password-form"),
    formMessage: document.getElementById("form-message"),
    showSignup: document.getElementById("show-signup"),
    showLogin: document.getElementById("show-login"),
    showForgotPassword: document.getElementById("show-forgot-password"),
    backToLogin: document.getElementById("back-to-login"),
  };

  // Helper function to show messages
  let messageTimeout;
  function showMessage(message, isError = false) {
    elements.formMessage.textContent = message;
    elements.formMessage.className = `form-message ${
      isError ? "error" : "success"
    }`;
    elements.formMessage.style.display = "block";
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
      elements.formMessage.style.display = "none";
    }, 3000);
  }

  function getFormData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  // --- Form Switching (re-uses openModal from auth.js which is loading first in the html) ---
  elements.showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    openModal("signup");
  });
  elements.showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    openModal("login");
  });
  elements.showForgotPassword.addEventListener("click", (e) => {
    e.preventDefault();
    openModal("forgot");
  });
  elements.backToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    openModal("login");
  });

  // --- Form Handlers ---
  elements.signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = getFormData(elements.signupForm);
    try {
      const response = await axios.post("/auth/signup", data);
      showMessage(response.data.message || "Signup successful! Please log in.");
      elements.signupForm.reset();
      setTimeout(() => openModal("login"), 1500);
    } catch (error) {
      showMessage(error.response?.data?.message || "An error occurred.", true);
    }
  });

  elements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = getFormData(elements.loginForm);
    try {
      const response = await axios.post("/auth/login", data);
      localStorage.setItem("accessToken", response.data.data.access_token);
      showMessage("Login successful!");
      window.location.reload(); // Reload the page to update UI correctly
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Invalid credentials.",
        true
      );
    }
  });

  elements.forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = getFormData(elements.forgotPasswordForm);
    try {
      const response = await axios.post("/password/forgotPassword", data);
      showMessage(
        response.data.message ||
          "If an account exists, a reset link has been sent."
      );
      elements.forgotPasswordForm.reset();
    } catch (error) {
      showMessage(error.response?.data?.message || "An error occurred.", true);
    }
  });
});
