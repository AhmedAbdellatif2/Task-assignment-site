import { applyTheme, initializeTheme } from "./theme.js";

fetch("navbar.html")
  .then((response) => {
    if (response.ok) {
      return response.text();
    } else {
      throw new Error("Failed to load navbar.html");
    }
  })
  .then((html) => {
    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) {
      console.error("Navbar container not found");
      return;
    }

    navbarContainer.innerHTML = html;

    // Wait for the navbar HTML to be inserted before getting elements
    setTimeout(() => {
      const body = document.body;
      const profile_div = document.getElementsByClassName("profile")[0];
      const notification_img_ = document.getElementById("notification");
      const home_img_ = document.getElementById("home");

      if (profile_div) {
        profile_div.addEventListener("click", () => {
          if (profile_div.classList.contains("active")) {
            profile_div.classList.remove("active");
          } else {
            profile_div.classList.add("active");
          }
        });
      }

      if (notification_img_) {
        notification_img_.onclick = function () {
          document.body.classList.toggle("panel_on");
          if (document.body.classList.contains("panel_on")) {
            let container = document.createElement("div");
            container.className = "notification_panel";

            let notifications = document.createElement("p");
            let header = document.getElementById("navbar");

            notifications.textContent = "No notifications yet";
            container.appendChild(notifications);

            if (header) {
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
          } else {
            const panel = document.querySelector(".notification_panel");
            if (panel) {
              panel.remove();
            }
          }
        };
      }

      //temp user object
      let user = { role: "user" };

      if (home_img_) {
        home_img_.onclick = function () {
          if (user.role === "admin") {
            window.location.href = "AdminDashboard.html";
          } else {
            window.location.href = "teachers_task_list.html";
          }
        };
      }

      // Initialize theme
      initializeTheme();
    }, 0);
  })
  .catch((error) => {
    console.error("Error loading navbar:", error);
  });
