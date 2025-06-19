import apiService from "./ApiService.js";

class SignupManager {
  constructor() {
    this.init();
  }
  async init() {
    this.form = document.getElementById("signup-form");
    try {
      const currentUser = await apiService.getCurrentUser();
      if (currentUser?.role === "admin") {
        window.location.href = "/Admindashboard/";
        return;
      } else if (currentUser?.role === "teacher") {
        window.location.href = "/teachers_task_list/";
        return;
      }
      this.setupEventListeners();
    } catch (error) {
      this.setupEventListeners();
    }
  }
  setupEventListeners() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSignup(e);
    });

    // Add input validation listeners
    const inputs = this.form.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
    });
  }

  async handleSignup(event) {
    const formData = new FormData(event.target);

    const userData = {
      username: formData.get("username"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirm_password"),
      email: formData.get("email"),
      name: formData.get("name"),
      role: formData.get("role"),
    };

    try {
      await this.validateSignupData(userData);

      // Remove confirm password before sending to API
      delete userData.confirmPassword;

      await apiService.request("/auth/signup/", {
        method: "POST",
        content_type: "application/json",
        body: JSON.stringify(userData),
        skipAuth: true,
      });

      this.showSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login/";
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      this.showError(error.message || "Failed to create account");
    }
  }

  validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;

    switch (fieldName) {
      case "username":
        if (!value) {
          this.showFieldError(input, "Username is required");
        } else if (value.length < 3) {
          this.showFieldError(input, "Username must be at least 3 characters");
        } else {
          this.clearFieldError(input);
        }
        break;

      case "password":
        if (!value) {
          this.showFieldError(input, "Password is required");
        } else if (value.length < 6) {
          this.showFieldError(input, "Password must be at least 6 characters");
        } else {
          this.clearFieldError(input);
        }
        break;

      case "confirm_password":
        const password = this.form.querySelector(
          'input[name="password"]'
        ).value;
        if (!value) {
          this.showFieldError(input, "Please confirm your password");
        } else if (value !== password) {
          this.showFieldError(input, "Passwords do not match");
        } else {
          this.clearFieldError(input);
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          this.showFieldError(input, "Email is required");
        } else if (!emailRegex.test(value)) {
          this.showFieldError(input, "Please enter a valid email");
        } else {
          this.clearFieldError(input);
        }
        break;

      case "name":
        if (!value) {
          this.showFieldError(input, "Name is required");
        } else {
          this.clearFieldError(input);
        }
        break;
    }
  }

  async validateSignupData(data) {
    const errors = [];

    if (!data.username?.trim()) {
      errors.push("Username is required");
    } else if (data.username.length < 3) {
      errors.push("Username must be at least 3 characters");
    }

    if (!data.password?.trim()) {
      errors.push("Password is required");
    } else if (data.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }

    if (data.password !== data.confirmPassword) {
      errors.push("Passwords do not match");
    }

    if (!data.email?.trim()) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("Please enter a valid email");
      }
    }

    if (!data.name?.trim()) {
      errors.push("Name is required");
    }

    if (!data.role) {
      errors.push("Role is required");
    }

    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }

    // Check if username already exists
    try {
      const response = await apiService.request(
        `/auth/check-username/?username=${data.username}`,
        {
          method: "GET",
          skipAuth: true,
        }
      );
      if (response.exists) {
        throw new Error("Username already exists");
      }
    } catch (error) {
      if (error.message !== "Username already exists") {
        console.error("Error checking username:", error);
      }
      throw error;
    }
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    errorDiv.style.color = "#f44336";
    errorDiv.style.fontSize = "0.8rem";
    errorDiv.style.marginTop = "4px";
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = "#f44336";
  }

  clearFieldError(field) {
    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
      field.style.borderColor = "";
    }
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f44336;
            color: white;
            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
        `;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
      errorDiv.style.opacity = "0";
      errorDiv.style.transition = "opacity 0.3s ease";
      setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
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
    }, 2000);
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SignupManager();
});
