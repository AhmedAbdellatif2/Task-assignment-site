import apiService from "./ApiService.js";

class TaskListManager {
  constructor() {
    this.init();
  }

  async init() {
    try {
      apiService
        .getCurrentUser()
        .then((currentUser) => {
          if (currentUser.role === "admin") {
            window.location.href = "/Admindashboard";
            return;
          }
          return currentUser;
        })
        .catch((error) => {
          console.error("Error fetching current user:", error);
          window.location.href = "/login";
        });

      await this.displayTasks();
      this.setupEventListeners();
    } catch (error) {
      console.error("Error initializing task list:", error);
      this.showError("Failed to initialize. Please try again later.");
    }
  }

  async displayTasks(filter = "all") {
    try {
      const tasks = await apiService.getAllTasks();
      const taskList = document.getElementById("task-list");
      taskList.innerHTML = "";

      let filteredTasks = tasks;
      if (filter === "active") {
        filteredTasks = tasks.filter(
          (task) =>
            task.status !== "completed" &&
            task.status !== "Completed" &&
            !this.isUpcomingTask(task)
        );
      } else if (filter === "completed") {
        filteredTasks = tasks.filter(
          (task) => task.status === "completed" || task.status === "Completed"
        );
      } else if (filter === "upcoming") {
        filteredTasks = tasks.filter((task) => this.isUpcomingTask(task));
      }

      filteredTasks.forEach((task) => {
        const taskElement = this.createTaskElement(task);
        taskList.appendChild(taskElement);
      });

      this.updateProgressBar(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      this.showError("Failed to load tasks. Please try again later.");
    }
  }

  updateProgressBar(tasks) {
    const progressBar = document.getElementById("progress-bar");
    const percentText = document.getElementById("tasks-percent");
    if (!progressBar || !percentText) return;
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => task.status === "completed" || task.status === "Completed"
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressBar.style.width = percent + "%";
    percentText.textContent = `${percent}% tasks completed (${completed}/${total})`;
  }

  isUpcomingTask(task) {
    // Consider a task upcoming if its start date is in the future
    const start = new Date(task.startDate || task.start_date);
    return start.getTime() > Date.now();
  }

  createTaskElement(task) {
    const div = document.createElement("div");
    // Use 'task-item' for styling, and add 'upcoming-task' if needed
    div.className =
      "task-item" + (this.isUpcomingTask(task) ? " upcoming-task" : "");
    div.innerHTML = `
      <div class="task-content">
        <a href="/teacher_task?task_id=${task.id}" class="task-link">
          <span class="task-text">${task.title}</span>
          ${
            this.isUpcomingTask(task)
              ? '<span class="upcoming-label" style="color:#2196f3;font-weight:bold;"> (Upcoming)</span>'
              : ""
          }
        </a>
        <div class="task-actions">
          <button class="complete-btn" data-id="${task.id}">✓</button>
          <button class="delete-btn" data-id="${task.id}">✕</button>
        </div>
      </div>
    `;
    return div;
  }

  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.getAttribute("data-filter");
        this.displayTasks(filter);
      });
    });

    // Task actions
    document.addEventListener("click", async (e) => {
      if (e.target.matches(".delete-btn")) {
        const taskId = e.target.getAttribute("data-id");
        await this.deleteTask(taskId);
      } else if (e.target.matches(".complete-btn")) {
        const taskId = e.target.getAttribute("data-id");
        await this.completeTask(taskId);
      }
    });
  }

  async deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await apiService.deleteTask(taskId);
      await this.displayTasks(); // Refresh the task list
      this.showSuccess("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      this.showError("Failed to delete task. Please try again later.");
    }
  }

  async completeTask(taskId) {
    try {
      await apiService.updateTask(taskId, { status: "completed" });
      await this.displayTasks();
      this.showSuccess("Task marked as completed");
    } catch (error) {
      console.error("Error marking task as completed:", error);
      this.showError(
        "Failed to mark task as completed. Please try again later."
      );
    }
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f44336;
            color: white;
            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
        `;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
      errorDiv.style.opacity = "0";
      errorDiv.style.transition = "opacity 0.3s ease";
      setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
  }

  showSuccess(message) {
    const notification = document.createElement("div");
    notification.className = "notification success";
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TaskListManager();
});
