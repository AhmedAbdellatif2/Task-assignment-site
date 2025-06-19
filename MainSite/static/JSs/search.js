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

    this.searchForm = document.querySelector(".search-form");
    this.searchInput = this.searchForm.querySelector("input[name='query']");
    this.searchResults = document.querySelector(".search-results");
    this.filterBtns = document.querySelectorAll(".filter-btn");
    this.priorityFilter = document.getElementById("priority-filter");

    this.activeStatus = "all";
    this.activePriority = "all";

    // Check for query param in URL and auto-search
    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get("query");
    if (urlQuery) {
      this.searchInput.value = urlQuery;
      this.performSearch();
    }

    this.setupEventListeners();
  }
  setupEventListeners() {
    // Form submit
    this.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.performSearch();
    });
    // Input debounce
    this.searchInput.addEventListener(
      "input",
      this.debounce(() => {
        this.performSearch();
      }, 300)
    );
    // Filter buttons
    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeStatus = btn.dataset.filter;
        this.performSearch();
      });
    });
    // Priority dropdown
    this.priorityFilter.addEventListener("change", () => {
      this.activePriority = this.priorityFilter.value;
      this.performSearch();
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async performSearch() {
    const query = this.searchInput.value.trim();
    if (!query) {
      this.searchResults.innerHTML = "";
      return;
    }
    // Compose filters
    const status = this.activeStatus;
    const priority = this.activePriority;
    try {
      // If your API supports filters, pass them. Otherwise, filter client-side.
      let tasks = await apiService.searchTasks(query);
      // Client-side filter fallback
      if (status !== "all") {
        tasks = tasks.filter(
          (t) => t.status && t.status.toLowerCase() === status
        );
      }
      if (priority !== "all") {
        tasks = tasks.filter(
          (t) => t.priority && t.priority.toLowerCase() === priority
        );
      }
      this.displaySearchResults(tasks);
    } catch (error) {
      console.error("Error searching tasks:", error);
      this.showError("Failed to search tasks");
    }
  }

  displaySearchResults(tasks) {
    this.searchResults.innerHTML = "";
    if (!tasks || tasks.length === 0) {
      this.searchResults.innerHTML = '<p class="no-results">No tasks found</p>';
      return;
    }
    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task-result modern-card";
      // Format date to something like: May 21, 2025, 4:04 PM
      let dueDateStr = "";
      if (task.dueDate) {
        const dateObj = new Date(task.dueDate);
        if (!isNaN(dateObj)) {
          dueDateStr = dateObj.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        } else {
          dueDateStr = task.dueDate;
        }
      }
      taskElement.innerHTML = `
        <div class="card-header">
          <h3><a href="./teacher_task.html?task_id=${task.id}">${
        task.title
      }</a></h3>
          <span class="status-pill ${task.status?.toLowerCase() || ""}">${
        task.status || ""
      }</span>
        </div>
        <p class="task-desc">${task.description || ""}</p>
        <div class="card-footer">
          <span class="priority-pill ${task.priority?.toLowerCase() || ""}">${
        task.priority || ""
      }</span>
          <span class="due-date">${
            dueDateStr ? `Due: ${dueDateStr}` : ""
          }</span>
        </div>
      `;
      this.searchResults.appendChild(taskElement);
    });
  }

  showError(message) {
    alert(message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TaskSearchManager();
});
