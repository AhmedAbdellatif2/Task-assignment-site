import { tasks, users } from "./tasks_data.js";

const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "login.html";
  throw new Error("User not authenticated");
}

if (currentUser.role === "admin") {
  window.location.href = "AdminDashboard.html";
}

if (localStorage.getItem("Tasks") === null) {
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}
if (localStorage.getItem("users") === null) {
  localStorage.setItem("users", JSON.stringify(users));
}

const taskListEl = document.querySelector(".task-list");
const tasksPercentEl = document.querySelector(".tasks-percent");
const progressBarEl = document.querySelector(".progress-bar");
const filterButtons = document.querySelectorAll(".filter-btn");

let storedTasks = JSON.parse(localStorage.getItem("Tasks")) || [];
let currentFilter = "all";

function filterTasksByUser(tasksArray, username) {
  return tasksArray.filter((task) => task.username === username);
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

function saveTasks() {
  localStorage.setItem("Tasks", JSON.stringify(storedTasks));
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
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      completeTask(button.dataset.id);
    });
  });

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      deleteTask(button.dataset.id);
    });
  });
}

function completeTask(id) {
  const task = storedTasks.find((t) => t.task_id == id);
  if (task) {
    task.status = "completed";
    saveTasks();
    applyFilter(currentFilter);
  }
}

function deleteTask(id) {
  storedTasks = storedTasks.filter((t) => t.task_id != id);
  saveTasks();
  applyFilter(currentFilter);
}
function applyFilter(filter) {
  currentFilter = filter;

  const userTasks = storedTasks.filter((task) => {
    if (Array.isArray(task.assigned_to)) {
      return task.assigned_to.includes(currentUser.username);
    }
    console.log(task.assigned_to);
    console.log(currentUser.username);
    return task.assigned_to === currentUser.username;
  });
  console.log(userTasks);
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

applyFilter("all");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    applyFilter(button.dataset.filter);
  });
});
