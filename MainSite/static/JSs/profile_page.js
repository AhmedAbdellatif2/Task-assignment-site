import apiService from './ApiService.js';

class ProfileManager {
    constructor() {
        this.init();
    }

    async init() {
        try {
            const user = await apiService.getCurrentUser();
            if (!user) {
                window.location.href = "login.html";
                return;
            }

            this.updateUI(user);
        } catch (error) {
            console.error('Failed to load profile:', error);
            window.location.href = "login.html";
        }
    }

    updateUI(user) {
        document.getElementById("username").textContent = user.username;
        document.getElementById("user-role").textContent = `Role: ${user.role}`;
        document.getElementById("user-email").textContent = `Email: ${user.email}`;
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
