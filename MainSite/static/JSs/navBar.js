import { applyTheme, initializeTheme } from "./theme.js";

fetch("/navbar/")
  .then((response) => {
    if (response.ok) {
      return response.text();
    } else {
      throw new Error("Failed to load navbar");
    }
  })
  .then((html) => {
    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) {
      console.error("Navbar container not found");
      return;
    }

    navbarContainer.innerHTML = html;

    // Use event delegation for searchbar
    navbarContainer.addEventListener("keydown", function (event) {
      const searchbar = navbarContainer.querySelector("#search");
      if (searchbar && event.target === searchbar && event.key === "Enter") {
        const query = searchbar.value.trim();
        if (query) {
          window.location.href = `/search/?query=${encodeURIComponent(query)}`;
        }
      }
    });

    setTimeout(() => {
      const navbarContainer = document.getElementById("navbar-container");
      // Use event delegation for profile dropdown
      navbarContainer.addEventListener("click", function (event) {
        const profileDiv = navbarContainer.querySelector(".profile");
        if (!profileDiv) return;
        // Toggle only if the click is on the profile image or caret
        const profileImg = profileDiv.querySelector("#Profile");
        const caret = profileDiv.querySelector(".profile-caret");
        if (
          profileImg &&
          (event.target === profileImg || (caret && event.target === caret))
        ) {
          event.stopPropagation();
          profileDiv.classList.toggle("active");
        }
        // Prevent dropdown from closing when clicking inside the menu
        const dropdownMenu = profileDiv.querySelector("ul");
        if (dropdownMenu && dropdownMenu.contains(event.target)) {
          event.stopPropagation();
        }
      });
      // Close dropdown when clicking outside
      document.addEventListener("click", (event) => {
        const profileDiv = navbarContainer.querySelector(".profile");
        if (profileDiv && !profileDiv.contains(event.target)) {
          profileDiv.classList.remove("active");
        }
      });

      const notification_img_ = document.getElementById("notification");
      const home_img_ = document.getElementById("home");
      const search_icon = document.getElementById("ser");
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

      // Home icon click: use event delegation
      navbarContainer.addEventListener("click", async function (event) {
        const homeImg = navbarContainer.querySelector("#home");
        if (event.target === homeImg) {
          try {
            const response = await fetch("/users/me", {
              credentials: "include",
            });
            if (!response.ok) throw new Error("Not authenticated");
            const user = await response.json();
            if (user.role === "admin") {
              window.location.href = "/Admindashboard/";
            } else {
              window.location.href = "/teachers_task_list/";
            }
          } catch (e) {
            window.location.href = "/login";
          }
        }
      });

      // Initialize theme (after navbar is loaded)
      initializeTheme();
    }, 0);
  })
  .catch((error) => {
    console.error("Error loading navbar:", error);
  });
