import apiService from "./ApiService.js";

class ProfileManager {
  constructor() {
    this.init();
  }

  async init() {
    try {
      apiService
        .getCurrentUser()
        .then((currentUser) => {
          if (currentUser.role === "admin") {
            return;
          }
          return currentUser;
        })
        .catch((error) => {
          console.error("Error fetching current user:", error);
          window.location.href = "/login";
        });

      this.updateUI(user);
    } catch (error) {
      console.error("Failed to load profile:", error);
      window.location.href = "login";
    }
  }

  updateUI(user) {
    document.getElementById("username").textContent = user.username;
    document.getElementById("user-role").textContent = `Role: ${user.role}`;
    document.getElementById("user-email").textContent = `Email: ${user.email}`;
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ProfileManager();
});
