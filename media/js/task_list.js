import { tasks, users } from "./tasks_data.js";

if (localStorage.getItem("Tasks") === null) {
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}
if (localStorage.getItem("users") === null) {
  localStorage.setItem("users", JSON.stringify(users));
}
