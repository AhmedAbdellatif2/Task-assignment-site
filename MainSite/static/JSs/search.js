import apiService from "./ApiService.js";

class TaskSearchManager {
  constructor() {
    this.init();
  }
  async init() {
    apiService
      .getCurrentUser()
      .then((currentUser) => {
        if (currentUser.role === "admin") {
          return;
        }
        return currentUser;
      })
      .catch((error) => {
        console.error("Error fetching current user:", error);
        window.location.href = "/login";
      });

    this.searchInput = document.getElementById("search-input");
    this.searchResults = document.getElementById("search-results");
    this.setupEventListeners();
  }
  setupEventListeners() {
    this.searchInput.addEventListener(
      "input",
      this.debounce(() => {
        this.performSearch(this.searchInput.value);
      }, 300)
    );
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

  async performSearch(query) {
    if (!query.trim()) {
      this.searchResults.innerHTML = "";
      return;
    }

    try {
      const tasks = await apiService.searchTasks(query);
      this.displaySearchResults(tasks);
    } catch (error) {
      console.error("Error searching tasks:", error);
      this.showError("Failed to search tasks");
    }
  }

  displaySearchResults(tasks) {
    this.searchResults.innerHTML = "";

    if (tasks.length === 0) {
      this.searchResults.innerHTML = '<p class="no-results">No tasks found</p>';
      return;
    }

    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task-result";
      taskElement.innerHTML = `
                <h3><a href="./teacher_task.html?task_id=${task.id}">${task.title}</a></h3>
                <p>${task.description}</p>
                <div class="task-meta">
                    <span class="status ${task.status}">${task.status}</span>
                    <span class="due-date">Due: ${task.dueDate}</span>
                </div>
            `;
      this.searchResults.appendChild(taskElement);
    });
  }

  showError(message) {
    // Implement error notification
    alert(message);
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TaskSearchManager();
});
