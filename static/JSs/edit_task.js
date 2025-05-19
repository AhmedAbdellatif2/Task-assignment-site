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
  try {
    const userRole = await getCurrentUserRole();
    if (!userRole) {
      window.location.href = "login.html";
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("id");

    const form = document.querySelector("form");
    const titleInput = document.getElementById("task-title");
    const descInput = document.getElementById("task-desc");

    await addAdditionalFields();

    if (taskId) {
      await loadTask(taskId);
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (validateForm()) {
        await saveTask();
      }
    });

    async function addAdditionalFields() {
      const formGroups = document.querySelectorAll(".form-group");
      const lastFormGroup = formGroups[formGroups.length - 1];

      const statusGroup = createFormGroup("Status", "select", "task-status");
      const statusSelect = statusGroup.querySelector("select");
      ["pending", "in_progress", "completed", "archived"].forEach((status) => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        statusSelect.appendChild(option);
      });
      form.insertBefore(statusGroup, lastFormGroup);

      const priorityGroup = createFormGroup("Priority", "select", "task-priority");
      const prioritySelect = priorityGroup.querySelector("select");
      ["low", "medium", "high"].forEach((priority) => {
        const option = document.createElement("option");
        option.value = priority;
        option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
        prioritySelect.appendChild(option);
      });
      form.insertBefore(priorityGroup, lastFormGroup);

      const startDateGroup = createFormGroup("Start Date", "date", "start-date");
      form.insertBefore(startDateGroup, lastFormGroup);

      const dueDateGroup = createFormGroup("Due Date", "date", "due-date");
      form.insertBefore(dueDateGroup, lastFormGroup);

      const assignedToGroup = createFormGroup("Assigned To", "select", "assigned-to");
      const assignedSelect = assignedToGroup.querySelector("select");
      assignedSelect.multiple = true;

      try {
        const teachers = await ApiService.getAllTeachers();
        teachers.forEach((teacher) => {
          const option = document.createElement("option");
          option.value = teacher.username;
          option.textContent = teacher.name;
          assignedSelect.appendChild(option);
        });
      } catch (error) {
        console.error('Error loading teachers:', error);
        showMessage('Failed to load teachers list', 'error');
      }

      form.insertBefore(assignedToGroup, lastFormGroup);
    }

    function createFormGroup(labelText, inputType, id) {
      const formGroup = document.createElement("div");
      formGroup.className = "form-group";

      const label = document.createElement("label");
      label.setAttribute("for", id);
      label.textContent = labelText;
      formGroup.appendChild(label);

      let input;
      if (inputType === "select") {
        input = document.createElement("select");
      } else if (inputType === "textarea") {
        input = document.createElement("textarea");
      } else {
        input = document.createElement("input");
        input.type = inputType;
      }

      input.id = id;
      input.name = id;

      if (inputType !== "select") {
        input.placeholder = `Enter ${labelText.toLowerCase()}`;
      }

      input.style.width = "95%";
      input.style.padding = "0.8rem";
      input.style.border = "none";
      input.style.borderRadius = "4px";
      input.style.fontSize = "1rem";
      input.style.backgroundColor = "var(--dark-gray)";
      input.style.color = "white";

      formGroup.appendChild(input);
      return formGroup;
    }

    function validateForm() {
      let isValid = true;

      if (titleInput.value.trim() === "") {
        showError(titleInput, "Task title is required");
        isValid = false;
      } else {
        removeError(titleInput);
      }

      if (descInput.value.trim() === "") {
        showError(descInput, "Task description is required");
        isValid = false;
      } else {
        removeError(descInput);
      }

      const startDate = document.getElementById("start-date");
      const dueDate = document.getElementById("due-date");

      if (startDate.value && dueDate.value) {
        if (new Date(startDate.value) > new Date(dueDate.value)) {
          showError(dueDate, "Due date cannot be before start date");
          isValid = false;
        } else {
          removeError(dueDate);
        }
      }

      return isValid;
    }

    function showError(input, message) {
      const formGroup = input.parentElement;
      let errorElement = formGroup.querySelector(".error-message");

      if (!errorElement) {
        errorElement = document.createElement("div");
        errorElement.className = "error-message";
        errorElement.style.color = "#f44336";
        errorElement.style.fontSize = "0.8rem";
        errorElement.style.marginTop = "5px";
        formGroup.appendChild(errorElement);
      }

      errorElement.textContent = message;
      input.style.borderColor = "#f44336";
    }

    function removeError(input) {
      const formGroup = input.parentElement;
      const errorElement = formGroup.querySelector(".error-message");

      if (errorElement) {
        formGroup.removeChild(errorElement);
      }

      input.style.borderColor = "";
    }

    async function loadTask(id) {
      try {
        showMessage("Loading task...", "info");
        const tasks = await ApiService.getAllTasks();
        const task = tasks.find((t) => t.task_id === id);

        if (!task) {
          showMessage("Task not found", "error");
          setTimeout(() => window.location.href = "AdminDashboard.html", 2000);
          return;
        }

        // Populate form fields
        titleInput.value = task.task_title;
        descInput.value = task.task_description;

        const fields = {
          "task-status": task.status,
          "task-priority": task.priority,
          "start-date": task.start_date ? new Date(task.start_date).toISOString().split("T")[0] : "",
          "due-date": task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
        };

        // Update all fields with error handling
        Object.entries(fields).forEach(([id, value]) => {
          const element = document.getElementById(id);
          if (element) {
            try {
              element.value = value;
            } catch (err) {
              console.error(`Error setting ${id}:`, err);
            }
          }
        });

        // Handle assigned teachers
        const assignedTo = document.getElementById("assigned-to");
        if (assignedTo && task.assigned_to) {
          const assignedTeachers = Array.isArray(task.assigned_to) 
            ? task.assigned_to 
            : [task.assigned_to];
          
          assignedTeachers.forEach(userId => {
            const option = assignedTo.querySelector(`option[value="${userId}"]`);
            if (option) option.selected = true;
          });
        }

      } catch (error) {
        console.error('Error loading task:', error);
        showMessage("Failed to load task. Please try again.", "error");
      }
    }

    async function saveTask() {
      try {
        showMessage("Saving task...", "info");
        
        const taskData = {
          task_id: urlParams.get("id") || generateUniqueId(),
          task_title: titleInput.value.trim(),
          task_description: descInput.value.trim(),
          status: document.getElementById("task-status").value,
          priority: document.getElementById("task-priority").value,
          start_date: document.getElementById("start-date").value,
          due_date: document.getElementById("due-date").value,
          assigned_to: Array.from(document.getElementById("assigned-to").selectedOptions).map(
            option => option.value
          ),
          updated_at: new Date().toISOString()
        };

        // If it's a new task, add creation timestamp
        if (!urlParams.get("id")) {
          taskData.created_at = taskData.updated_at;
          taskData.comments = [];
          await ApiService.createTask(taskData);
        } else {
          // For existing tasks, preserve comments and creation date
          const existingTasks = await ApiService.getAllTasks();
          const existingTask = existingTasks.find(t => t.task_id === taskData.task_id);
          if (existingTask) {
            taskData.comments = existingTask.comments || [];
            taskData.created_at = existingTask.created_at;
          }
          await ApiService.updateTask(taskData.task_id, taskData);
        }

        showMessage("Task saved successfully", "success");
        setTimeout(() => {
          window.location.href = "AdminDashboard.html";
        }, 1500);
      } catch (error) {
        console.error('Error saving task:', error);
        showMessage("Failed to save task. Please check your connection and try again.", "error");
      }
    }

    function generateUniqueId() {
      return 'task_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    }

    function showMessage(message, type) {
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${type}`;
      messageDiv.textContent = message;
      messageDiv.style.position = "fixed";
      messageDiv.style.top = "20px";
      messageDiv.style.right = "20px";
      messageDiv.style.padding = "10px 20px";
      messageDiv.style.borderRadius = "4px";
      messageDiv.style.backgroundColor = type === "success" ? "#4caf50" : "#f44336";
      messageDiv.style.color = "white";
      messageDiv.style.zIndex = "1000";

      document.body.appendChild(messageDiv);

      setTimeout(() => {
        messageDiv.remove();
      }, 3000);
    }

    initializeNavbar();
  } catch (error) {
    console.error('Error initializing edit task page:', error);
    showMessage("Failed to initialize page", "error");
  }
});

function initializeNavbar() {
  const homeBtn = document.getElementById("home");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  const notificationBtn = document.getElementById("notification");
  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
      alert("Notification panel functionality to be implemented");
    });
  }

  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          console.log("Searching for:", searchTerm);
          window.location.href = `SearchPage.html?q=${encodeURIComponent(
            searchTerm
          )}`;
        }
      }
    });
  }

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  if (currentUser.role !== "admin") {
    window.location.href = "index.html";
    alert("Access denied. Admin privileges required.");
  }
}
