function getCurrentUserRole() {
  return JSON.parse(sessionStorage.getItem("currentUser"))?.role || null;
}

const userRole = getCurrentUserRole();

if (userRole !== "admin") {
  alert("Unauthorized access. Redirecting to login...");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  checkAdminAccess();
  const taskForm = document.querySelector("form");
  taskForm.addEventListener("submit", handleFormSubmit);
  populateTeacherDropdown();
  generateTaskId();
});

function checkAdminAccess() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  if (currentUser.role !== "admin") {
    alert("Unauthorized access. Redirecting to login...");
    window.location.href = "login.html";
  }
}

function generateTaskId() {
  const taskIdField = document.getElementById("task-id");
  if (taskIdField) {
    const uniqueId =
      "task_" +
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 5);
    taskIdField.value = uniqueId;
    taskIdField.setAttribute("readonly", true);
  }
}
function handleFormSubmit(event) {
  event.preventDefault();
  const taskId = document.getElementById("task-id").value;
  const taskTitle = document.getElementById("task-title").value;
  const teacherName = document.getElementById("teacher-name").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value;
  if (!validateForm(taskTitle, teacherName, description)) {
    return;
  }

  const teacherId = getTeacherIdByName(teacherName);
  if (!teacherId && teacherName.trim() !== "") {
    alert("Teacher not found. Please select a valid teacher.");
    return;
  }
  const newTask = createTaskObject(
    taskId,
    taskTitle,
    description,
    priority,
    teacherId
  );
  saveTask(newTask);
  resetForm();
  window.location.href = "AdminDashboard.html";
}

function validateForm(title, teacher, description) {
  let isValid = true;
  if (!title || title.trim() === "") {
    alert("Please enter a task title");
    isValid = false;
  }

  if (!description || description.trim() === "") {
    alert("Please enter a task description");
    isValid = false;
  }

  return isValid;
}

function createTaskObject(taskId, title, description, priority, teacherId) {
  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);

  return {
    task_id: taskId,
    task_title: title,
    task_description: description,
    start_date: now,
    due_date: oneWeekLater,
    status: "pending",
    priority: priority,
    assigned_to: teacherId || "",
    comments: [],
    created_at: now,
    updated_at: now,
  };
}

function saveTask(task) {
  const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
  tasks.push(task);
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}

function resetForm() {
  document.querySelector("form").reset();

  generateTaskId();
}

function getTeacherIdByName(teacherName) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const teacher = users.find(
    (user) =>
      user.role === "teacher" &&
      user.name.toLowerCase() === teacherName.toLowerCase()
  );
  return teacher ? teacher.username : null;
}

function populateTeacherDropdown() {
  const teacherField = document.getElementById("teacher-name");

  if (teacherField && teacherField.tagName === "SELECT") {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const teachers = users.filter((user) => user.role === "teacher");

    teacherField.innerHTML = '<option value="">Select a teacher</option>';

    teachers.forEach((teacher) => {
      const option = document.createElement("option");
      option.value = teacher.username;
      option.textContent = teacher.name;
      teacherField.appendChild(option);
    });
  }
}

function convertTeacherFieldToDropdown() {
  const container = document.querySelector("form");
  const teacherLabel = document.querySelector('label[for="teacher-name"]');
  const teacherInput = document.getElementById("teacher-name");

  if (teacherInput && teacherLabel) {
    const teacherSelect = document.createElement("select");
    teacherSelect.id = "teacher-name";
    teacherSelect.name = "teacher-name";
    teacherSelect.required = true;

    container.replaceChild(teacherSelect, teacherInput);

    populateTeacherDropdown();
  }
}

function addTeacherAutocomplete() {
  const teacherInput = document.getElementById("teacher-name");

  if (teacherInput && teacherInput.tagName === "INPUT") {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const teachers = users.filter((user) => user.role === "teacher");

    const datalist = document.createElement("datalist");
    datalist.id = "teacher-list";

    teachers.forEach((teacher) => {
      const option = document.createElement("option");
      option.value = teacher.name;
      datalist.appendChild(option);
    });

    document.body.appendChild(datalist);

    teacherInput.setAttribute("list", "teacher-list");
  }
}

addTeacherAutocomplete();
