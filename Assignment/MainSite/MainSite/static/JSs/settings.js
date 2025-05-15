import { applyTheme, initializeTheme } from "./theme.js";

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

// update all images
let j = !(localStorage.getItem("theme") === "light");
Object.keys(themeElements).forEach((key) => {
  if (themeElements[key] && themeImages[key]) {
    themeElements[key].src = themeImages[key][j];
  }
});

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

function loadUsername() {
  if (usernameDisplay && newUsernameInput) {
    const savedUsername =
      JSON.parse(sessionStorage.getItem("currentUser")).username || "User";
    newUsernameInput.value = savedUsername;
    usernameDisplay.textContent = savedUsername;
  }
}

function loadNotificationPrefs() {
  const upcomingTasks = localStorage.getItem("upcomingTasks") === "true";
  const scheduledTasks = localStorage.getItem("scheduledTasks") === "true";

  if (upcomingTasksCheckbox) {
    upcomingTasksCheckbox.checked = upcomingTasks;
  }
  if (scheduledTasksCheckbox) {
    scheduledTasksCheckbox.checked = scheduledTasks;
  }
}

function saveNotificationPrefs() {
  if (upcomingTasksCheckbox) {
    localStorage.setItem("upcomingTasks", upcomingTasksCheckbox.checked);
  }
  if (scheduledTasksCheckbox) {
    localStorage.setItem("scheduledTasks", scheduledTasksCheckbox.checked);
  }
}

function updateThemeButtons(theme) {
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

function initializePage() {
  const currentTheme = localStorage.getItem("theme") || "dark";
  initializeTheme();
  updateThemeButtons(currentTheme);
  loadUsername();
  loadNotificationPrefs();
}

// Event Listeners
if (darkThemeBtn) {
  darkThemeBtn.addEventListener("click", () => {
    localStorage.setItem("theme", "dark");
    applyTheme("dark");
    updateThemeButtons("dark");
  });
}

if (lightThemeBtn) {
  lightThemeBtn.addEventListener("click", () => {
    localStorage.setItem("theme", "light");
    applyTheme("light");
    updateThemeButtons("light");
  });
}

if (saveUsernameBtn) {
  saveUsernameBtn.addEventListener("click", () => {
    const newUsername = newUsernameInput.value.trim();
    if (newUsername) {
      sessionStorage.setItem("currentUser", newUsername);
      usernameDisplay.textContent = newUsername;
      newUsernameInput.value = "";
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
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });
}

if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      sessionStorage.removeItem("currentUser");
      window.location.href = "login.html";
    }
  });
}

document.addEventListener("DOMContentLoaded", initializePage);
