import ApiService from "./ApiService.js";

window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query")?.toLowerCase() || "";
  const resultsContainer = document.querySelector(".search-results");
  const form = document.querySelector(".search-form");
  const input = form.querySelector('input[name="query"]');
  const filterButtons = document.querySelectorAll(".filter-btn");
  const priorityDropdown = document.getElementById("priority-filter");

  input.value = query;

  try {
    const currentUser = await ApiService.getCurrentUser();
    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    const tasks = await ApiService.searchTasks({ query });
    const userTasks = currentUser.role === "admin" 
      ? tasks 
      : tasks.filter(task => task.assigned_to === currentUser.username);

    if (userTasks.length === 0) {
      resultsContainer.innerHTML = "<p>No results found</p>";
      return;
    }

    const ul = document.createElement("ul");
    ul.classList.add("task-list");

    userTasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${task.status === "completed" ? "completed" : ""}`;
      li.innerHTML = `
        <div class="task-content">
          <a href="./teacher_task.html?task_id=${task.task_id}" class="task-link">
            <span class="task-text">${task.task_title}</span>
          </a>
          ${task.status !== "completed" ? 
            `<button onclick="markAsComplete('${task.task_id}')" class="complete-btn">✓</button>` 
            : ''
          }
        </div>
      `;
      ul.appendChild(li);
    });

    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(ul);
  } catch (error) {
    console.error('Error:', error);
    resultsContainer.innerHTML = "<p>Error loading search results</p>";
  }

  // Filter state
  let currentStatus = "all";
  let currentPriority = "all";

  function renderTasks() {
    resultsContainer.innerHTML = "";

    let filteredTasks = userTasks;

    // Filter by status
    if (currentStatus !== "all") {
      if (currentStatus === "active") {
        filteredTasks = filteredTasks.filter(
          (task) => task.status === "in_progress" || task.status === "pending"
        );
      } else {
        filteredTasks = filteredTasks.filter(
          (task) => task.status === currentStatus
        );
      }
    }

    // Filter by priority
    if (currentPriority !== "all") {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === currentPriority
      );
    }

    if (filteredTasks.length === 0) {
      resultsContainer.innerHTML = `<p>No results found. Try a different filter or search term.</p>`;
      return;
    }

    const ul = document.createElement("ul");
    ul.classList.add("task-list");

    filteredTasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${
        task.status === "completed" ? "completed" : ""
      }`;

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

      ul.appendChild(li);
    });

    resultsContainer.appendChild(ul);
  }

  // Initial render
  renderTasks();

  // Handle status filter button clicks
  filterButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelector(".filter-btn.active")?.classList.remove("active");
      btn.classList.add("active");
      currentStatus = btn.dataset.filter;
      renderTasks();
    })
  );

  // Handle priority dropdown change
  priorityDropdown.addEventListener("change", () => {
    currentPriority = priorityDropdown.value;
    renderTasks();
  });
});

window.markAsComplete = async function(taskId) {
  try {
    await ApiService.updateTaskStatus(taskId, "completed");
    location.reload();
  } catch (error) {
    console.error('Error:', error);
  }
}
