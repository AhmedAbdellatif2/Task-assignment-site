import apiService from './ApiService.js';

class EditTaskManager {
    constructor() {
        this.taskId = new URLSearchParams(window.location.search).get('id');
        this.form = document.querySelector("form");
        this.init();
    }

    async init() {
        try {
            const currentUser = await apiService.getCurrentUser();
            if (!currentUser || currentUser.role !== "admin") {
                alert("Unauthorized access. Redirecting to login...");
                window.location.href = "login.html";
                return;
            }

            await this.setupForm();
            this.setupEventListeners();
            if (this.taskId) {
                await this.loadTask();
            }
        } catch (error) {
            console.error('Error initializing edit task:', error);
            this.showError('Failed to initialize. Please try again later.');
        }
    }

    async setupForm() {
        this.addFormFields();
        await this.loadUsers();
    }

    async loadUsers() {
        try {
            const users = await apiService.getAllUsers();
            const assignedSelect = document.getElementById('assigned-to');
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.role})`;
                assignedSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users list');
        }
    }

    addFormFields() {
        const formGroups = document.querySelectorAll(".form-group");
        const lastFormGroup = formGroups[formGroups.length - 1];

        // Add status field
        const statusGroup = this.createFormGroup("Status", "select", "task-status");
        const statusSelect = statusGroup.querySelector("select");
        ["pending", "in_progress", "completed", "archived"].forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
            statusSelect.appendChild(option);
        });
        this.form.insertBefore(statusGroup, lastFormGroup);

        // Add priority field
        const priorityGroup = this.createFormGroup("Priority", "select", "task-priority");
        const prioritySelect = priorityGroup.querySelector("select");
        ["low", "medium", "high"].forEach(priority => {
            const option = document.createElement("option");
            option.value = priority;
            option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
            prioritySelect.appendChild(option);
        });
        this.form.insertBefore(priorityGroup, lastFormGroup);

        // Add date fields
        const startDateGroup = this.createFormGroup("Start Date", "date", "start-date");
        this.form.insertBefore(startDateGroup, lastFormGroup);

        const dueDateGroup = this.createFormGroup("Due Date", "date", "due-date");
        this.form.insertBefore(dueDateGroup, lastFormGroup);

        // Add assigned to field
        const assignedToGroup = this.createFormGroup("Assigned To", "select", "assigned-to");
        const assignedSelect = assignedToGroup.querySelector("select");
        assignedSelect.multiple = true;
        this.form.insertBefore(assignedToGroup, lastFormGroup);
    }

    createFormGroup(labelText, inputType, id) {
        const div = document.createElement("div");
        div.className = "form-group";

        const label = document.createElement("label");
        label.htmlFor = id;
        label.textContent = labelText;

        const input = document.createElement(inputType === "select" ? "select" : "input");
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
            console.error('Error loading task:', error);
            this.showError('Failed to load task details');
        }
    }

    populateForm(task) {
        const fields = {
            'task-title': task.title,
            'task-desc': task.description,
            'start-date': task.startDate,
            'due-date': task.dueDate,
            'task-priority': task.priority,
            'task-status': task.status,
            'assigned-to': task.assignedTo
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.multiple && Array.isArray(value)) {
                    // Handle multiple select
                    Array.from(element.options).forEach(option => {
                        option.selected = value.includes(option.value);
                    });
                } else {
                    element.value = value;
                }
            }
        });
    }

    setupEventListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (await this.validateForm()) {
                await this.handleSubmit(e);
            }
        });

        // Add input validation listeners
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    async handleSubmit(event) {
        try {
            const formData = new FormData(event.target);
            const taskData = {
                title: formData.get('task-title'),
                description: formData.get('task-desc'),
                startDate: formData.get('start-date'),
                dueDate: formData.get('due-date'),
                priority: formData.get('task-priority'),
                status: formData.get('task-status'),
                assignedTo: Array.from(event.target['assigned-to'].selectedOptions).map(opt => opt.value)
            };

            if (this.taskId) {
                await apiService.updateTask(this.taskId, taskData);
                this.showSuccess('Task updated successfully');
            } else {
                await apiService.createTask(taskData);
                this.showSuccess('Task created successfully');
            }
            
            setTimeout(() => {
                window.location.href = 'task_list.html';
            }, 1500);
        } catch (error) {
            console.error('Error saving task:', error);
            this.showError(error.message || 'Failed to save task');
        }
    }

    async validateForm() {
        const inputs = this.form.querySelectorAll('input, select');
        let isValid = true;

        for (const input of inputs) {
            if (!await this.validateField(input)) {
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
            this.showFieldError(input, `${input.previousElementSibling.textContent} is required`);
            return false;
        }

        if (id === 'due-date' && value) {
            const dueDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                this.showFieldError(input, 'Due date cannot be in the past');
                return false;
            }
        }

        if (id === 'start-date' && value) {
            const startDate = new Date(value);
            const dueDate = new Date(document.getElementById('due-date').value);
            
            if (startDate > dueDate) {
                this.showFieldError(input, 'Start date cannot be after due date');
                return false;
            }
        }

        return true;
    }

    showFieldError(input, message) {
        this.removeError(input);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#f44336';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '4px';
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = '#f44336';
    }

    removeError(input) {
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
            input.style.borderColor = '';
        }
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EditTaskManager();
});
