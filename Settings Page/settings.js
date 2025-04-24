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

if (!darkThemeBtn || !lightThemeBtn || !newUsernameInput || !saveUsernameBtn ||
    !upcomingTasksCheckbox || !scheduledTasksCheckbox || !logoutBtn ||
    !deleteAccountBtn || !usernameDisplay) {
    console.error('Critical elements missing!');
}

function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-theme');
        lightThemeBtn.classList.add('active');
        darkThemeBtn.classList.remove('active');
    } else {
        body.classList.remove('light-theme');
        darkThemeBtn.classList.add('active');
        lightThemeBtn.classList.remove('active');
    }
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
            window.location.href = 'login.html';
        }, 1500);
    }
});

function initializePage() {
    initializeTheme();
    loadUsername();
    loadNotificationPrefs();
}

document.addEventListener('DOMContentLoaded', initializePage);