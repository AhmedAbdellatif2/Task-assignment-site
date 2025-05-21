import { applyTheme, initializeTheme } from "./theme.js";
import apiService from "./ApiService.js";

const darkThemeBtn = document.getElementById("dark-theme");
const lightThemeBtn = document.getElementById("light-theme");
const newUsernameInput = document.getElementById("new-username");
const saveUsernameBtn = document.getElementById("save-username");
const upcomingTasksCheckbox = document.getElementById("upcoming-tasks");
const scheduledTasksCheckbox = document.getElementById("scheduled-tasks");
const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account");
const body = document.body;
const usernameDisplay = document.getElementById("username-display");

//photos
const home_img = document.getElementById("home");
const logout_img = document.getElementById("logout");
const profile_placeholder_img = document.getElementById("profile_placeholder");
const Profile_img = document.getElementById("Profile");
const search_img = document.getElementById("ser");
const settings_img = document.getElementById("settings");
const notification_img = document.getElementById("notification");

//colors for divs, texts
const task_bg = ["#e3e3e3", "#1c1c1c"];
const primary = ["#fefbf6", "#010409"];
const navy = ["#eae4dc", "#151b23"];
const white_t = ["#black", "white"];
const gray_t = ["#303030", "#cfcfcf"];
const gray_bg = ["aaa", "#555"];

const home = [
  "media/logos/light/homepage.png",
  "media/logos/dark/homepage.png",
];
const log_out = ["media/logos/light/logout.png", "media/logos/dark/logout.png"];
const notification_panel = [
  "media/logos/light/notification-panel.png",
  "media/logos/dark/notification-panel.png",
];
const profile_placeholder = [
  "media/logos/light/profile-placeholder.png",
  "media/logos/dark/profile-placeholder.png",
];
const profile = [
  "media/logos/light/profile.png",
  "media/logos/dark/profile.png",
];
const search = ["media/logos/light/search.png", "media/logos/dark/search.png"];
const settings = [
  "media/logos/light/settings.png",
  "media/logos/dark/settings.png",
];

// theme elements mapping
const themeElements = {
  home: home_img,
  logout: logout_img,
  notification: notification_img,
  profile_placeholder: profile_placeholder_img,
  Profile: Profile_img,
  search: search_img,
  settings: settings_img,
};

const themeImages = {
  home: home,
  logout: log_out,
  notification: notification_panel,
  profile_placeholder: profile_placeholder,
  Profile: profile,
  search: search,
  settings: settings,
};

// update all images based on user preferences
async function updateImages() {
  try {
    const userPreferences = await apiService.getUserPreferences();
    const isDarkTheme = userPreferences.theme !== "light";
    Object.keys(themeElements).forEach((key) => {
      if (themeElements[key] && themeImages[key]) {
        themeElements[key].src = themeImages[key][isDarkTheme ? 1 : 0];
      }
    });
  } catch (error) {
    console.error("Failed to update theme images:", error);
  }
}

// Only check for critical elements on the settings page
if (window.location.pathname.includes("settings.html")) {
  if (!usernameDisplay) console.error("usernameDisplay is null!");
  if (
    !darkThemeBtn ||
    !lightThemeBtn ||
    !newUsernameInput ||
    !saveUsernameBtn ||
    !upcomingTasksCheckbox ||
    !scheduledTasksCheckbox ||
    !logoutBtn ||
    !deleteAccountBtn ||
    !usernameDisplay
  ) {
    console.error("Critical elements missing!");
  }
}

async function loadUsername() {
  if (usernameDisplay && newUsernameInput) {
    try {
      const user = await apiService.getCurrentUser();
      const username = user?.username || "User";
      newUsernameInput.value = username;
      usernameDisplay.textContent = username;
    } catch (error) {
      console.error("Failed to load username:", error);
    }
  }
}

async function loadNotificationPrefs() {
  try {
    const preferences = await apiService.getUserPreferences();
    if (upcomingTasksCheckbox) {
      upcomingTasksCheckbox.checked = preferences.upcomingTasks;
    }
    if (scheduledTasksCheckbox) {
      scheduledTasksCheckbox.checked = preferences.scheduledTasks;
    }
  } catch (error) {
    console.error("Failed to load notification preferences:", error);
  }
}

async function saveNotificationPrefs() {
  try {
    const preferences = {
      upcomingTasks: upcomingTasksCheckbox?.checked || false,
      scheduledTasks: scheduledTasksCheckbox?.checked || false,
    };
    await apiService.updateUserPreferences(preferences);
  } catch (error) {
    console.error("Failed to save notification preferences:", error);
    alert("Failed to save preferences. Please try again.");
  }
}

async function updateThemeButtons(theme) {
  if (lightThemeBtn && darkThemeBtn) {
    if (theme === "light") {
      lightThemeBtn.classList.add("active");
      darkThemeBtn.classList.remove("active");
    } else {
      darkThemeBtn.classList.add("active");
      lightThemeBtn.classList.remove("active");
    }
  }
}

async function initializePage() {
  try {
    const preferences = await apiService.getUserPreferences();
    const currentTheme = preferences.theme || "dark";
    await initializeTheme();
    await updateThemeButtons(currentTheme);
    await loadUsername();
    await loadNotificationPrefs();
  } catch (error) {
    console.error("Failed to initialize page:", error);
  }
}

// Event Listeners
if (darkThemeBtn) {
  darkThemeBtn.addEventListener("click", async () => {
    try {
      await apiService.updateUserPreferences({ theme: "dark" });
      await applyTheme("dark");
      await updateThemeButtons("dark");
    } catch (error) {
      console.error("Failed to update theme:", error);
      alert("Failed to update theme. Please try again.");
    }
  });
}

if (lightThemeBtn) {
  lightThemeBtn.addEventListener("click", async () => {
    try {
      await apiService.updateUserPreferences({ theme: "light" });
      await applyTheme("light");
      await updateThemeButtons("light");
    } catch (error) {
      console.error("Failed to update theme:", error);
      alert("Failed to update theme. Please try again.");
    }
  });
}

if (saveUsernameBtn) {
  saveUsernameBtn.addEventListener("click", async () => {
    const newUsername = newUsernameInput.value.trim();
    if (newUsername) {
      try {
        await apiService.updateUsername(newUsername);
        usernameDisplay.textContent = newUsername;
        newUsernameInput.value = "";
      } catch (error) {
        console.error("Failed to update username:", error);
        alert("Failed to update username. Please try again.");
      }
    }
  });
}

if (upcomingTasksCheckbox) {
  upcomingTasksCheckbox.addEventListener("change", saveNotificationPrefs);
}

if (scheduledTasksCheckbox) {
  scheduledTasksCheckbox.addEventListener("change", saveNotificationPrefs);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await apiService.logout();
      window.location.href = "login";
    } catch (error) {
      console.error("Failed to logout:", error);
      alert("Failed to logout. Please try again.");
    }
  });
}

if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await apiService.deleteAccount();
        window.location.href = "login";
      } catch (error) {
        console.error("Failed to delete account:", error);
        alert("Failed to delete account. Please try again.");
      }
    }
  });
}

// Initialize the page
document.addEventListener("DOMContentLoaded", initializePage);
