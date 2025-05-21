import apiService from "./ApiService.js";

const API_KEY =
  "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";

class TeacherTaskManager {
  constructor() {
    this.init();
  }
  async init() {
    apiService
      .getCurrentUser()
      .then((currentUser) => {
        if (currentUser.role === "admin") {
          return;
        }
        return currentUser;
      })
      .catch((error) => {
        console.error("Error fetching current user:", error);
        window.location.href = "/login";
      });
    this.taskId = new URLSearchParams(window.location.search).get("task_id");
    this.setupEventListeners();
    this.loadTask();
  }
  async loadTask() {
    try {
      //   const task = await apiService.getTaskById(this.taskId);
      //   this.displayTask(task);
      //   await this.loadComments();
    } catch (error) {
      console.error("Error loading task:", error);
      this.showError("Failed to load task details");
    }
  }

  displayTask(task) {
    document.getElementById("task-title").textContent = task.title;
    document.getElementById("task-description").textContent = task.description;
    document.getElementById("task-status").textContent = task.status;
    document.getElementById("task-due-date").textContent = task.dueDate;

    // Update status buttons
    const statusButtons = document.querySelectorAll(".status-btn");
    statusButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.status === task.status) {
        btn.classList.add("active");
      }
    });
  }

  async loadComments() {
    try {
      const comments = await apiService.getTaskComments(this.taskId);
      this.displayComments(comments);
    } catch (error) {
      console.error("Error loading comments:", error);
      this.showError("Failed to load comments");
    }
  }

  displayComments(comments) {
    const commentsList = document.getElementById("comments-list");
    commentsList.innerHTML = "";

    comments.forEach((comment) => {
      const commentElement = document.createElement("div");
      commentElement.className = "comment";
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
      this.showSuccess("Task status updated successfully");
    } catch (error) {
      console.error("Error updating task status:", error);
      this.showError("Failed to update task status");
    }
  }

  async addComment(commentText) {
    try {
      await apiService.addTaskComment(this.taskId, { text: commentText });
      await this.loadComments(); // Refresh comments
      this.showSuccess("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      this.showError("Failed to add comment");
    }
  }

  setupEventListeners() {
    // Status buttons
    document.querySelectorAll(".status-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.updateTaskStatus(btn.dataset.status);
      });
    });

    // Comment form
    const commentForm = document.getElementById("comment-form");
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const commentText = document.getElementById("comment-input").value.trim();
      if (commentText) {
        this.addComment(commentText);
        document.getElementById("comment-input").value = "";
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
document.addEventListener("DOMContentLoaded", () => {
  const teacherTaskManager = new TeacherTaskManager();
  let messages = [
    {
      role: "system",
      content: `You are a helpful assistant helping in a task its description is '${task.description}'.`,
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

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "thudm/glm-4-32b:free",
        messages: messages,
        stream: true,
      }),
    });

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
