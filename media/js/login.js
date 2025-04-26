document.addEventListener("DOMContentLoaded", () => {
  const currentUser = sessionStorage.getItem("currentUser");
  if (currentUser) {
    window.location.href = "teacher_task.html";
    return;
  }

  const loginForm = document.querySelector(".login-form");
  const passwordInput = document.getElementById("password");

  const passwordToggle = document.createElement("span");
  passwordToggle.className = "password-toggle";
  passwordToggle.innerHTML = "👁";
  passwordInput.parentNode.appendChild(passwordToggle);

  passwordToggle.addEventListener("click", togglePasswordVisibility);
  loginForm.addEventListener("submit", handleLoginSubmission);
  document
    .querySelector(".switch-page a")
    .addEventListener("click", handleSignupRedirect);
});

const handleLoginSubmission = async (e) => {
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
    loginButton.innerHTML = '<div class="button-spinner"></div> Authenticating';

    const user = await authenticateUser(username, password);

    sessionStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "teachers_task_list.html";
  } catch (error) {
    showToast("Authentication failed. Please check your credentials", "error");
  } finally {
    loginButton.disabled = false;
    loginButton.innerHTML = "Log In";
  }
};

const authenticateUser = (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const existingUser = users.find((user) => user.username === username);

      if (!existingUser || existingUser.password !== password) {
        reject(new Error("Invalid credentials"));
        return;
      }

      resolve({
        username: existingUser.username,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
      });
    }, 1200);
  });
};

const togglePasswordVisibility = () => {
  const passwordInput = document.getElementById("password");
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
};

const showToast = (message, type) => {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
};

const handleSignupRedirect = (e) => {
  e.preventDefault();
  window.location.href = "signup.html";
};
