import apiService from './ApiService.js';

class LoginManager {
	constructor() {
		this.init();
	}

	async init() {
		try {
			const currentUser = await apiService.getCurrentUser();
			if (currentUser?.role === "admin") {
				window.location.href = "AdminDashboard.html";
				return;
			} else if (currentUser?.role === "teacher") {
				window.location.href = "teachers_task_list.html";
				return;
			}

			this.setupForm();
		} catch (error) {
			// User is not logged in, continue with login form
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

		passwordToggle.addEventListener("click", () => this.togglePasswordVisibility());
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
			loginButton.innerHTML = '<div class="button-spinner"></div> Authenticating';

			await apiService.login(username, password);
			const user = await apiService.getCurrentUser();

			if (user.role === "admin") {
				window.location.href = "AdminDashboard.html";
			} else {
				window.location.href = "teachers_task_list.html";
			}
		} catch (error) {
			console.error('Login error:', error);
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
		passwordInput.type = passwordInput.type === "password" ? "text" : "password";
	}

	showToast(message, type) {
		const toast = document.createElement("div");
		toast.className = `toast ${type}`;
		toast.textContent = message;
		document.body.appendChild(toast);
		setTimeout(() => toast.remove(), 5000);
	}
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	new LoginManager();
});
