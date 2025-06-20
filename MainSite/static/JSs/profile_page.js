import apiService from "./ApiService.js";

class ProfileManager {
  constructor() {
    this.init();
  }
  async init() {
    try {
      const currentUser = await apiService.getCurrentUser();
      if (currentUser && currentUser.role !== "admin") {
        this.updateUI(currentUser);
      } else if (!currentUser) {
        throw new Error("No user data returned");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      window.location.href = "/login";
    }
  }
  updateUI(user) {
    if (!user) {
      console.error("No user provided to updateUI");
      return;
    }
    document.getElementById("username").textContent = user.username;
    document.getElementById("user-role").textContent = `Role: ${user.role}`;
    document.getElementById("user-email").textContent = `Email: ${user.email}`;
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ProfileManager();
});
