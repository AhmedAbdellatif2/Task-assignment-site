import { tasks, users } from "./tasks_data.js";

if (localStorage.getItem("Tasks") === null) {
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}
if (localStorage.getItem("users") === null) {
  localStorage.setItem("users", JSON.stringify(users));
}

function parseDateStrings(task) {
  task.start_date = new Date(task.start_date);
  task.due_date = new Date(task.due_date);
  task.created_at = new Date(task.created_at);
  task.updated_at = new Date(task.updated_at);

  task.comments.forEach((comment) => {
    comment.created_at = new Date(comment.created_at);
  });

  return task;
}

function loadTasks() {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks).map(parseDateStrings) : [];
}

function loadUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
}

class TaskItem {
  constructor(
    task_id,
    task_title,
    task_description,
    start_date,
    due_date,
    status,
    priority,
    assigned_to,
    comments = []
  ) {
    this.task_id = task_id;
    this.task_title = task_title;
    this.task_description = task_description;
    this.start_date = new Date(start_date);
    this.due_date = new Date(due_date);
    this.status = status;
    this.priority = priority;
    this.assigned_to = assigned_to;
    this.comments = comments;
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function displayUpcomingTasks() {
  const tasks = loadTasks();
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  const today = new Date();

  const upcoming = tasks
    .filter((task) => {
      const dueDate = new Date(task.due_date);
      return (
        (task.status === "pending" || task.status === "in_progress") &&
        dueDate >= today
      );
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  upcoming.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task-item");
    li.innerHTML = `
      <strong>${task.task_title}</strong> - Due: ${new Date(
      task.due_date
    ).toLocaleDateString()}
      <br> Priority: ${task.priority} 
      <br> Assigned to: ${task.assigned_to}
      <br> Status: ${task.status}
    `;
    taskList.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  displayUpcomingTasks();
});

const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

if (localStorage.getItem("Tasks") === null) {
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}

class TaskItem {
  constructor(
    task_id,
    task_title,
    task_description,
    start_date,
    due_date,
    status,
    priority,
    assigned_to,
    comments = []
  ) {
    this.task_id = task_id;
    this.task_title = task_title;
    this.task_description = task_description;
    this.start_date = new Date(start_date);
    this.due_date = new Date(due_date);
    this.status = status;
    this.priority = priority;
    this.assigned_to = assigned_to;
    this.comments = comments;
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = localStorage.getItem("Tasks");
  return tasks ? JSON.parse(tasks) : [];
}

function displayUpcomingTasks() {
  const tasks = loadTasks();
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  const today = new Date();

  const upcoming = tasks
    .filter((task) => {
      const dueDate = new Date(task.due_date);
      return (
        (task.status === "pending" || task.status === "in_progress") &&
        dueDate >= today
      );
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  upcoming.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task-item");
    li.innerHTML = `
      <strong>${task.task_title}</strong> - Due: ${new Date(
      task.due_date
    ).toLocaleDateString()}
      <br> Priority: ${task.priority} 
      <br> Assigned to: ${task.assigned_to}
      <br> Status: ${task.status}
    `;
    taskList.appendChild(li);
  });
}
displayUpcomingTasks();
