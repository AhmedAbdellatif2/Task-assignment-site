export function applyTheme(theme) {
  // Theme-related constants
  const task_bg = ["#e3e3e3", "#1c1c1c"];
  const primary = ["#fefbf6", "#010409"];
  const navy = ["#eae4dc", "#151b23"];
  const white_t = ["#000000", "#ffffff"]; // Fixed
  const gray_t = ["#303030", "#cfcfcf"];
  const gray_bg = ["#aaaaaa", "#555555"]; // Fixed

  // Theme image paths
  const home = [
    "media/logos/light/homepage.png",
    "media/logos/dark/homepage.png",
  ];
  const logout = [
    "media/logos/light/logout.png",
    "media/logos/dark/logout.png",
  ];
  const notification = [
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
  const dropdown_profile = [
    "media/logos/light/profile.png",
    "media/logos/dark/profile.png",
  ];
  const search = [
    "media/logos/light/search.png",
    "media/logos/dark/search.png",
  ];
  const settings = [
    "media/logos/light/settings.png",
    "media/logos/dark/settings.png",
  ];

  // Match keys exactly between elements and images
  const themeElements = {
    home: document.getElementById("home"),
    logout: document.getElementById("logout"),
    notification: document.getElementById("notification"),
    profile_placeholder: document.getElementById("profile_placeholder"),
    profile: document.getElementById("Profile"), // was "Profile"
    dropdown_profile: document.getElementById("dropdown_profile"),
    search: document.getElementById("ser"),
    settings: document.getElementById("settings"),
  };

  const themeImages = {
    home,
    logout,
    notification,
    profile_placeholder,
    profile,
    dropdown_profile,
    search,
    settings,
  };

  function updateThemeImages(isDark) {
    Object.keys(themeElements).forEach((key) => {
      const element = themeElements[key];
      const imagePath = themeImages[key];
      console.log(key, element);
      if (element && imagePath) {
        const newSrc = imagePath[isDark ? 1 : 0];
        if (element.src !== newSrc) {
          element.src = newSrc;
          console.log(`Updated ${key} image to: ${newSrc}`);
        }
      } else {
        console.warn(`Missing element or image path for: ${key}`);
      }
    });
  }

  const isDark = theme !== "light";
  const body = document.body;

  // Update body class
  if (theme === "light") {
    body.classList.add("light-theme");
  } else {
    body.classList.remove("light-theme");
  }

  const root = document.documentElement;

  root.style.setProperty("--task-background", task_bg[isDark ? 1 : 0]);
  root.style.setProperty("--primary-black", primary[isDark ? 1 : 0]);
  root.style.setProperty("--dark-gray", navy[isDark ? 1 : 0]);
  root.style.setProperty("--white-text", white_t[isDark ? 1 : 0]);
  root.style.setProperty("--gray-texts", gray_t[isDark ? 1 : 0]);
  root.style.setProperty("--gray_backgrounds", gray_bg[isDark ? 1 : 0]);

  // Update images
  updateThemeImages(isDark);

  // Update theme-dependent elements
  document.querySelectorAll("[data-theme]").forEach((element) => {
    element.style.setProperty("--theme-color", isDark ? "#010409" : "#fefbf6");
  });

  // Save preference
  localStorage.setItem("theme", theme);
}

export function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
}
