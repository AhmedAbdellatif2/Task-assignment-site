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
  const tasks = localStorage.getItem("Tasks");
  return tasks ? JSON.parse(tasks).map(parseDateStrings) : [];
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
    <a href="./teacher_task.html?task_id=${task.task_id}" class="task-link">
      <strong>${task.task_title}</strong> - Due: ${new Date(
      task.due_date
    ).toLocaleDateString()}
      <br> Priority: ${task.priority} 
      <br> Assigned to: ${task.assigned_to}
      <br> Status: ${task.status}
    </a>
    `;
    taskList.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  displayUpcomingTasks();
});
