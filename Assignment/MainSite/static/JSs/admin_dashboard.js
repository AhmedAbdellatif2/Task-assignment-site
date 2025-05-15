function getCurrentUserRole() {
  return JSON.parse(sessionStorage.getItem("currentUser"))?.role || null;
}

const userRole = getCurrentUserRole();

if (userRole !== "admin") {
  alert("Unauthorized access. Redirecting to login...");
  window.location.href = "login.html";
}

const storedTasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

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
            <span class="task-priority ${task.priority || "medium"}">${
      task.priority || "Medium"
    }</span>
            <span class="task-status ${task.status || "pending"}">${
      task.status || "Pending"
    }</span>
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
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task.task_id);
    });

    taskList.appendChild(taskItem);
  });
}

function editTask(taskId) {
  window.location.href = `AdminEditPage.html?id=${taskId}`;
}

function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    const updatedTasks = storedTasks.filter((task) => task.task_id !== taskId);

    localStorage.setItem("Tasks", JSON.stringify(updatedTasks));
    renderTasks(updatedTasks);
  }
}
renderTasks(storedTasks);

const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === "") {
      renderTasks(storedTasks);
    } else {
      const filteredTasks = storedTasks.filter(
        (task) =>
          task.task_title.toLowerCase().includes(searchTerm) ||
          task.task_description.toLowerCase().includes(searchTerm)
      );
      renderTasks(filteredTasks);
    }
  });
}
