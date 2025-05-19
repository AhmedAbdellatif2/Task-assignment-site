import ApiService from "./ApiService.js";

async function getCurrentUserRole() {
  try {
    const currentUser = await ApiService.getCurrentUser();
    return currentUser?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async function() {
  const taskList = document.getElementById("taskList");
  let tasks = [];

  function showLoading() {
    taskList.innerHTML = '<div class="loading">Loading tasks...</div>';
  }

  async function loadTasks() {
    showLoading();
    try {
      tasks = await ApiService.getAllTasks();
      renderTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      if (error.message === 'Unauthorized') {
        window.location.href = "login.html";
        return;
      }
      showError('Failed to load tasks. Please try again.');
    }
  }

  try {
    const userRole = await getCurrentUserRole();

    if (userRole !== "admin") {
      alert("Unauthorized access. Redirecting to login...");
      window.location.href = "login.html";
      return;
    }

    function renderTasks(tasks) {
      const taskList = document.getElementById("taskList");
      taskList.innerHTML = "";

      if (tasks.length === 0) {
        taskList.innerHTML = "<p>No tasks available.</p>";
        return;
      }

      tasks.forEach((task) => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        taskItem.addEventListener("click", () => {
          window.location.href = `teacher_task.html?task_id=${task.task_id}`;
        });

        const startDate = task.start_date
          ? new Date(task.start_date).toLocaleDateString()
          : "Not set";
        const dueDate = task.due_date
          ? new Date(task.due_date).toLocaleDateString()
          : "Not set";

        taskItem.innerHTML = `
          <div class="task-content">
            <h3>${task.task_title}</h3>
            <p class="task-description">${task.task_description}</p>
            <div class="task-meta">
              <span class="task-priority ${task.priority || "medium"}">${task.priority || "Medium"}</span>
              <span class="task-status ${task.status || "pending"}">${task.status || "Pending"}</span>
              <span class="task-dates">Due: ${dueDate}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="edit-btn" title="Edit Task">✏️</button>
            <button class="delete-btn" title="Delete Task">🗑️</button>
          </div>
        `;

        const editBtn = taskItem.querySelector(".edit-btn");
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          editTask(task.task_id);
        });

        const deleteBtn = taskItem.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          await deleteTask(task.task_id);
        });

        taskList.appendChild(taskItem);
      });
    }

    function editTask(taskId) {
      window.location.href = `AdminEditPage.html?id=${taskId}`;
    }

    async function deleteTask(taskId) {
      if (confirm("Are you sure you want to delete this task?")) {
        try {
          await ApiService.deleteTask(taskId);
          await loadTasks();
          showMessage("Task deleted successfully", "success");
        } catch (error) {
          console.error('Error deleting task:', error);
          showError('Failed to delete task. Please try again.');
        }
      }
    }

    function showError(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      errorDiv.style.color = 'red';
      errorDiv.style.marginBottom = '10px';
      const taskList = document.getElementById("taskList");
      taskList.parentElement.insertBefore(errorDiv, taskList);
      setTimeout(() => errorDiv.remove(), 5000);
    }

    function showMessage(message, type) {
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${type}`;
      messageDiv.textContent = message;
      messageDiv.style.position = "fixed";
      messageDiv.style.top = "20px";
      messageDiv.style.right = "20px";
      messageDiv.style.padding = "10px 20px";
      messageDiv.style.borderRadius = "4px";
      messageDiv.style.backgroundColor = type === "success" ? "#4caf50" : "#f44336";
      messageDiv.style.color = "white";
      messageDiv.style.zIndex = "1000";

      document.body.appendChild(messageDiv);
      setTimeout(() => messageDiv.remove(), 3000);
    }

    // Initial load
    await loadTasks();

    const searchInput = document.getElementById("search");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm === "") {
          renderTasks(tasks);
        } else {
          const filteredTasks = tasks.filter(
            (task) =>
              task.task_title.toLowerCase().includes(searchTerm) ||
              task.task_description.toLowerCase().includes(searchTerm)
          );
          renderTasks(filteredTasks);
        }
      });
    }
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    window.location.href = "login.html";
  }
});
