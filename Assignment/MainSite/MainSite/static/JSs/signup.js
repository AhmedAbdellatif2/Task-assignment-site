<<<<<<< HEAD:media/js/signup.js
import { tasks, users } from "./tasks_data.js";

if (localStorage.getItem("Tasks") === null) {
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}
if (localStorage.getItem("users") === null) {
  localStorage.setItem("users", JSON.stringify(users));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputs = form.querySelectorAll("input, select");

  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|\\:;"'<>,.?/~`-])[A-Za-z\d!@#$%^&*()_+[\]{}|\\:;"'<>,.?/~`-]{8,}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }

  // ID generation function
  const generateUserId = () =>
    `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Form validation and submission
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllErrors();

    const formData = {
      name: getValue("name"),
      username: getValue("username"),
      email: getValue("email"),
      password: getValue("password"),
      confirmPassword: getValue("confirm-password"),
      role: getValue("role"),
    };

    const validationResults = validateForm(formData);

    if (validationResults.isValid) {
      saveUser({
        user_id: generateUserId(),
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        avatar_url: "default-avatar.png",
        joined_at: new Date(),
        last_active: new Date(),
      });
      alert("Signup successful!");
      window.location.href = "login.html";
    } else {
      validationResults.errors.forEach(({ field, message }) => {
        showError(field, message);
      });
    }
  });

  // Helper functions
  function getValue(id) {
    return document.getElementById(id).value.trim();
  }

  function validateField(input) {
    const fieldId = input.id;
    const value = input.value.trim();
    clearError(fieldId);

    const formData = {
      name: getValue("name"),
      username: getValue("username"),
      email: getValue("email"),
      password: getValue("password"),
      confirmPassword: getValue("confirm-password"),
      role: getValue("role"),
    };

    let error = null;

    switch (fieldId) {
      case "name":
        if (!value) error = { field: "name", message: "Full name is required" };
        break;
      case "username":
        if (!value) {
          error = { field: "username", message: "Username is required" };
        } else if (usernameExists(value)) {
          error = { field: "username", message: "Username already taken" };
        }
        break;
      case "email":
        if (!value) {
          error = { field: "email", message: "Email is required" };
        } else if (!EMAIL_REGEX.test(value)) {
          error = { field: "email", message: "Invalid email format" };
        } else if (emailExists(value)) {
          error = { field: "email", message: "Email already registered" };
        }
        break;
      case "password":
        if (!value) {
          error = { field: "password", message: "Password is required" };
        } else if (!PASSWORD_REGEX.test(value)) {
          error = {
            field: "password",
            message:
              "Password must be 8+ chars with uppercase, lowercase, number & special char",
          };
        }
        break;
      case "confirm-password":
        if (!value) {
          error = {
            field: "confirm-password",
            message: "Please confirm your password",
          };
        } else if (value !== formData.password) {
          error = {
            field: "confirm-password",
            message: "Passwords do not match",
          };
        }
        break;
      case "role":
        if (!value) error = { field: "role", message: "Please select a role" };
        break;
    }

    if (error) showError(error.field, error.message);
  }

  function validateForm(data) {
    const errors = [];
    if (!data.name)
      errors.push({ field: "name", message: "Full name is required" });
    if (!data.username) {
      errors.push({ field: "username", message: "Username is required" });
    } else if (usernameExists(data.username)) {
      errors.push({ field: "username", message: "Username already taken" });
    }
    if (!data.email) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!EMAIL_REGEX.test(data.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    } else if (emailExists(data.email)) {
      errors.push({ field: "email", message: "Email already registered" });
    }
    if (!data.password) {
      errors.push({ field: "password", message: "Password is required" });
    } else if (!PASSWORD_REGEX.test(data.password)) {
      errors.push({
        field: "password",
        message:
          "Password must be 8+ chars with uppercase, lowercase, number & special char",
      });
    }
    if (!data.confirmPassword) {
      errors.push({
        field: "confirm-password",
        message: "Please confirm your password",
      });
    } else if (data.password !== data.confirmPassword) {
      errors.push({
        field: "confirm-password",
        message: "Passwords do not match",
      });
    }
    if (!data.role)
      errors.push({ field: "role", message: "Please select a role" });

    return { isValid: errors.length === 0, errors };
  }

  function usernameExists(username) {
    const users = JSON.parse(localStorage.getItem("users"));
    return users.some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  function emailExists(email) {
    const users = JSON.parse(localStorage.getItem("users"));
    return users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  function saveUser(user) {
    const users = JSON.parse(localStorage.getItem("users"));
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
  }

  function showError(fieldId, message) {
    const inputGroup = document.getElementById(fieldId).parentElement;
    const errorElement = document.createElement("small");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    errorElement.style.color = "#ff4444";
    errorElement.style.marginTop = "8px";
    inputGroup.appendChild(errorElement);
  }

  function clearError(fieldId) {
    const inputGroup = document.getElementById(fieldId).parentElement;
    const errorElement = inputGroup.querySelector(".error-message");
    if (errorElement) errorElement.remove();
  }

  function clearAllErrors() {
    document.querySelectorAll(".error-message").forEach((el) => el.remove());
  }
});
=======
import { tasks, users } from "./tasks_data.js";

if (localStorage.getItem("Tasks") === null) {
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}
if (localStorage.getItem("users") === null) {
  localStorage.setItem("users", JSON.stringify(users));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputs = form.querySelectorAll("input, select");

  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|\\:;"'<>,.?/~`-])[A-Za-z\d!@#$%^&*()_+[\]{}|\\:;"'<>,.?/~`-]{8,}$/;

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }

  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllErrors();

    const formData = {
      name: getValue("name"),
      username: getValue("username"),
      email: getValue("email"),
      password: getValue("password"),
      confirmPassword: getValue("confirm-password"),
      role: getValue("role"),
    };

    const validationResults = validateForm(formData);

    if (validationResults.isValid) {
      saveUser({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      alert("Signup successful!");
      window.location.href = "login.html";
    } else {
      validationResults.errors.forEach(({ field, message }) => {
        showError(field, message);
      });
    }
  });

  function getValue(id) {
    return document.getElementById(id).value.trim();
  }

  function validateField(input) {
    const fieldId = input.id;
    const value = input.value.trim();
    clearError(fieldId);

    const formData = {
      name: getValue("name"),
      username: getValue("username"),
      email: getValue("email"),
      password: getValue("password"),
      confirmPassword: getValue("confirm-password"),
      role: getValue("role"),
    };

    let error = null;

    if (fieldId === "name" && !value) {
      error = { field: "name", message: "Full name is required" };
    } else if (fieldId === "username") {
      if (!value) {
        error = { field: "username", message: "Username is required" };
      } else if (usernameExists(value)) {
        error = { field: "username", message: "Username already taken" };
      }
    } else if (fieldId === "email") {
      if (!value) {
        error = { field: "email", message: "Email is required" };
      } else if (!EMAIL_REGEX.test(value)) {
        error = { field: "email", message: "Invalid email format" };
      }
    } else if (fieldId === "password") {
      if (!value) {
        error = { field: "password", message: "Password is required" };
      } else if (!PASSWORD_REGEX.test(value)) {
        error = {
          field: "password",
          message:
            "Password must be 8+ chars with uppercase, lowercase, number & special char",
        };
      }
    } else if (fieldId === "confirm-password") {
      if (!value) {
        error = {
          field: "confirm-password",
          message: "Please confirm your password",
        };
      } else if (value !== formData.password) {
        error = {
          field: "confirm-password",
          message: "Passwords do not match",
        };
      }
    } else if (fieldId === "role" && !value) {
      error = { field: "role", message: "Please select a role" };
    }

    if (error) {
      console.log("Error for field:", fieldId, "Message:", error.message);
      showError(error.field, error.message);
    } else {
      console.log("No error for field:", fieldId);
      clearError(fieldId);
    }
  }

  function validateForm(data) {
    const errors = [];

    if (!data.name) {
      errors.push({ field: "name", message: "Full name is required" });
    }

    if (!data.username) {
      errors.push({ field: "username", message: "Username is required" });
    } else if (usernameExists(data.username)) {
      errors.push({ field: "username", message: "Username already taken" });
    }

    if (!data.email) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!EMAIL_REGEX.test(data.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    if (!data.password) {
      errors.push({ field: "password", message: "Password is required" });
    } else if (!PASSWORD_REGEX.test(data.password)) {
      errors.push({
        field: "password",
        message:
          "Password must be 8+ chars with uppercase, lowercase, number & special char",
      });
    }

    if (!data.confirmPassword) {
      errors.push({
        field: "confirm-password",
        message: "Please confirm your password",
      });
    } else if (data.password !== data.confirmPassword) {
      errors.push({
        field: "confirm-password",
        message: "Passwords do not match",
      });
    }

    if (!data.role) {
      errors.push({ field: "role", message: "Please select a role" });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  function usernameExists(username) {
    const users = JSON.parse(localStorage.getItem("users"));
    return users.some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  function saveUser(user) {
    const users = JSON.parse(localStorage.getItem("users"));
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
  }

  function showError(fieldId, message) {
    const inputGroup = document.getElementById(fieldId).parentElement;
    const errorElement = document.createElement("small");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    errorElement.style.color = "#ff4444";
    errorElement.style.marginTop = "8px";
    inputGroup.appendChild(errorElement);
  }

  function clearError(fieldId) {
    const inputGroup = document.getElementById(fieldId).parentElement;
    const errorElement = inputGroup.querySelector(".error-message");
    if (errorElement) {
      errorElement.remove();
    }
  }

  function clearAllErrors() {
    document.querySelectorAll(".error-message").forEach((el) => el.remove());
  }
});
>>>>>>> 06622aa2967c88302ec1a25b385e9556656f54e5:Assignment/MainSite/MainSite/static/JSs/signup.js
