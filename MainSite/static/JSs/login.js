import apiService from "./ApiService.js";

class LoginManager {
  constructor() {
    this.init();
  }

  async init() {
    try {
      const currentUser = await apiService.getCurrentUser();
      if (currentUser?.role === "admin") {
        window.location.href = "/Admindashboard";
        return;
      } else if (currentUser?.role === "teacher") {
        window.location.href = "/teachers_task_list";
        return;
      }
      this.setupForm();
    } catch (error) {
      this.setupForm();
    }
  }

  setupForm() {
    const loginForm = document.querySelector(".login-form");
    const passwordInput = document.getElementById("password");

    const passwordToggle = document.createElement("span");
    passwordToggle.className = "password-toggle";
    passwordToggle.innerHTML = "👁";
    passwordInput.parentNode.appendChild(passwordToggle);

    passwordToggle.addEventListener("click", () =>
      this.togglePasswordVisibility()
    );
    loginForm.addEventListener("submit", (e) => this.handleLoginSubmission(e));
  }

  async handleLoginSubmission(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    const loginButton = form.querySelector('button[type="submit"]');

    try {
      if (!username || !password) {
        throw new Error("All fields are required");
      }

      loginButton.disabled = true;
      loginButton.innerHTML =
        '<div class="button-spinner"></div> Authenticating';

      await apiService.login({ username, password });
      const user = await apiService.getCurrentUser();

      // Show success message before redirecting
      this.showSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "/Admindashboard";
        } else {
          window.location.href = "/teachers_task_list";
        }
      }, 1200);
    } catch (error) {
      console.error("Login error:", error);
      this.showToast(
        error.message || "Authentication failed. Please check your credentials",
        "error"
      );
    } finally {
      loginButton.disabled = false;
      loginButton.innerHTML = "Log In";
    }
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  }

  showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent = message;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4caf50;
      color: white;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
    `;
    document.body.appendChild(successDiv);
    setTimeout(() => {
      successDiv.style.opacity = "0";
      successDiv.style.transition = "opacity 0.3s ease";
      setTimeout(() => successDiv.remove(), 300);
    }, 1200);
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LoginManager();
});
