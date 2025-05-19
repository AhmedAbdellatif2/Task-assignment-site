import apiService from './ApiService.js';

class TeacherTaskManager {
	constructor() {
		this.taskId = new URLSearchParams(window.location.search).get('task_id');
		this.setupEventListeners();
		this.loadTask();
	}

	async loadTask() {
		try {
			const task = await apiService.getTaskById(this.taskId);
			this.displayTask(task);
			await this.loadComments();
		} catch (error) {
			console.error('Error loading task:', error);
			this.showError('Failed to load task details');
		}
	}

	displayTask(task) {
		document.getElementById('task-title').textContent = task.title;
		document.getElementById('task-description').textContent = task.description;
		document.getElementById('task-status').textContent = task.status;
		document.getElementById('task-due-date').textContent = task.dueDate;
		
		// Update status buttons
		const statusButtons = document.querySelectorAll('.status-btn');
		statusButtons.forEach(btn => {
			btn.classList.remove('active');
			if (btn.dataset.status === task.status) {
				btn.classList.add('active');
			}
		});
	}

	async loadComments() {
		try {
			const comments = await apiService.getTaskComments(this.taskId);
			this.displayComments(comments);
		} catch (error) {
			console.error('Error loading comments:', error);
			this.showError('Failed to load comments');
		}
	}

	displayComments(comments) {
		const commentsList = document.getElementById('comments-list');
		commentsList.innerHTML = '';

		comments.forEach(comment => {
			const commentElement = document.createElement('div');
			commentElement.className = 'comment';
			commentElement.innerHTML = `
				<p class="comment-author">${comment.author}</p>
				<p class="comment-text">${comment.text}</p>
				<p class="comment-date">${new Date(comment.date).toLocaleString()}</p>
			`;
			commentsList.appendChild(commentElement);
		});
	}

	async updateTaskStatus(newStatus) {
		try {
			await apiService.updateTask(this.taskId, { status: newStatus });
			await this.loadTask(); // Refresh the task display
			this.showSuccess('Task status updated successfully');
		} catch (error) {
			console.error('Error updating task status:', error);
			this.showError('Failed to update task status');
		}
	}

	async addComment(commentText) {
		try {
			await apiService.addTaskComment(this.taskId, { text: commentText });
			await this.loadComments(); // Refresh comments
			this.showSuccess('Comment added successfully');
		} catch (error) {
			console.error('Error adding comment:', error);
			this.showError('Failed to add comment');
		}
	}

	setupEventListeners() {
		// Status buttons
		document.querySelectorAll('.status-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				this.updateTaskStatus(btn.dataset.status);
			});
		});

		// Comment form
		const commentForm = document.getElementById('comment-form');
		commentForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const commentText = document.getElementById('comment-input').value.trim();
			if (commentText) {
				this.addComment(commentText);
				document.getElementById('comment-input').value = '';
			}
		});
	}

	showError(message) {
		// Implement error notification
		alert(message);
	}

	showSuccess(message) {
		// Implement success notification
		alert(message);
	}
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new TeacherTaskManager();
});
