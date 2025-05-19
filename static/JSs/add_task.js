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

document.addEventListener("DOMContentLoaded", async function () {
  await checkAdminAccess();
  const taskForm = document.querySelector("form");
  taskForm.addEventListener("submit", handleFormSubmit);
  await populateTeacherDropdown();
  generateTaskId();
});

async function checkAdminAccess() {
  try {
    const currentUser = await ApiService.getCurrentUser();
    if (currentUser.role !== "admin") {
      alert("Unauthorized access. Redirecting to login...");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error('Error checking admin access:', error);
    window.location.href = "login.html";
  }
}

function generateTaskId() {
  const taskIdField = document.getElementById("task-id");
  if (taskIdField) {
    const uniqueId = "task_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    taskIdField.value = uniqueId;
    taskIdField.setAttribute("readonly", true);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const taskId = document.getElementById("task-id").value;
  const taskTitle = document.getElementById("task-title").value;
  const teacherName = document.getElementById("teacher-name").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value;

  if (!validateForm(taskTitle, teacherName, description)) {
    return;
  }

  try {
    const newTask = createTaskObject(taskId, taskTitle, description, priority, teacherName);
    await ApiService.createTask(newTask);
    resetForm();
    window.location.href = "AdminDashboard.html";
  } catch (error) {
    console.error('Error creating task:', error);
    alert('Failed to create task. Please try again.');
  }
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
    start_date: now.toISOString(),
    due_date: oneWeekLater.toISOString(),
    status: "pending",
    priority: priority,
    assigned_to: teacherId || "",
    comments: [],
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

function resetForm() {
  document.querySelector("form").reset();
  generateTaskId();
}

async function populateTeacherDropdown() {
  const teacherField = document.getElementById("teacher-name");

  if (teacherField && teacherField.tagName === "SELECT") {
    try {
      const teachers = await ApiService.getAllTeachers();

      teacherField.innerHTML = '<option value="">Select a teacher</option>';

      teachers.forEach((teacher) => {
        const option = document.createElement("option");
        option.value = teacher.username;
        option.textContent = teacher.name;
        teacherField.appendChild(option);
      });
    } catch (error) {
      console.error('Error populating teacher dropdown:', error);
      alert('Failed to load teachers. Please refresh the page.');
    }
  }
}

async function addTeacherAutocomplete() {
  const teacherInput = document.getElementById("teacher-name");

  if (teacherInput && teacherInput.tagName === "INPUT") {
    try {
      const teachers = await ApiService.getAllTeachers();

      const datalist = document.createElement("datalist");
      datalist.id = "teacher-list";

      teachers.forEach((teacher) => {
        const option = document.createElement("option");
        option.value = teacher.name;
        datalist.appendChild(option);
      });

      document.body.appendChild(datalist);
      teacherInput.setAttribute("list", "teacher-list");
    } catch (error) {
      console.error('Error setting up teacher autocomplete:', error);
    }
  }
}

addTeacherAutocomplete();
