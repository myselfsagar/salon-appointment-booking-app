document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const elements = {
    loginForm: document.getElementById("login-form"),
    signupForm: document.getElementById("signup-form"),
    forgotPasswordForm: document.getElementById("forgot-password-form"),
    showSignup: document.getElementById("show-signup"),
    showLogin: document.getElementById("show-login"),
    showForgotPassword: document.getElementById("show-forgot-password"),
    backToLogin: document.getElementById("back-to-login"),
    toggleLoginPassword: document.getElementById("toggle-login-password"),
    toggleSignupPassword: document.getElementById("toggle-signup-password"),
  };

  // --- Password Visibility Toggle ---
  function setupPasswordToggle(toggleEl, inputEl) {
    if (toggleEl && inputEl) {
      toggleEl.addEventListener("click", () => {
        const type =
          inputEl.getAttribute("type") === "password" ? "text" : "password";
        inputEl.setAttribute("type", type);
        // Toggle the icon class
        toggleEl.classList.toggle("fa-eye");
        toggleEl.classList.toggle("fa-eye-slash");
      });
    }
  }

  setupPasswordToggle(
    elements.toggleLoginPassword,
    document.getElementById("login-password")
  );
  setupPasswordToggle(
    elements.toggleSignupPassword,
    document.getElementById("signup-password")
  );

  function getFormData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  // Helper to manage button loading state
  function setLoading(form, isLoading) {
    const button = form.querySelector('button[type="submit"]');
    if (isLoading) {
      // Store the button's original text if it's not already stored
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }
      button.disabled = true;
      button.textContent = "Processing...";
    } else {
      button.disabled = false;
      // Restore the original text
      button.textContent = button.dataset.originalText;
    }
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
    setLoading(elements.signupForm, true);
    const data = getFormData(elements.signupForm);
    try {
      const response = await axios.post("/auth/signup", data);
      showToast(
        response.data.message || "Signup successful! Please log in.",
        "success"
      );
      elements.signupForm.reset();
      setTimeout(() => openModal("login"), 1500);
    } catch (error) {
      showToast(error.response?.data?.message || "An error occurred.", "error");
    } finally {
      setLoading(elements.signupForm, false);
    }
  });

  elements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoading(elements.loginForm, true);
    const data = getFormData(elements.loginForm);
    try {
      const response = await axios.post("/auth/login", data);
      const { access_token, role } = response.data.data;

      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("userRole", role);

      showToast("Login successful! Redirecting...", "success");

      setTimeout(() => {
        if (role === "admin" || role === "staff") {
          window.location.href = "/admin/staff.html";
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Invalid credentials.",
        "error"
      );
      // This line was missing. It resets the button state on error.
      setLoading(elements.loginForm, false);
    }
  });

  elements.forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoading(elements.forgotPasswordForm, true);
    const data = getFormData(elements.forgotPasswordForm);
    try {
      const response = await axios.post("/password/forgotPassword", data);
      showToast(
        response.data.message ||
          "If an account exists, a reset link has been sent.",
        "success"
      );
      elements.forgotPasswordForm.reset();
    } catch (error) {
      showToast(error.response?.data?.message || "An error occurred.", "error");
    } finally {
      setLoading(elements.forgotPasswordForm, false);
    }
  });
});
