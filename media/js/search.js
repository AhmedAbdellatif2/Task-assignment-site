window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query")?.toLowerCase() || "";
  const resultsContainer = document.querySelector(".search-results");
  const form = document.querySelector(".search-form");
  const input = form.querySelector('input[name="query"]');
  const filterButtons = document.querySelectorAll(".filter-btn");

  input.value = query;

  let currentUser = null;
  try {
    const userStr = sessionStorage.getItem("currentUser");
    currentUser = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse currentUser from sessionStorage:", e);
  }

  if (!currentUser) {
    resultsContainer.innerHTML = "<p>Error: No current user found.</p>";
    return;
  }

  let tasks = [];
  try {
    const stored = localStorage.getItem("Tasks");
    tasks = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse tasks from localStorage:", e);
  }

  if (!query) {
    resultsContainer.innerHTML = "<p>Type a search term to see results.</p>";
    return;
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.assigned_to === currentUser.username &&
      (task.task_title.toLowerCase().includes(query) ||
        task.task_description.toLowerCase().includes(query))
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "completed";
      case "in_progress":
        return "in-progress";
      case "pending":
        return "pending";
      case "archived":
        return "archived";
      default:
        return "";
    }
  };

  const renderTasks = (statusFilter = "all") => {
    let tasksToRender;

    if (statusFilter === "all") {
      tasksToRender = filteredTasks;
    } else if (statusFilter === "active") {
      tasksToRender = filteredTasks.filter(
        (task) => task.status === "in_progress" || task.status === "pending"
      );
    } else {
      tasksToRender = filteredTasks.filter(
        (task) => task.status === statusFilter
      );
    }

    if (tasksToRender.length === 0) {
      resultsContainer.innerHTML =
        "<p>No tasks match this filter. Try something else.</p>";
      return;
    }

    resultsContainer.innerHTML = `
      <ul class="task-list">
        ${tasksToRender
          .map((task) => {
            const taskClass = getStatusClass(task.status);
            return `
            <li class="task-item ${taskClass}">
              <div class="task-content">
                <a href="./teacher_task.html?task_id=${task.task_id}" class="task-link">
                  <span class="task-text">${task.task_title}</span>
                </a>
                <div class="task-actions">
                  <button class="complete-btn" data-id="${task.task_id}">✓</button>
                  <button class="delete-btn" data-id="${task.task_id}">✕</button>
                </div>
              </div>
            </li>`;
          })
          .join("")}
      </ul>
    `;
  };

  renderTasks("all");

  filterButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelector(".filter-btn.active")?.classList.remove("active");
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      renderTasks(filter);
    })
  );
});
