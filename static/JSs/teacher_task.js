import ApiService from "./ApiService.js";

let currentTask = null;
let currentUser = null;
const searchParams = new URLSearchParams(document.location.search);
const taskId = searchParams.get("task_id");

document.addEventListener("DOMContentLoaded", async () => {
	try {
		// Check authentication
		currentUser = await ApiService.getCurrentUser();
		if (!currentUser) {
			window.location.href = "login.html";
			return;
		}

		// Show loading state
		showLoading();

		// Load task data
		await loadTaskData();
		
		if (currentTask) {
			// Initialize chat functionality
			initializeChat();
			// Initialize comment functionality
			initializeComments();
			// Initialize task status handling
			initializeTaskStatus();
		}

		hideLoading();
	} catch (error) {
		console.error('Error initializing page:', error);
		showError('Failed to load task. Please try again.');
		hideLoading();
	}
});

async function loadTaskData() {
	try {
		// Use getTaskById instead of getAllTasks for efficiency
		currentTask = await ApiService.getTaskById(taskId);

		if (!currentTask) {
			showError('Task not found');
			setTimeout(() => window.location.href = "index.html", 2000);
			return;
		}

		updateTaskDisplay();
	} catch (error) {
		if (error.status === 404) {
			showError('Task not found');
			setTimeout(() => window.location.href = "index.html", 2000);
		} else {
			console.error('Error loading task:', error);
			showError('Failed to load task data');
		}
	}
}

function updateTaskDisplay() {
	const elements = {
		'.taskCreateDate': formatDate(currentTask.created_at),
		'.taskUpdateDate': formatDate(currentTask.updated_at),
		'.taskTitle h1': currentTask.task_title,
		'.taskStartDate': formatDate(currentTask.start_date),
		'.taskDueDate': formatDate(currentTask.due_date),
		'.taskStatus': currentTask.status,
		'.taskPriority': currentTask.priority,
		'.content': currentTask.task_description
	};

	Object.entries(elements).forEach(([selector, value]) => {
		const element = document.querySelector(selector);
		if (element) {
			if (selector === '.content') {
				element.children[0].innerHTML = value;
			} else {
				element.innerHTML = value;
			}
		}
	});
}

async function removeComment(commentId) {
	try {
		showMessage('Removing comment...', 'info');
		
		// Use dedicated comment deletion endpoint
		await ApiService.deleteComment(currentTask.task_id, commentId);
		
		// Refresh task data
		await loadTaskData();
		
		showMessage('Comment removed successfully', 'success');
	} catch (error) {
		console.error('Error removing comment:', error);
		showMessage('Failed to remove comment', 'error');
	}
}

function showLoading() {
	const loadingDiv = document.createElement('div');
	loadingDiv.id = 'loading-indicator';
	loadingDiv.innerHTML = 'Loading task data...';
	loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 1000;';
	document.body.appendChild(loadingDiv);
}

function hideLoading() {
	const loadingDiv = document.getElementById('loading-indicator');
	if (loadingDiv) {
		loadingDiv.remove();
	}
}

function showError(message) {
	const errorDiv = document.createElement('div');
	errorDiv.className = 'error-message';
	errorDiv.textContent = message;
	errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 10px 20px; border-radius: 4px; z-index: 1000;';
	document.body.appendChild(errorDiv);
	setTimeout(() => errorDiv.remove(), 5000);
}

function showMessage(message, type) {
	const messageDiv = document.createElement('div');
	messageDiv.className = `message ${type}`;
	messageDiv.textContent = message;
	messageDiv.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		padding: 10px 20px;
		border-radius: 4px;
		color: white;
		z-index: 1000;
		background-color: ${type === 'success' ? '#4caf50' : type === 'info' ? '#2196f3' : '#f44336'};
	`;
	document.body.appendChild(messageDiv);
	setTimeout(() => messageDiv.remove(), 3000);
}

function calculateNumberOfDaysFrom(dueDate) {
	return (new Date(dueDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000);
}

function formatDate(date) {
	if (!date) return 'Not set';
	
	const d = new Date(date);
	const currentDate = d.toDateString();
	const hours = ((d.getHours() + 24) % 12 || 12);
	const currentHour = hours < 10 ? `0${hours}` : hours;
	const currentMinutes = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
	const ampm = d.getHours() >= 12 ? 'PM' : 'AM';

	return `${currentDate} - ${currentHour}:${currentMinutes} ${ampm}`;
}

// Make removeComment available globally
window.removeComment = removeComment;

let API_KEY =
	"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";
document.addEventListener("DOMContentLoaded", async () => {
	let messages = [
		{
			role: "system",
			content: `You are a helpful assistant helping in a task its description is '${currentTask.description}'.`,
		},
		{
			role: "assistant",
			content: "Hello, how can I help you?",
		},
	];
	let chat_toggle = document.getElementsByClassName("chat_toggle")[0];
	let chat_exit = document.getElementsByClassName("chat_exit")[0];
	let chat_bot = document.getElementsByClassName("chat_bot")[0];
	chat_toggle.addEventListener("click", function () {
		chat_toggle.classList.add("active");
		setTimeout(() => {
			chat_bot.classList.add("visible");
		}, 300);
	});

	chat_exit.addEventListener("click", () => {
		chat_bot.classList.remove("visible");

		setTimeout(() => {
			chat_toggle.classList.remove("active");
		}, 300);
	});

	let chat_input = document.getElementById("chatbot_input");
	let chat_send = document.getElementById("chat_send");
	let chat_body = document.getElementsByClassName("chatbot-messages")[0];

	chat_send.addEventListener("click", async () => {
		let message = chat_input.value;
		if (message.trim() === "") return;

		chat_input.value = "";
		chat_body.innerHTML += `<div class="message user-message">${message}</div>`;
		chat_body.scrollTop = chat_body.scrollHeight;

		const messageId = `streaming-message-${Date.now()}`;
		chat_body.innerHTML += `<div class="message bot-message" id="${messageId}">
									<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>
								</div>`;
		chat_body.scrollTop = chat_body.scrollHeight;

		messages.push({ role: "user", content: message });

		const resp = await fetch(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${API_KEY}`,
				},
				body: JSON.stringify({
					model: "thudm/glm-4-32b:free",
					messages: messages,
					stream: true,
				}),
			}
		);

		const reader = resp.body.getReader();
		const decoder = new TextDecoder("utf-8");
		let message_out = "";
		let done = false;

		while (!done) {
			const { value, done: reader_done } = await reader.read();
			done = reader_done;
			const chunk = decoder.decode(value, { stream: true });

			for (let line of chunk.split("\n")) {
				if (line.startsWith("data: ")) {
					const jsonStr = line.slice("data: ".length).trim();
					if (jsonStr === "[DONE]") continue;

					try {
						const json = JSON.parse(jsonStr);
						const token = json.choices?.[0]?.delta?.content || "";
						message_out += token;

						const messageDiv = document.getElementById(messageId);
						if (messageDiv) {
							messageDiv.textContent = message_out;
							chat_body.scrollTop = chat_body.scrollHeight;
						}
					} catch (e) {
						console.error("Stream parse error:", e, line);
					}
				}
			}
		}

		messages.push({ role: "assistant", content: message_out });
	});

	document
		.getElementById("chatbot_input")
		.addEventListener("keydown", function (e) {
			if (e.key === "Enter") {
				e.preventDefault();
				document.getElementById("chat_send").click();
			}
		});
});

