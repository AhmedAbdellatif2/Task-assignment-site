import apiService from "./ApiService.js";

const API_KEY =
  "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";

class TeacherTaskManager {
  constructor() {
    this.init();
    // Initialize when the DOM is loaded
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
    await this.loadTask();
    let messages = [
      {
        role: "system",
        content: `You are a helpful assistant helping in a task its title is ${this.task.task_title} and description is '${this.task.task_description}'. Remeber this very well`,
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
  }
  async loadTask() {
    try {
      // Use the new data endpoint for teacher task
      const url = `/teacher_task/data/?task_id=${encodeURIComponent(
        this.taskId
      )}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch task data");
      const task = await response.json();
      this.task = task;
      this.displayTask(task);
      await this.loadComments();
    } catch (error) {
      console.error("Error loading task:", error);
      this.showError("Failed to load task details");
    }
  }

  displayTask(task) {
    // Update task fields using class selectors
    const titleElem = document.querySelector(".taskTitle h1");
    if (titleElem) titleElem.textContent = task.task_title || "";
    const statusElem = document.querySelector(".taskStatus");
    if (statusElem) statusElem.textContent = task.status || "";
    const dueDateElem = document.querySelector(".taskDueDate");
    if (dueDateElem)
      dueDateElem.textContent = this.formatDate(task.due_date) || "";
    const descElem = document.querySelector(".content p");
    if (descElem) descElem.textContent = task.task_description || "";
    const startDateElem = document.querySelector(".taskStartDate");
    if (startDateElem)
      startDateElem.textContent = this.formatDate(task.start_date) || "";
    const createDateElem = document.querySelector(".taskCreateDate");
    if (createDateElem)
      createDateElem.textContent = this.formatDate(task.created_at) || "";
    const updateDateElem = document.querySelector(".taskUpdateDate");
    if (updateDateElem)
      updateDateElem.textContent = this.formatDate(task.updated_at) || "";
    const priorityElem = document.querySelector(".taskPriority");
    if (priorityElem)
      priorityElem.textContent = task.priority || task.perioty || "";

    // Color logic for due date
    let date = new Date(task.due_date).getTime();
    if (dueDateElem) {
      if (this.calculateNumberOfDaysFrom(date) < 2) {
        dueDateElem.style.color = "red";
      } else if (this.calculateNumberOfDaysFrom(date) < 4) {
        dueDateElem.style.color = "orange";
      } else if (this.calculateNumberOfDaysFrom(date) < 7) {
        dueDateElem.style.color = "green";
      } else {
        dueDateElem.style.color = "";
      }
    }
    // Color logic for priority
    if (priorityElem) {
      if ((task.priority || task.perioty) === "High") {
        priorityElem.style.color = "red";
        priorityElem.style.fontWeight = "bold";
      } else if ((task.priority || task.perioty) === "Medium") {
        priorityElem.style.color = "orange";
        priorityElem.style.fontWeight = "bold";
      } else if ((task.priority || task.perioty) === "Low") {
        priorityElem.style.color = "green";
        priorityElem.style.fontWeight = "bold";
      } else {
        priorityElem.style.color = "";
        priorityElem.style.fontWeight = "";
      }
    }
    // Color logic for status
    if (statusElem) {
      if (task.status === "In Progress") {
        statusElem.style.color = "orange";
        statusElem.style.fontWeight = "";
      } else if (task.status === "Completed" || task.status === "Complete") {
        statusElem.style.color = "green";
        statusElem.style.fontWeight = "bold";
      } else {
        statusElem.style.color = "";
        statusElem.style.fontWeight = "";
      }
    }
  }

  calculateNumberOfDaysFrom(dueDate) {
    return (dueDate - new Date().getTime()) / (24 * 60 * 60 * 1000);
  }

  formatDate(date) {
    if (!date) return "";
    let d = new Date(date);
    let currentDate = d.toDateString();
    let hour = d.getHours();
    let minute = d.getMinutes();
    let ampm = hour >= 12 ? "PM" : "AM";
    let hour12 = (hour + 24) % 12 || 12;
    if (hour12 < 10) hour12 = `0${hour12}`;
    if (minute < 10) minute = `0${minute}`;
    return `${currentDate} - ${hour12}:${minute} ${ampm}`;
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
    const commentsList = document.querySelector(".comments-list");
    if (!commentsList) return;
    commentsList.innerHTML = "";
    comments.forEach((comment) => {
      const li = document.createElement("li");
      li.className = "comment";
      li.innerHTML = `
        <div class="comment-header">
          <p class="comment-author">${comment.author}</p>
          <p class="comment-text">${comment.comment}</p>
          <p class="comment-date">${new Date(comment.date).toLocaleString()}</p>
        </div>
      `;
      commentsList.appendChild(li);
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
    // Complete button
    const completeBtn = document.querySelector(".complete-btn");
    if (completeBtn) {
      completeBtn.addEventListener("click", () => {
        this.updateTaskStatus("Complete");
      });
    }

    // Comment button
    const commentBtn = document.querySelector(".submit-comment-btn");
    const commentInput = document.querySelector(".comment-textarea");
    if (commentBtn && commentInput) {
      commentBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const commentText = commentInput.value.trim();
        if (commentText) {
          this.addComment(commentText);
          commentInput.value = "";
        }
      });
    }
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f44336;
            color: white;
            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
        `;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
      errorDiv.style.opacity = "0";
      errorDiv.style.transition = "opacity 0.3s ease";
      setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
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
document.addEventListener("DOMContentLoaded", () => {
  new TeacherTaskManager();
});
