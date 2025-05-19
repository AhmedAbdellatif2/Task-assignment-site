import ApiService from "./ApiService.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const tasks = await ApiService.getAllTasks();
    displayUpcomingTasks(tasks);
  } catch (error) {
    console.error('Error:', error);
  }
});

function displayUpcomingTasks(tasks) {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  const today = new Date();
  const upcoming = tasks.filter((task) => {
    const dueDate = new Date(task.due_date);
    return (task.status === "pending" || task.status === "in_progress") && dueDate >= today;
  })
  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  if (upcoming.length === 0) {
    taskList.innerHTML = "<p>No upcoming tasks</p>";
    return;
  }

  upcoming.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task-item");
    li.innerHTML = `
      <a href="./teacher_task.html?task_id=${task.task_id}" class="task-link">
        <strong>${task.task_title}</strong> - Due: ${new Date(task.due_date).toLocaleDateString()}
        <br> Priority: ${task.priority} 
        <br> Assigned to: ${task.assigned_to}
        <br> Status: ${task.status}
      </a>
    `;
    taskList.appendChild(li);
  });
}