let taskDate = document.querySelector(".taskDueDate");
let taskStatus = document.querySelector(".taskStatus");
let taskPriority = document.querySelector(".taskPriority");
let date = new Date(currentTask.due_date).getTime();

if (calculateNumberOfDaysFrom(date) < 7) {
	taskDate.setAttribute("style", "color: green;");
}
if (calculateNumberOfDaysFrom(date) < 4) {
	taskDate.setAttribute("style", "color: orange;");
}
if (calculateNumberOfDaysFrom(date) < 2) {
	taskDate.setAttribute("style", "color: red;");
}

if (currentTask.priority === "High") {
	taskPriority.setAttribute("style", "color: red; font-weight: bold;");
}
if (currentTask.priority === "Medium") {
	taskPriority.setAttribute("style", "color: orange; font-weight: bold;");
}
if (currentTask.priority === "Low") {
	taskPriority.setAttribute("style", "color: green; font-weight: bold;");
}

if (currentTask.status === "In Progress") {
	taskStatus.setAttribute("style", "color: orange;");
}
if (currentTask.status === "Completed") {
	taskStatus.setAttribute("style", "color: green; font-weight: bold;");
}

function initializeTaskStatus() {
	const completeBtn = document.querySelector(".complete-btn");
	if (completeBtn) {
		completeBtn.addEventListener("click", async () => {
			try {
				showMessage('Updating task status...', 'info');
				
				// Use dedicated status update endpoint
				await ApiService.updateTaskStatus(currentTask.task_id, "completed");
				
				// Refresh task data
				await loadTaskData();
				
				showMessage('Task marked as completed', 'success');
			} catch (error) {
				console.error('Error updating task status:', error);
				showMessage('Failed to update task status', 'error');
			}
		});
	}
}

function initializeComments() {
	displayComments();
	setupCommentSubmission();
}

function displayComments() {
	const commentsList = document.querySelector(".comments-list");
	commentsList.innerHTML = ''; // Clear existing comments

	if (!currentTask.comments || currentTask.comments.length === 0) {
		commentsList.innerHTML = '<p>No comments yet</p>';
		return;
	}

	currentTask.comments.forEach(comment => {
		const removeButton = currentUser.username === comment.user_name 
			? `<button onclick="removeComment('${comment.comment_id}')" class="remove-comment">Remove Comment</button>`
			: '';

		commentsList.insertAdjacentHTML(
			"beforeend",
			`<li id="${comment.comment_id}">
				<div class="comment-header">
					<span class="comment-author">${comment.user_name}: </span>
					<span class="comment-text">${comment.comment}</span>
				</div>
				${removeButton}
			</li>
			<pre class="comment-date">${formatDate(comment.created_at)}</pre>`
		);
	});
}

async function setupCommentSubmission() {
	const submitBtn = document.querySelector(".submit-comment-btn");
	const textarea = document.querySelector(".comment-textarea");

	submitBtn.addEventListener("click", async () => {
		const commentText = textarea.value.trim();
		if (!commentText) return;

		try {
			showMessage('Adding comment...', 'info');

			const commentData = {
				user_name: currentUser.username,
				comment: commentText,
				created_at: new Date().toISOString()
			};

			// Use dedicated comment addition endpoint
			await ApiService.addComment(currentTask.task_id, commentData);
			
			// Refresh task data
			await loadTaskData();
			
			// Clear textarea
			textarea.value = '';
			
			showMessage('Comment added successfully', 'success');
		} catch (error) {
			console.error('Error adding comment:', error);
			showMessage('Failed to add comment', 'error');
		}
	});
}
