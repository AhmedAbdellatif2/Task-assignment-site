// Theme-related constants
const task_bg = ["#e3e3e3", "#1c1c1c"];
const primary = ["#fefbf6", "#010409"];
const navy = ["#eae4dc", "#151b23"];
const white_t = ["#black", "white"];
const gray_t = ["#303030", "#cfcfcf"];
const gray_bg = ["aaa", "#555"];

// Theme image paths - ensure these match exactly with the file names in the directories
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

// Theme elements mapping - ensure these IDs match exactly with the HTML
const themeElements = {
    home: document.getElementById("home"),
    logout: document.getElementById("logout"),
    notification: document.getElementById("notification"),
    profile_placeholder: document.getElementById("profile_placeholder"),
    Profile: document.getElementById("Profile"),
    search: document.getElementById("search"),
    settings: document.getElementById("settings"),
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

function updateThemeImages(isDark) {
    // Update all images
    Object.keys(themeElements).forEach((key) => {
        const element = themeElements[key];
        const imagePath = themeImages[key];
        if (element && imagePath) {
            const newSrc = imagePath[isDark ? 1 : 0];
            // Only update if the source is different
            if (element.src !== newSrc) {
                element.src = newSrc;
                console.log(`Updated ${key} image to: ${newSrc}`); // Debug log
            }
        } else {
            console.warn(`Missing element or image path for: ${key}`); // Debug log
        }
    });
}

export function applyTheme(theme) {
    const isDark = theme !== "light";
    const body = document.body;

    // Update body class
    if (theme === "light") {
        body.classList.add("light-theme");
    } else {
        body.classList.remove("light-theme");
    }

    const root = document.documentElement;

    // Set colors
    root.style.setProperty("--task-background", task_bg[isDark ? 1 : 0]);
    root.style.setProperty("--primary-black", primary[isDark ? 1 : 0]);
    root.style.setProperty("--dark-gray", navy[isDark ? 1 : 0]);
    root.style.setProperty("--white-text", white_t[isDark ? 1 : 0]);
    root.style.setProperty("--gray-texts", gray_t[isDark ? 1 : 0]);
    root.style.setProperty("--gray_backgrounds", gray_bg[isDark ? 1 : 0]);

    // Update theme images
    updateThemeImages(isDark);

    // Update theme-dependent elements
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

export function initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    applyTheme(savedTheme);
} 