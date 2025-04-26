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
const log_out = [
  "media/logos/light/log out.png",
  "media/logos/dark/log out.png",
];
const notification_panel = [
  "media/logos/light/notification panel.png",
  "media/logos/dark/notification panel.png",
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
Object.keys(themeElements).forEach((key) => {
  if (themeElements[key] && themeImages[key]) {
    themeElements[key].src = themeImages[key][i];
  }
});

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

function applyTheme(theme) {
  let i = !(theme === "light");
  if (theme === "light") {
    body.classList.add("light-theme");
    lightThemeBtn.classList.add("active");
    darkThemeBtn.classList.remove("active");
  } else {
    body.classList.remove("light-theme");
    darkThemeBtn.classList.add("active");
    lightThemeBtn.classList.remove("active");
  }
  const root = document.documentElement;

  //set colors
  root.style.setProperty("--task-background", task_bg[i]);
  root.style.setProperty("--primary-black", primary[i]);
  root.style.setProperty("--dark-gray", navy[i]);
  root.style.setProperty("--white-text", white_t[i]);
  root.style.setProperty("--gray-texts", gray_t[i]);
  root.style.setProperty("--gray_backgrounds", gray_bg[i]);

  // update all images after light / dark mode
  Object.keys(themeElements).forEach((key) => {
    if (themeElements[key] && themeImages[key]) {
      themeElements[key].src = themeImages[key][i];
    }
  });

  // update any other theme-dependent elements
  document.querySelectorAll("[data-theme]").forEach((element) => {
    const themeAttr = element.getAttribute("data-theme");
    if (themeAttr) {
      element.style.setProperty(
        "--theme-color",
        theme === "light" ? "#fefbf6" : "#010409"
      );
    }
  });
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
}

darkThemeBtn.addEventListener("click", () => {
  localStorage.setItem("theme", "dark");
  applyTheme("dark");
});

lightThemeBtn.addEventListener("click", () => {
  localStorage.setItem("theme", "light");
  applyTheme("light");
});

function loadUsername() {
  const savedUsername = localStorage.getItem("username") || "User";
  newUsernameInput.value = savedUsername;
  usernameDisplay.textContent = savedUsername;
}

saveUsernameBtn.addEventListener("click", () => {
  const newUsername = newUsernameInput.value.trim();
  if (newUsername && newUsername.length >= 3) {
    localStorage.setItem("username", newUsername);
    usernameDisplay.textContent = newUsername;
    alert("Username updated successfully!");
  } else {
    alert("Username must be at least 3 characters long");
  }
});

function loadNotificationPrefs() {
  const prefs = JSON.parse(localStorage.getItem("notificationPrefs") || "{}");
  upcomingTasksCheckbox.checked = prefs.upcoming !== false;
  scheduledTasksCheckbox.checked = prefs.scheduled !== false;
}

function saveNotificationPrefs() {
  const prefs = {
    upcoming: upcomingTasksCheckbox.checked,
    scheduled: scheduledTasksCheckbox.checked,
  };
  localStorage.setItem("notificationPrefs", JSON.stringify(prefs));
}

upcomingTasksCheckbox.addEventListener("change", saveNotificationPrefs);
scheduledTasksCheckbox.addEventListener("change", saveNotificationPrefs);

logoutBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
});

deleteAccountBtn.addEventListener("click", () => {
  if (
    confirm(
      "WARNING: This will permanently delete your account and all data. Continue?"
    )
  ) {
    localStorage.clear();
    alert("Account deleted. Redirecting...");
    setTimeout(() => {
      window.location.href = "signup.html";
    }, 1500);
  }
});

function initializePage() {
  initializeTheme();
  loadUsername();
  loadNotificationPrefs();
}

document.addEventListener("DOMContentLoaded", initializePage);
