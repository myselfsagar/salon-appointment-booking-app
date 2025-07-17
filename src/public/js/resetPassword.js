// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const parts = window.location.href.split("/");
const lastPart = parts[parts.length - 1];

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// Password visibility toggle
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

togglePassword.addEventListener("click", () => {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.classList.toggle("fa-eye-slash");
});

toggleConfirmPassword.addEventListener("click", () => {
  const type =
    confirmPasswordInput.getAttribute("type") === "password"
      ? "text"
      : "password";
  confirmPasswordInput.setAttribute("type", type);
  toggleConfirmPassword.classList.toggle("fa-eye-slash");
});

// Form submission
const resetPasswordForm = document.getElementById("resetPasswordForm");
const passwordAlert = document.getElementById("passwordAlert");
const successAlert = document.getElementById("successAlert");

resetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate passwords match
  if (password !== confirmPassword) {
    passwordAlert.style.display = "block";
    setTimeout(() => {
      passwordAlert.style.display = "none";
    }, 3000);
    return;
  }

  try {
    const data = {
      resetId: lastPart,
      newPassword: password,
    };

    const response = await axios.post("/password/updatePassword", data);

    if (response.data.statusCode === 403) {
      //link expired
      alert("Link has expired, kindly reset again.");
    } else {
      // Simulate successful reset
      successAlert.style.display = "block";
    }

    // Redirect after 3 seconds
    resetPasswordForm.reset();
    setTimeout(() => {
      window.location.replace("/");
    }, 5000);
  } catch (error) {
    console.error("Error resetting password:", error);
  }
});

// Close alert buttons
document.getElementById("closePasswordAlert").addEventListener("click", () => {
  passwordAlert.style.display = "none";
});

document.getElementById("closeSuccessAlert").addEventListener("click", () => {
  successAlert.style.display = "none";
});
