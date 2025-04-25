/*let btn = document.getElementById('switch');

//photos
let logout_img = document.getElementById('logout');
// let prev_img = document.getElementById('prev');
let profile_placeholder_img = document.getElementById('profile_placeholder');
let Profile_img = document.getElementById('Profile');
let search_img = document.getElementById('ser');
let settings_img = document.getElementById('settings');

//colors for divs, texts
let task_bg = ['#e3e3e3', '#1c1c1c'];
let primary = ['#fefbf6', '#010409'];
let navy = ['#eae4dc', '#151b23'];
let white_t = ['#black', 'white'];
let gray_t = ['#303030', '#cfcfcf'];
let gray_bg = ['aaa', '#555'];

let home = ['media/logos/light/homepage.png', 'media/logos/dark/homepage.png'];
let log_out = ['media/logos/light/log out.png', 'media/logos/dark/log out.png'];
let notification_panel = ['media/logos/light/notification panel.png', 'media/logos/dark/notification panel.png'];
// let prev = ['media/logos/light/prev.png', 'media/logos/dark/prev.png'];
let profile_placeholder = ['media/logos/light/profile-placeholder.png', 'media/logos/dark/profile-placeholder.png'];
let profile = ['media/logos/light/profile.png', 'media/logos/dark/profile.png'];
let search = ['media/logos/light/search.png', 'media/logos/dark/search.png'];
let settings = ['media/logos/light/settings.png', 'media/logos/dark/settings.png'];

//function to apply the theme for all pages
function applyTheme(isLight) {
    const root = document.documentElement;
    document.body.classList.toggle('light-mode', isLight);
    let i = isLight ? 0 : 1;

    //set colors
    root.style.setProperty('--task-background', task_bg[i]);
    root.style.setProperty('--primary-black', primary[i]);
    root.style.setProperty('--dark-gray', navy[i]);
    root.style.setProperty('--white-text', white_t[i]);
    root.style.setProperty('--gray-texts', gray_t[i]);
    root.style.setProperty('--gray_backgrounds', gray_bg[i]);

    //set sources for images
    home_img.src = home[i];
    logout_img.src = log_out[i];
    notification_img.src = notification_panel[i];
    //prev_img.src = prev[i];
    profile_placeholder_img.src = profile_placeholder[i];
    Profile_img.src = profile[i];
    search_img.src = search[i];
    settings_img.src = settings[i];
}

document.addEventListener('DOMContentLoaded', function () {
    const savedTheme = localStorage.getItem('theme');
    const isLight = savedTheme === 'light';
    applyTheme(isLight);
});

// DARK AND LIGHT MODE
btn.onclick = function () {
    const isLight = !document.body.classList.contains('light-mode');
    // Save theme preference to localStorage
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    applyTheme(isLight);
};

// LOG OUT
logout_img.onclick = function () {
    const confirm = window.confirm('Are you sure you want to log-out?');//return bool
    if (confirm)
        window.location.href = 'signup.html';
};*/

// DISPLAY THE NOTIFICATION PANEL
let notification_img = document.getElementById('notification');

notification_img.onclick = function () {

    document.body.classList.toggle('panel_on');
    if (document.body.classList.contains('panel_on')) {
        let container = document.createElement('div');
        container.className = 'notification_panel';

        let notifications = document.createElement('p');
        let header = document.getElementById('navbar');

        notifications.textContent = 'No notifications yet';
        container.appendChild(notifications);

        header.parentNode.insertBefore(container, header.nextSibling);

        container.style.cssText = `
        background-color: var(--primary-black);
        margin: 10px;
        padding: 10px;
        width: 300px;
        border-radius: 15px;
        position: fixed;
        text-align: center;
        z-index: 1000;
        `;
    }

    else {
        const panel = document.querySelector('.notification_panel');
        panel.remove();
    }
};

//temp user object
let user = { role: 'admin' };

let home_img = document.getElementById('home');
home_img.onclick = function () {
    if (user.role == 'admin')
        window.location.href = 'AdminDashboard.html';
    else
        window.location.href = 'teachers_task_list.html';
};

Profile_img.onclick = function (e) {
    e.preventDefault();
    window.location.href = 'profile_page.html';
};

settings_img.onclick = function () { window.location.href = 'settings.html'; };