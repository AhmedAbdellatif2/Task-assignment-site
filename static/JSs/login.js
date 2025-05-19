import ApiService from './ApiService.js';

document.addEventListener("DOMContentLoaded", async () => {
	try {
		const currentUser = await ApiService.getCurrentUser();
		if (currentUser?.role === "admin") {
			window.location.href = "AdminDashboard.html";
			return;
		} else if (currentUser?.role === "teacher") {
			window.location.href = "teachers_task_list.html";
			return;
		}
	} catch (error) {
		console.log("User not logged in");
	}

	const loginForm = document.querySelector(".login-form");
	const passwordInput = document.getElementById("password");
	const usernameInput = document.getElementById("username");

	// Add input validation listeners
	usernameInput.addEventListener('blur', validateUsername);
	passwordInput.addEventListener('blur', validatePassword);

	const passwordToggle = document.createElement("span");
	passwordToggle.className = "password-toggle";
	passwordToggle.innerHTML = "👁";
	passwordInput.parentNode.appendChild(passwordToggle);

	passwordToggle.addEventListener("click", togglePasswordVisibility);
	loginForm.addEventListener("submit", handleLoginSubmission);
});

const validateUsername = (e) => {
	const username = e.target.value.trim();
	if (!username) {
		showFieldError(e.target, 'Username is required');
		return false;
	}
	clearFieldError(e.target);
	return true;
};

const validatePassword = (e) => {
	const password = e.target.value.trim();
	if (!password) {
		showFieldError(e.target, 'Password is required');
		return false;
	}
	clearFieldError(e.target);
	return true;
};

const showFieldError = (field, message) => {
	clearFieldError(field);
	const errorDiv = document.createElement('div');
	errorDiv.className = 'field-error';
	errorDiv.textContent = message;
	errorDiv.style.color = '#f44336';
	errorDiv.style.fontSize = '0.8rem';
	errorDiv.style.marginTop = '4px';
	field.parentNode.appendChild(errorDiv);
	field.style.borderColor = '#f44336';
};

const clearFieldError = (field) => {
	const existingError = field.parentNode.querySelector('.field-error');
	if (existingError) {
		existingError.remove();
		field.style.borderColor = '';
	}
};

const handleLoginSubmission = async (e) => {
	e.preventDefault();
	const form = e.target;
	const username = form.username.value.trim();
	const password = form.password.value.trim();
	const loginButton = form.querySelector('button[type="submit"]');

	// Clear any existing errors
	clearFieldError(form.username);
	clearFieldError(form.password);

	try {
		// Validate inputs
		if (!username) {
			showFieldError(form.username, 'Username is required');
			return;
		}
		if (!password) {
			showFieldError(form.password, 'Password is required');
			return;
		}

		// Show loading state
		loginButton.disabled = true;
		loginButton.innerHTML = '<div class="button-spinner"></div> Authenticating';

		const response = await ApiService.login({ username, password });

		// ApiService now handles token storage, just redirect based on role
		if (response.user.role === "admin") {
			window.location.href = "AdminDashboard.html";
		} else {
			window.location.href = "teachers_task_list.html";
		}
	} catch (error) {
		if (error instanceof ApiError) {
			if (error.status === 401) {
				showToast("Invalid username or password", "error");
			} else if (error.status === 429) {
				showToast("Too many login attempts. Please try again later.", "error");
			} else {
				showToast(error.message || "Authentication failed", "error");
			}
		} else {
			showToast("Connection error. Please check your internet connection.", "error");
		}
	} finally {
		loginButton.disabled = false;
		loginButton.innerHTML = "Log In";
	}
};

const togglePasswordVisibility = () => {
	const passwordInput = document.getElementById("password");
	const newType = passwordInput.type === "password" ? "text" : "password";
	passwordInput.type = newType;
};

const showToast = (message, type) => {
	const toast = document.createElement("div");
	toast.className = `toast ${type}`;
	toast.textContent = message;
	toast.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		padding: 12px 24px;
		border-radius: 4px;
		color: white;
		background-color: ${type === 'error' ? '#f44336' : '#4caf50'};
		z-index: 1000;
		box-shadow: 0 2px 5px rgba(0,0,0,0.2);
	`;
	document.body.appendChild(toast);
	setTimeout(() => {
		toast.style.opacity = '0';
		toast.style.transition = 'opacity 0.3s ease';
		setTimeout(() => toast.remove(), 300);
	}, 5000);
};
