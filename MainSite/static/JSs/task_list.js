import apiService from './ApiService.js';

class TaskListManager {
    constructor() {
        this.init();
    }

    async init() {
        try {
            const currentUser = await apiService.getCurrentUser();
            if (!currentUser) {
                window.location.href = "login.html";
                return;
            }

            if (currentUser.role === "admin") {
                window.location.href = "AdminDashboard.html";
                return;
            }

            await this.displayTasks();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing task list:', error);
            this.showError('Failed to initialize. Please try again later.');
        }
    }

    async displayTasks() {
        try {
            const tasks = await apiService.getAllTasks();
            const taskList = document.getElementById("task-list");
            taskList.innerHTML = "";

            tasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            this.showError('Failed to load tasks. Please try again later.');
        }
    }

    createTaskElement(task) {
        const div = document.createElement("div");
        div.className = "task";
        div.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>Due Date: ${task.dueDate}</p>
            <p>Status: ${task.status}</p>
            <div class="task-actions">
                <button data-task-id="${task.id}" class="edit-task">Edit</button>
                <button data-task-id="${task.id}" class="delete-task">Delete</button>
            </div>
        `;
        return div;
    }

    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            if (e.target.matches('.delete-task')) {
                const taskId = e.target.dataset.taskId;
                await this.deleteTask(taskId);
            } else if (e.target.matches('.edit-task')) {
                const taskId = e.target.dataset.taskId;
                window.location.href = `edit_task.html?id=${taskId}`;
            }
        });
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await apiService.deleteTask(taskId);
            await this.displayTasks(); // Refresh the task list
            this.showSuccess('Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showError('Failed to delete task. Please try again later.');
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
    new TaskListManager();
});
