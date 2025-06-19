import apiService from "./ApiService.js";

class EditTaskManager {
  constructor() {
    // Get the task_id from the URL query parameter 'task_id' (not 'id')
    const params = new URLSearchParams(window.location.search);
    this.taskId = params.get("task_id");
    this.form = document.querySelector("form");
    this.init();
  }

  async init() {
    try {
      const currentUser = await apiService.getCurrentUser();
      if (!currentUser || currentUser.role !== "admin") {
        await apiService.logout();
        window.location.href = "/login";
        return;
      }
      await this.setupForm();
      this.setupEventListeners();
      if (this.taskId) {
        await this.loadTask();
      }
    } catch (error) {
      console.error("Error initializing edit task:", error);
      this.showError("Failed to initialize. Please try again later.");
    }
  }

  async setupForm() {
    this.addFormFields();
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      // Use getUsers and extract teachers/admins
      const users = await apiService.getUsers();
      const teachers = users.teachers || [];
      const admins = users.admins || [];
      const assignedSelect = document.getElementById("assigned-to");
      teachers.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.name} (Teacher)`;
        assignedSelect.appendChild(option);
      });
      admins.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.name} (Admin)`;
        assignedSelect.appendChild(option);
      });
      assignedSelect.multiple = false; // Ensure single select
    } catch (error) {
      console.error("Error loading users:", error);
      this.showError("Failed to load users list");
    }
  }

  addFormFields() {
    // Remove any default action attribute from the form to prevent native POST
    this.form.removeAttribute("action");

    const formGroups = document.querySelectorAll(".form-group");
    const lastFormGroup = formGroups[formGroups.length - 1];

    // Add status field
    const statusGroup = this.createFormGroup("Status", "select", "task-status");
    const statusSelect = statusGroup.querySelector("select");
    ["pending", "in_progress", "completed", "archived"].forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      statusSelect.appendChild(option);
    });
    this.form.insertBefore(statusGroup, lastFormGroup);

    // Add priority field
    const priorityGroup = this.createFormGroup(
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
    this.form.insertBefore(priorityGroup, lastFormGroup);

    // Add date fields
    const startDateGroup = this.createFormGroup(
      "Start Date",
      "date",
      "start-date"
    );
    this.form.insertBefore(startDateGroup, lastFormGroup);

    const dueDateGroup = this.createFormGroup("Due Date", "date", "due-date");
    this.form.insertBefore(dueDateGroup, lastFormGroup);

    // Add assigned to field
    const assignedToGroup = this.createFormGroup(
      "Assigned To",
      "select",
      "assigned-to"
    );
    const assignedSelect = assignedToGroup.querySelector("select");
    assignedSelect.multiple = false; // Single select only
    this.form.insertBefore(assignedToGroup, lastFormGroup);
  }

  createFormGroup(labelText, inputType, id) {
    const div = document.createElement("div");
    div.className = "form-group";

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;

    const input = document.createElement(
      inputType === "select" ? "select" : "input"
    );
    input.id = id;
    input.name = id;
    if (inputType !== "select") {
      input.type = inputType;
    }

    div.appendChild(label);
    div.appendChild(input);

    return div;
  }

  async loadTask() {
    try {
      const task = await apiService.getTaskById(this.taskId);
      this.populateForm(task);
    } catch (error) {
      console.error("Error loading task:", error);
      this.showError("Failed to load task details");
    }
  }

  populateForm(task) {
    // Format date fields as yyyy-MM-dd for input[type=date]
    function formatDate(dateValue) {
      if (!dateValue) return "";
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "";
      // Pad month and day
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    const fields = {
      "task-title": task.title || task.task_title,
      "task-desc": task.description || task.task_description,
      "start-date": formatDate(task.startDate || task.start_date),
      "due-date": formatDate(task.dueDate || task.due_date),
      "task-priority": task.priority,
      "task-status": task.status,
      "assigned-to": task.assignedTo || task.assigned_to, // Should be a single value
    };
    Object.entries(fields).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    });
  }

  setupEventListeners() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (await this.validateForm()) {
        await this.handleSubmit(e);
      }
    });
    // Add input validation listeners
    const inputs = this.form.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
    });
  }

  async handleSubmit(event) {
    try {
      const formData = new FormData(event.target);
      const taskData = {
        task_title: formData.get("task-title"),
        task_description: formData.get("task-desc"),
        start_date: formData.get("start-date"),
        due_date: formData.get("due-date"),
        priority: formData.get("task-priority"),
        status: formData.get("task-status"),
        assigned_to: formData.get("assigned-to"), // Single value
      };
      if (this.taskId) {
        const response = await apiService.updateTask(this.taskId, taskData);
        if (!response.success) {
          throw new Error(response.error || "Task update failed");
        }
        this.showSuccess("Task updated successfully!");
        setTimeout(() => {
          window.location.href = "/Admindashboard/";
        }, 1500);
      } else {
        const response = await apiService.createTask(taskData);
        if (!response.success) {
          throw new Error(response.error || "Task creation failed");
        }
        this.showSuccess("Task created successfully!");
        setTimeout(() => {
          window.location.href = "/Admindashboard/";
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      this.showError(error.message || "Failed to save task");
    }
  }

  async validateForm() {
    const inputs = this.form.querySelectorAll("input, select");
    let isValid = true;
    for (const input of inputs) {
      if (!(await this.validateField(input))) {
        isValid = false;
      }
    }
    return isValid;
  }

  async validateField(input) {
    const value = input.value.trim();
    const id = input.id;
    this.removeError(input);
    if (!value && input.required) {
      this.showFieldError(
        input,
        `${input.previousElementSibling.textContent} is required`
      );
      return false;
    }
    if (id === "due-date" && value) {
      const dueDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        this.showFieldError(input, "Due date cannot be in the past");
        return false;
      }
    }
    if (id === "start-date" && value) {
      const startDate = new Date(value);
      const dueDate = new Date(document.getElementById("due-date").value);
      if (startDate > dueDate) {
        this.showFieldError(input, "Start date cannot be after due date");
        return false;
      }
    }
    return true;
  }

  showFieldError(input, message) {
    this.removeError(input);
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    errorDiv.style.color = "#f44336";
    errorDiv.style.fontSize = "0.8rem";
    errorDiv.style.marginTop = "4px";
    input.parentNode.appendChild(errorDiv);
    input.style.borderColor = "#f44336";
  }

  removeError(input) {
    const existingError = input.parentNode.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
      input.style.borderColor = "";
    }
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.color = "#f44336";
    errorDiv.style.padding = "10px";
    errorDiv.style.marginTop = "10px";
    errorDiv.style.backgroundColor = "#ffebee";
    errorDiv.style.borderRadius = "4px";

    const existingError = this.form.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    this.form.insertBefore(errorDiv, this.form.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent = message;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4caf50;
      color: white;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
    `;
    document.body.appendChild(successDiv);
    setTimeout(() => {
      successDiv.style.opacity = "0";
      successDiv.style.transition = "opacity 0.3s ease";
      setTimeout(() => successDiv.remove(), 300);
    }, 1200);
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EditTaskManager();
});
