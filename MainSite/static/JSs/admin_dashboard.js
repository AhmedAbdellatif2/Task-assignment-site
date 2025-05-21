import apiService from "./ApiService.js";

class AdminDashboard {
  constructor() {
    this.taskList = document.getElementById("task-list");
    this.taskStats = document.getElementById("task-stats");
    this.teacherStats = document.getElementById("teacher-stats");
    this.setupEventListeners();
    this.initialize();
  }

  async initialize() {
    try {
      // Check admin access
      apiService
        .getCurrentUser()
        .then(async (currentUser) => {
          if (currentUser.role !== "admin") {
            window.location.href = "/login";
            throw new Error("Unauthorized access");
          }
          await Promise.all([
            this.loadTasks(),
            this.loadTeachers(),
            this.updateStatistics(),
          ]);
          return currentUser;
        })
        .catch((error) => {
          console.error("Error fetching current user:", error);
          window.location.href = "/login";
        });
    } catch (error) {
      console.error("Initialization error:", error);
      this.showError(error);
    }
  }

  async loadTasks() {
    try {
      const tasks = await apiService.getAllTasks();
      this.displayTasks(tasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      this.showError("Failed to load tasks");
    }
  }

  async loadTeachers() {
    try {
      const teachers = await apiService.getUsers({ role: "teacher" });
      this.updateTeacherStats(teachers);
    } catch (error) {
      console.error("Error loading teachers:", error);
      this.showError("Failed to load teacher statistics");
    }
  }

  displayTasks(tasks) {
    if (!this.taskList) return;

    this.taskList.innerHTML = "";
    if (tasks.length === 0) {
      this.taskList.innerHTML = '<p class="no-tasks">No tasks available</p>';
      return;
    }

    tasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      this.taskList.appendChild(taskElement);
    });
  }

  createTaskElement(task) {
    const div = document.createElement("div");
    div.className = "task-item";

    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < new Date() && task.status !== "completed";

    div.innerHTML = `
            <div class="task-header">
                <h3>${task.title}</h3>
                <span class="task-status ${task.status}">${task.status}</span>
            </div>
            <p class="task-description">${task.description}</p>
            <div class="task-meta">
                <span class="due-date ${isOverdue ? "overdue" : ""}">
                    Due: ${dueDate.toLocaleDateString()}
                </span>
                <span class="priority ${task.priority}">${task.priority}</span>
            </div>
            <div class="task-actions">
                <button onclick="editTask('${
                  task.id
                }')" class="edit-btn">Edit</button>
                <button onclick="deleteTask('${
                  task.id
                }')" class="delete-btn">Delete</button>
            </div>
        `;
    return div;
  }

  async updateStatistics() {
    try {
      const tasks = await apiService.getAllTasks();
      const teachers = await apiService.getUsers({ role: "teacher" });

      const stats = this.calculateTaskStats(tasks);
      this.displayTaskStats(stats);
      this.updateTeacherStats(teachers);
    } catch (error) {
      console.error("Error updating statistics:", error);
      this.showError("Failed to update statistics");
    }
  }

  calculateTaskStats(tasks) {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      overdue: tasks.filter((t) => {
        const dueDate = new Date(t.dueDate);
        return dueDate < new Date() && t.status !== "completed";
      }).length,
    };
  }

  displayTaskStats(stats) {
    if (!this.taskStats) return;

    this.taskStats.innerHTML = `
            <div class="stat-item">
                <h4>Total Tasks</h4>
                <p>${stats.total}</p>
            </div>
            <div class="stat-item">
                <h4>Completed</h4>
                <p>${stats.completed}</p>
            </div>
            <div class="stat-item">
                <h4>In Progress</h4>
                <p>${stats.inProgress}</p>
            </div>
            <div class="stat-item">
                <h4>Pending</h4>
                <p>${stats.pending}</p>
            </div>
            <div class="stat-item">
                <h4>Overdue</h4>
                <p>${stats.overdue}</p>
            </div>
        `;
  }

  updateTeacherStats(teachers) {
    if (!this.teacherStats) return;

    this.teacherStats.innerHTML = `
            <div class="stat-item">
                <h4>Total Teachers</h4>
                <p>${teachers.length}</p>
            </div>
            <div class="stat-item">
                <h4>Active Teachers</h4>
                <p>${teachers.filter((t) => t.status === "active").length}</p>
            </div>
        `;
  }

  setupEventListeners() {
    // Add Task button
    const addTaskBtn = document.getElementById("add-task-btn");
    if (addTaskBtn) {
      addTaskBtn.addEventListener("click", () => {
        window.location.href = "add_task.html";
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.initialize());
    }

    // Search functionality
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        this.debounce(async (e) => {
          const query = e.target.value.trim();
          if (query) {
            try {
              const tasks = await apiService.searchTasks(query);
              this.displayTasks(tasks);
            } catch (error) {
              console.error("Search error:", error);
              this.showError("Search failed");
            }
          } else {
            this.loadTasks();
          }
        }, 300)
      );
    }

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const status = btn.dataset.status;
        try {
          const tasks = await apiService.getAllTasks({ status });
          this.displayTasks(tasks);
        } catch (error) {
          console.error("Filter error:", error);
          this.showError("Failed to filter tasks");
        }
      });
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
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
}

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
  new AdminDashboard();
});

// Global functions for task actions
window.editTask = async (taskId) => {
  window.location.href = `edit_task.html?id=${taskId}`;
};

window.deleteTask = async (taskId) => {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    await apiService.deleteTask(taskId);
    // Refresh the dashboard
    window.adminDashboard.loadTasks();
    window.adminDashboard.updateStatistics();
  } catch (error) {
    console.error("Error deleting task:", error);
    window.adminDashboard.showError("Failed to delete task");
  }
};
