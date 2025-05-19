import { tasks, users } from "./tasks_data.js";
import ApiService from "./ApiService.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const currentUser = await ApiService.getCurrentUser();
    if (!currentUser) {
      window.location.href = "login.html";
      throw new Error("User not authenticated");
    }

    if (currentUser.role === "admin") {
      window.location.href = "AdminDashboard.html";
    }

    const taskListEl = document.querySelector(".task-list");
    const tasksPercentEl = document.querySelector(".tasks-percent");
    const progressBarEl = document.querySelector(".progress-bar");
    const filterButtons = document.querySelectorAll(".filter-btn");

    let tasks = [];
    let currentFilter = "all";

    async function loadTasks() {
      try {
        tasks = await ApiService.getAllTasks();
        applyFilter(currentFilter);
      } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Failed to load tasks. Please refresh the page.');
      }
    }

    function updateProgress(tasksArray) {
      const completedTasks = tasksArray.filter(
        (task) => task.status === "completed"
      ).length;
      const totalTasks = tasksArray.length;
      const completedPercent =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      tasksPercentEl.textContent = `Tasks Completed ${completedTasks}/${totalTasks}`;
      progressBarEl.style.width = `${completedPercent}%`;
    }

    function getTaskClass(status) {
      if (status === "completed") return "task-item completed";
      if (status === "in_progress") return "task-item in-progress";
      if (status === "pending") return "task-item pending";
      if (status === "archived") return "task-item archived";
      return "task-item";
    }

    function renderTasks(tasksArray) {
      taskListEl.innerHTML = "";

      if (tasksArray.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-list-message";
        emptyMessage.textContent = "You don't have tasks for now!";
        taskListEl.appendChild(emptyMessage);
        return;
      }

      tasksArray.forEach((task) => {
        const li = document.createElement("li");
        li.className = getTaskClass(task.status);

        li.innerHTML = `
          <div class="task-content">
            <a href="./teacher_task.html?task_id=${task.task_id}" class="task-link">
              <span class="task-text">${task.task_title}</span>
            </a>
            <div class="task-actions">
              <button class="complete-btn" data-id="${task.task_id}">✓</button>
              <button class="delete-btn" data-id="${task.task_id}">✕</button>
            </div>
          </div>
        `;

        taskListEl.appendChild(li);
      });

      attachActionButtons();
    }

    function attachActionButtons() {
      const completeButtons = document.querySelectorAll(".complete-btn");
      const deleteButtons = document.querySelectorAll(".delete-btn");

      completeButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
          e.stopPropagation();
          e.preventDefault();
          await completeTask(button.dataset.id);
        });
      });

      deleteButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
          e.stopPropagation();
          e.preventDefault();
          await deleteTask(button.dataset.id);
        });
      });
    }

    async function completeTask(id) {
      try {
        const task = tasks.find((t) => t.task_id == id);
        if (task) {
          const updatedTask = { ...task, status: "completed" };
          await ApiService.updateTask(id, updatedTask);
          await loadTasks();
        }
      } catch (error) {
        console.error('Error completing task:', error);
        showError('Failed to complete task. Please try again.');
      }
    }

    async function deleteTask(id) {
      try {
        await ApiService.deleteTask(id);
        await loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        showError('Failed to delete task. Please try again.');
      }
    }

    function applyFilter(filter) {
      currentFilter = filter;

      const userTasks = tasks.filter((task) => {
        if (Array.isArray(task.assigned_to)) {
          return task.assigned_to.includes(currentUser.username);
        }
        return task.assigned_to === currentUser.username;
      });

      let filteredTasks = [];
      if (filter === "all") {
        filteredTasks = userTasks;
      } else if (filter === "active") {
        filteredTasks = userTasks.filter(
          (task) => task.status === "in_progress" || task.status === "pending"
        );
      } else if (filter === "completed") {
        filteredTasks = userTasks.filter((task) => task.status === "completed");
      }

      renderTasks(filteredTasks);
      updateProgress(filteredTasks);
    }

    function showError(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      errorDiv.style.color = 'red';
      errorDiv.style.marginBottom = '10px';
      taskListEl.parentElement.insertBefore(errorDiv, taskListEl);
      setTimeout(() => errorDiv.remove(), 5000);
    }

    // Initial load
    await loadTasks();

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        applyFilter(button.dataset.filter);
      });
    });
  } catch (error) {
    console.error('Error initializing task list:', error);
    window.location.href = "login.html";
  }
});
