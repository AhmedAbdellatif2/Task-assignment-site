function getCurrentUserRole() {
  return JSON.parse(sessionStorage.getItem("currentUser"))?.role || null;
}

const userRole = getCurrentUserRole();

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get("id");

  const form = document.querySelector("form");
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");

  addAdditionalFields();

  if (taskId) {
    loadTaskFromLocalStorage(taskId);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateForm()) {
      saveTaskToLocalStorage();
    }
  });

  function addAdditionalFields() {
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

    const priorityGroup = createFormGroup(
      "Priority",
      "select",
      "task-priority"
    );
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

    const assignedToGroup = createFormGroup(
      "Assigned To",
      "select",
      "assigned-to"
    );
    const assignedSelect = assignedToGroup.querySelector("select");
    assignedSelect.multiple = true;

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.user_id;
      option.textContent = `${user.name} (${user.role})`;
      assignedSelect.appendChild(option);
    });

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

  function loadTaskFromLocalStorage(id) {
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
    const task = tasks.find((t) => t.task_id === id);

    if (task) {
      titleInput.value = task.task_title;
      descInput.value = task.task_description;

      const statusSelect = document.getElementById("task-status");
      if (statusSelect) statusSelect.value = task.status;

      const prioritySelect = document.getElementById("task-priority");
      if (prioritySelect) prioritySelect.value = task.priority;

      const startDate = document.getElementById("start-date");
      if (startDate)
        startDate.value = new Date(task.start_date).toISOString().split("T")[0];

      const dueDate = document.getElementById("due-date");
      if (dueDate)
        dueDate.value = new Date(task.due_date).toISOString().split("T")[0];

      const assignedTo = document.getElementById("assigned-to");
      if (assignedTo) {
        const assignedUsers = Array.isArray(task.assigned_to)
          ? task.assigned_to
          : [task.assigned_to];

        Array.from(assignedTo.options).forEach((option) => {
          option.selected = assignedUsers.includes(option.value);
        });
      }
    } else {
      showMessage("Task not found", "error");
      console.error("Task not found in localStorage");
      setTimeout(() => {
        window.location.href = "AdminDashboard.html";
      }, 2000);
    }
  }

  function saveTaskToLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const status = document.getElementById("task-status")?.value || "pending";
    const priority =
      document.getElementById("task-priority")?.value || "medium";
    const startDateValue = document.getElementById("start-date")?.value;
    const dueDateValue = document.getElementById("due-date")?.value;

    const assignedSelect = document.getElementById("assigned-to");
    const assignedUsers = assignedSelect
      ? Array.from(assignedSelect.selectedOptions).map((option) => option.value)
      : [];

    const now = new Date();

    if (taskId) {
      const taskIndex = tasks.findIndex((t) => t.task_id === taskId);

      if (taskIndex !== -1) {
        const task = tasks[taskIndex];

        task.task_title = title;
        task.task_description = description;
        task.status = status;
        task.priority = priority;
        task.start_date = startDateValue
          ? new Date(startDateValue)
          : task.start_date;
        task.due_date = dueDateValue ? new Date(dueDateValue) : task.due_date;
        task.assigned_to =
          assignedUsers.length > 1 ? assignedUsers : assignedUsers[0] || "";
        task.updated_at = now;

        tasks[taskIndex] = task;
      }
    } else {
      const newTask = {
        task_id: generateUniqueId(),
        task_title: title,
        task_description: description,
        start_date: startDateValue ? new Date(startDateValue) : now,
        due_date: dueDateValue
          ? new Date(dueDateValue)
          : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: status,
        priority: priority,
        assigned_to:
          assignedUsers.length > 1 ? assignedUsers : assignedUsers[0] || "",
        comments: [],
        created_at: now,
        updated_at: now,
      };

      tasks.push(newTask);
    }

    localStorage.setItem("Tasks", JSON.stringify(tasks));

    showMessage("Task saved successfully!", "success");

    setTimeout(() => {
      window.location.href = "AdminDashboard.html";
    }, 1500);
  }

  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function showMessage(message, type) {
    const msgElement = document.createElement("div");
    msgElement.className = `message ${type}-message`;
    msgElement.style.padding = "10px";
    msgElement.style.borderRadius = "4px";
    msgElement.style.marginTop = "10px";
    msgElement.style.textAlign = "center";
    msgElement.style.color = "white";

    if (type === "success") {
      msgElement.style.backgroundColor = "var(--accent-green)";
    } else {
      msgElement.style.backgroundColor = "#f44336";
    }

    msgElement.textContent = message;

    form.appendChild(msgElement);
  }

  initializeNavbar();
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
