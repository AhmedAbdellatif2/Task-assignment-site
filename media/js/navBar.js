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
    navbarContainer.innerHTML = html;

    const profile_div = document.getElementsByClassName("profile")[0];

    profile_div.addEventListener("click", () => {
      if (profile_div.classList.contains("active")) {
        profile_div.classList.remove("active");
      } else {
        profile_div.classList.add("active");
      }
    });

    // DISPLAY THE NOTIFICATION PANEL
    const notification_img_ = document.getElementById("notification");
    const home_img_ = document.getElementById("home");

    notification_img_.onclick = function () {
      document.body.classList.toggle("panel_on");
      if (document.body.classList.contains("panel_on")) {
        let container = document.createElement("div");
        container.className = "notification_panel";

        let notifications = document.createElement("p");
        let header = document.getElementById("navbar");

        notifications.textContent = "No notifications yet";
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
      } else {
        const panel = document.querySelector(".notification_panel");
        panel.remove();
      }
    };

    //temp user object
    let user = { role: "user" };

    home_img_.onclick = function () {
      if (user.role == "admin") window.location.href = "AdminDashboard.html";
      else window.location.href = "teachers_task_list.html";
    };

    if (localStorage.getItem("theme") === "dark") {
      applyTheme("dark");
      console.log("is good dark");
    } else {
      applyTheme("light");
      console.log("is good light");
    }
  })
  .catch((error) => {
    console.error("Error loading navbar:", error);
  });
