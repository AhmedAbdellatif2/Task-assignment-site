const darkThemeBtn = document.getElementById('dark-theme');
const lightThemeBtn = document.getElementById('light-theme');
const newUsernameInput = document.getElementById('new-username');
const saveUsernameBtn = document.getElementById('save-username');
const upcomingTasksCheckbox = document.getElementById('upcoming-tasks');
const scheduledTasksCheckbox = document.getElementById('scheduled-tasks');
const logoutBtn = document.getElementById('logout-btn');
const deleteAccountBtn = document.getElementById('delete-account');
const body = document.body;
const usernameDisplay = document.getElementById('username-display');

//logos
let home_img = document.getElementById('home');
let logout_img = document.getElementById('logout');
let notification_img = document.getElementById('notification');
let profile_placeholder_img = document.getElementById('profile_placeholder');
let Profile_img = document.getElementById('Profile');
let search_img = document.getElementById('ser');
let settings_img = document.getElementById('settings');

//paths of logos
let home = ['media/logos/light/homepage.png', 'media/logos/dark/homepage.png'];
let log_out = ['media/logos/light/log out.png', 'media/logos/dark/log out.png'];
let notification_panel = ['media/logos/light/notification panel.png', 'media/logos/dark/notification panel.png'];
let profile_placeholder = ['media/logos/light/profile-placeholder.png', 'media/logos/dark/profile-placeholder.png'];
let profile = ['media/logos/light/profile.png', 'media/logos/dark/profile.png'];
let search = ['media/logos/light/search.png', 'media/logos/dark/search.png'];
let settings = ['media/logos/light/settings.png', 'media/logos/dark/settings.png'];


if (!darkThemeBtn || !lightThemeBtn || !newUsernameInput || !saveUsernameBtn ||
    !upcomingTasksCheckbox || !scheduledTasksCheckbox || !logoutBtn ||
    !deleteAccountBtn || !usernameDisplay) {
    console.error('Critical elements missing!');
}

function applyTheme(theme) {
    let i = !(theme === 'light')
    if (theme === 'light') {
        body.classList.add('light-theme');
        lightThemeBtn.classList.add('active');
        darkThemeBtn.classList.remove('active');


    } else {
        body.classList.remove('light-theme');
        darkThemeBtn.classList.add('active');
        lightThemeBtn.classList.remove('active');
    }

    //setting sources of logos
    home_img.src = home[i];
    logout_img.src = log_out[i];
    notification_img.src = notification_panel[i];
    profile_placeholder_img.src = profile_placeholder[i];
    Profile_img.src = profile[i];
    search_img.src = search[i];
    settings_img.src = settings[i];
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
}

darkThemeBtn.addEventListener('click', () => {
    localStorage.setItem('theme', 'dark');
    applyTheme('dark');
});

lightThemeBtn.addEventListener('click', () => {
    localStorage.setItem('theme', 'light');
    applyTheme('light');
});

function loadUsername() {
    const savedUsername = localStorage.getItem('username') || 'User';
    newUsernameInput.value = savedUsername;
    usernameDisplay.textContent = savedUsername;
}

saveUsernameBtn.addEventListener('click', () => {
    const newUsername = newUsernameInput.value.trim();
    if (newUsername && newUsername.length >= 3) {
        localStorage.setItem('username', newUsername);
        usernameDisplay.textContent = newUsername;
        alert('Username updated successfully!');
    } else {
        alert('Username must be at least 3 characters long');
    }
});

function loadNotificationPrefs() {
    const prefs = JSON.parse(localStorage.getItem('notificationPrefs') || '{}');
    upcomingTasksCheckbox.checked = prefs.upcoming !== false;
    scheduledTasksCheckbox.checked = prefs.scheduled !== false;
}

function saveNotificationPrefs() {
    const prefs = {
        upcoming: upcomingTasksCheckbox.checked,
        scheduled: scheduledTasksCheckbox.checked
    };
    localStorage.setItem('notificationPrefs', JSON.stringify(prefs));
}

upcomingTasksCheckbox.addEventListener('change', saveNotificationPrefs);
scheduledTasksCheckbox.addEventListener('change', saveNotificationPrefs);

logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
});

deleteAccountBtn.addEventListener('click', () => {
    if (confirm('WARNING: This will permanently delete your account and all data. Continue?')) {
        localStorage.clear();
        alert('Account deleted. Redirecting...');
        setTimeout(() => {
            window.location.href = 'signup.html';
        }, 1500);
    }
});

function initializePage() {
    initializeTheme();
    loadUsername();
    loadNotificationPrefs();
}

document.addEventListener('DOMContentLoaded', initializePage);