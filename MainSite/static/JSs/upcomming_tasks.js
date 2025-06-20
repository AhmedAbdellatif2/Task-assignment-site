import apiService from "./ApiService.js";

// Modern, theme-aware error notification
function showError(message) {
  let errorBox = document.getElementById("custom-error-box");
  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.id = "custom-error-box";
    errorBox.style.position = "fixed";
    errorBox.style.top = "20px";
    errorBox.style.left = "50%";
    errorBox.style.transform = "translateX(-50%)";
    errorBox.style.zIndex = "9999";
    errorBox.style.padding = "1rem 2rem";
    errorBox.style.borderRadius = "8px";
    errorBox.style.background = "var(--error-bg, #ff4d4f)";
    errorBox.style.color = "var(--error-fg, #fff)";
    errorBox.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    errorBox.style.fontSize = "1.1rem";
    errorBox.style.display = "none";
    document.body.appendChild(errorBox);
  }
  errorBox.textContent = message;
  errorBox.style.display = "block";
  setTimeout(() => {
    errorBox.style.display = "none";
  }, 3500);
}

class UpcomingTasksManager {
  constructor() {
    this.tasksList = document.getElementById("upcoming-tasks-list");
    if (this.tasksList) {
      this.loadUpcomingTasks();
    }
  }

  async loadUpcomingTasks() {
    try {
      const allTasks = await apiService.getAllTasks();
      const now = new Date();
      // Only include tasks with a valid start date in the future
      const upcomingTasks = allTasks.filter((task) => {
        const start = new Date(task.startDate || task.start_date);
        return (
          start instanceof Date &&
          !isNaN(start) &&
          start.getTime() > now.getTime()
        );
      });
      this.displayTasks(upcomingTasks);
    } catch (error) {
      console.error("Error loading upcoming tasks:", error);
      showError("Failed to load upcoming tasks");
    }
  }

  displayTasks(tasks) {
    this.tasksList.innerHTML = "";
    if (!Array.isArray(tasks) || tasks.length === 0) {
      this.tasksList.innerHTML = '<p class="no-tasks">No upcoming tasks</p>';
      return;
    }
    // Remove all previous .task-item elements to avoid duplicates
    while (this.tasksList.firstChild) {
      this.tasksList.removeChild(this.tasksList.firstChild);
    }
    tasks.forEach((task) => {
      // Always use the modern-task class for new elements
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-item", "modern-task");
      const dueDate = new Date(task.dueDate || task.due_date);
      let daysUntilDue = "?";
      if (dueDate instanceof Date && !isNaN(dueDate)) {
        daysUntilDue = Math.ceil(
          (dueDate - new Date()) / (1000 * 60 * 60 * 24)
        );
      }
      taskElement.innerHTML = `
        <div class="task-header">
          <h3 class="task-title">${task.title}</h3>
          <span class="status ${task.status}">${task.status}</span>
          <div class="task-meta">
          <span class="due-date"><i class="fa fa-calendar"></i> Due in <b>${daysUntilDue}</b> days</span>
        </div>
        </div>
        <p class="task-desc">${task.description || "No description"}</p>
        
      `;
      // Make the whole card clickable
      taskElement.style.cursor = "pointer";
      taskElement.addEventListener("click", () => {
        window.location.href = `/teacher_task?task_id=${task.id}`;
      });
      this.tasksList.appendChild(taskElement);
    });
  }
}

class ProfileManager {
  constructor() {
    this.usernameEl = document.getElementById("username");
    this.roleEl = document.getElementById("user-role");
    this.emailEl = document.getElementById("user-email");
    if (this.usernameEl && this.roleEl && this.emailEl) {
      this.init();
    }
  }
  async init() {
    try {
      const currentUser = await apiService.getCurrentUser();
      if (currentUser && currentUser.role !== "admin") {
        this.updateUI(currentUser);
      } else if (!currentUser) {
        throw new Error("No user data returned");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      window.location.href = "/login";
    }
  }
  updateUI(user) {
    if (!user) {
      console.error("No user provided to updateUI");
      return;
    }
    this.usernameEl.textContent = user.username;
    this.roleEl.textContent = `Role: ${user.role}`;
    this.emailEl.textContent = `Email: ${user.email}`;
  }
}

// Initialize managers only if their elements exist
// (prevents errors on pages where not all sections are present)
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("upcoming-tasks-list")) {
    new UpcomingTasksManager();
  }
  if (
    document.getElementById("username") &&
    document.getElementById("user-role") &&
    document.getElementById("user-email")
  ) {
    new ProfileManager();
  }
});
