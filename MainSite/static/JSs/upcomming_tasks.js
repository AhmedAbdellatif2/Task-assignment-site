import apiService from "./ApiService.js";

class UpcomingTasksManager {
  constructor() {
    this.tasksList = document.getElementById("upcoming-tasks-list");
    this.loadUpcomingTasks();
  }

  async loadUpcomingTasks() {
    try {
      // Get all tasks and filter for upcoming (startDate in the future)
      const allTasks = await apiService.getAllTasks();
      const now = new Date();
      const upcomingTasks = allTasks.filter((task) => {
        const start = new Date(task.startDate || task.start_date);
        return start.getTime() > now.getTime();
      });
      this.displayTasks(upcomingTasks);
    } catch (error) {
      console.error("Error loading upcoming tasks:", error);
      this.showError("Failed to load upcoming tasks");
    }
  }

  displayTasks(tasks) {
    this.tasksList.innerHTML = "";

    if (tasks.length === 0) {
      this.tasksList.innerHTML = '<p class="no-tasks">No upcoming tasks</p>';
      return;
    }

    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task-item";
      const dueDate = new Date(task.dueDate || task.due_date);
      const daysUntilDue = Math.ceil(
        (dueDate - new Date()) / (1000 * 60 * 60 * 24)
      );
      taskElement.innerHTML = `
                <h3><a href="/teacher_task?task_id=${task.id}">${task.title}</a></h3>
                <p>${task.description}</p>
                <div class="task-meta">
                    <span class="status ${task.status}">${task.status}</span>
                    <span class="due-date">Due in ${daysUntilDue} days</span>
                </div>
            `;
      this.tasksList.appendChild(taskElement);
    });
  }

  showError(message) {
    // Implement error notification
    alert(message);
  }
}

// Initialize when the DOM is loaded
// Only run if the element exists (prevents errors on other pages)
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("upcoming-tasks-list")) {
    new UpcomingTasksManager();
  }
});
