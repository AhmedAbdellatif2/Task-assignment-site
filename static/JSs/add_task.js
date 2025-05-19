import apiService from './ApiService.js';

class AddTaskManager {
    constructor() {
        this.form = document.getElementById('add-task-form');
        this.setupFormFields();
        this.setupEventListeners();
        this.loadTeachers();
    }

    async loadTeachers() {
        try {
            const teacherSelect = document.getElementById('assigned-to');
            if (!teacherSelect) return;

            const teachers = await apiService.request('/users?role=teacher', { method: 'GET' });
            
            teacherSelect.innerHTML = '<option value="">Select a teacher</option>';
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = teacher.name;
                teacherSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading teachers:', error);
            this.showError('Failed to load teachers list');
        }
    }

    setupFormFields() {
        const formGroups = [
            { label: 'Title', type: 'text', id: 'title', required: true },
            { label: 'Description', type: 'textarea', id: 'description', required: true },
            { 
                label: 'Status', 
                type: 'select', 
                id: 'status',
                options: ['pending', 'in_progress', 'completed', 'archived'],
                required: true 
            },
            { 
                label: 'Priority', 
                type: 'select', 
                id: 'priority',
                options: ['low', 'medium', 'high'],
                required: true 
            },
            { label: 'Start Date', type: 'date', id: 'start_date', required: true },
            { label: 'Due Date', type: 'date', id: 'due_date', required: true },
            { 
                label: 'Assigned To', 
                type: 'select', 
                id: 'assigned_to',
                required: true 
            }
        ];

        const container = document.createElement('div');
        container.className = 'form-container';

        formGroups.forEach(field => {
            const group = this.createFormGroup(field);
            container.appendChild(group);
        });

        this.form.appendChild(container);
    }

    createFormGroup({ label, type, id, options, required }) {
        const group = document.createElement('div');
        group.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', id);
        labelEl.textContent = label;
        group.appendChild(labelEl);

        let input;
        if (type === 'textarea') {
            input = document.createElement('textarea');
        } else if (type === 'select') {
            input = document.createElement('select');
            if (options) {
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    input.appendChild(option);
                });
            }
        } else {
            input = document.createElement('input');
            input.type = type;
        }

        input.id = id;
        input.name = id;
        if (required) input.required = true;
        
        group.appendChild(input);
        return group;
    }

    setupEventListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(e);
        });

        // Add date validation
        const startDate = document.getElementById('start_date');
        const dueDate = document.getElementById('due_date');
        
        if (startDate && dueDate) {
            startDate.addEventListener('change', () => this.validateDates());
            dueDate.addEventListener('change', () => this.validateDates());
        }
    }

    validateDates() {
        const startDate = new Date(document.getElementById('start_date').value);
        const dueDate = new Date(document.getElementById('due_date').value);
        
        if (startDate > dueDate) {
            this.showError('Due date cannot be before start date');
            document.getElementById('due_date').value = '';
            return false;
        }
        return true;
    }

    async handleSubmit(event) {
        const formData = new FormData(event.target);
        
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            startDate: formData.get('start_date'),
            dueDate: formData.get('due_date'),
            assignedTo: formData.get('assigned_to')
        };

        try {
            await this.validateTaskData(taskData);
            await apiService.createTask(taskData);
            this.showSuccess('Task created successfully');
            window.location.href = './task_list.html';
        } catch (error) {
            console.error('Error creating task:', error);
            this.showError(error.message || 'Failed to create task');
        }
    }

    async validateTaskData(taskData) {
        const errors = [];

        if (!taskData.title?.trim()) {
            errors.push('Title is required');
        }

        if (!taskData.description?.trim()) {
            errors.push('Description is required');
        }

        if (!taskData.startDate) {
            errors.push('Start date is required');
        }

        if (!taskData.dueDate) {
            errors.push('Due date is required');
        }

        if (!taskData.priority) {
            errors.push('Priority is required');
        }

        if (!taskData.assignedTo) {
            errors.push('Assigned to is required');
        }

        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        // Validate dates
        if (!this.validateDates()) {
            throw new Error('Invalid date range');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#f44336';
        errorDiv.style.padding = '10px';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.backgroundColor = '#ffebee';
        errorDiv.style.borderRadius = '4px';

        const existingError = this.form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        this.form.insertBefore(errorDiv, this.form.firstChild);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.color = '#4caf50';
        successDiv.style.padding = '10px';
        successDiv.style.marginTop = '10px';
        successDiv.style.backgroundColor = '#e8f5e9';
        successDiv.style.borderRadius = '4px';

        this.form.insertBefore(successDiv, this.form.firstChild);
        setTimeout(() => successDiv.remove(), 3000);
    }
}

// Check user authentication and role
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const currentUser = await apiService.getCurrentUser();
        if (currentUser.role !== 'admin') {
            window.location.href = 'login.html';
            throw new Error('Unauthorized access');
        }
        new AddTaskManager();
    } catch (error) {
        console.error('Authentication error:', error);
        window.location.href = 'login.html';
    }
});
