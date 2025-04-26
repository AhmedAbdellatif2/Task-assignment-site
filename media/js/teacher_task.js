import { tasks, users } from "./tasks_data.js";

let searchParams = new URLSearchParams(document.location.search);

const currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;

if (!currentUser) {
  window.location.href = "login.html";
  throw new Error("User not authenticated");
}

if (window.location.href.indexOf("?task_id=") == -1) {
  window.location.href += "?task_id=" + "task-002";
}

if (localStorage.getItem("Tasks") === null) {
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}
if (localStorage.getItem("users") === null) {
  localStorage.setItem("users", JSON.stringify(users));
}
let task = JSON.parse(localStorage.getItem("Tasks")).find(
  (tsk) => tsk.task_id === searchParams.get("task_id")
);
if (task === undefined) {
  console.error("Task not found");
}

let API_KEY =
  "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";
document.addEventListener("DOMContentLoaded", async () => {
  let messages = [
    {
      role: "system",
      content: "You are a helpful assistant.",
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

function calculateNumberOfDaysFrom(dueDate) {
  return (dueDate - new Date().getTime()) / (24 * 60 * 60 * 1000);
}
let currentDate = new Date().toDateString();
let currentHour =
  ((new Date().getHours() + 24) % 12 || 12) < 10
    ? `0${(new Date().getHours() + 24) % 12 || 1}`
    : (new Date().getHours() + 24) % 12 || 12;
let currentMinutes =
  new Date().getMinutes() < 10
    ? `0${new Date().getMinutes()}`
    : new Date().getMinutes();
function formatDate(date) {
  return date.toLocaleString();
}

function fetchData() {
  document.querySelector(".taskCreateDate").innerHTML = formatDate(
    task.created_at
  );
  document.querySelector(".taskUpdateDate").innerHTML = formatDate(
    task.updated_at
  );
  document.querySelector(".taskTitle h1").innerHTML = task.task_title;
  document.querySelector(".taskStartDate").innerHTML = formatDate(
    task.start_date
  );
  document.querySelector(".taskDueDate").innerHTML = formatDate(task.due_date);
  document.querySelector(".taskStatus").innerHTML = task.status;
  document.querySelector(".taskPriority").innerHTML = task.priority;
  document.querySelector(".content").children[0].innerHTML =
    task.task_description;

  let commentsList = task.comments;
  for (let j = 0; j < commentsList.length; j++) {
    document.querySelector(".comments-list").insertAdjacentHTML(
      "beforeend",
      `<li id="${commentsList[j].comment_id}">
            <div class="comment-header">
              <span class="comment-author">${commentsList[j].user_name}: </span>
              <span class="comment-text">${commentsList[j].comment}</span>
            </div>
            <button onclick="this.parentElement.nextElementSibling.remove();this.parentElement.remove();" class="remove-comment">Remove Comment</button>
          </li>
          <pre class="comment-date">${formatDate(
            commentsList[j].created_at
          )}</pre>`
    );
  }
}

window.addEventListener("load", fetchData);
document
  .querySelector(".submit-comment-btn")
  .addEventListener("click", function () {
    let commentText = document.querySelector(".comment-textarea").value;
    if (commentText !== "") {
      let commentID = new Date().getTime();
      document.querySelector(".comments-list").insertAdjacentHTML(
        "beforeend",
        `<li id="${commentID}">
					<div class="comment-header">
						<span class="comment-author">user-${commentID % 100}: </span>
						<span class="comment-text">${commentText}</span>
					</div>
					<button onclick="this.parentElement.nextElementSibling.remove();this.parentElement.remove();" class="remove-comment">Remove Comment</button>
				</li>
				<pre class="comment-date">${currentDate} - ${currentHour}:${currentMinutes} ${
          new Date().getHours() >= 12 ? "PM" : "AM"
        }</pre>`
      );
      let tsks = JSON.parse(localStorage.getItem("Tasks"));
      tsks.forEach((tsk) => {
        if (tsk.task_id === task.task_id) {
          tsk.comments.push({
            comment_id: commentID,
            user_name: `user-${commentID % 100}`,
            comment: commentText,
            created_at: `${currentDate} - ${currentHour}:${currentMinutes} ${
              new Date().getHours() >= 12 ? "PM" : "AM"
            }`,
          });
        }
      });
      localStorage.setItem("Tasks", JSON.stringify(tsks));
      commentText = "";
    }
  });

let taskDate = document.querySelector(".taskDueDate");
let taskStatus = document.querySelector(".taskStatus");
let taskPriority = document.querySelector(".taskPriority");
let date = new Date(task.due_date).getTime();

if (calculateNumberOfDaysFrom(date) < 7) {
  taskDate.setAttribute("style", "color: green;");
}
if (calculateNumberOfDaysFrom(date) < 4) {
  taskDate.setAttribute("style", "color: orange;");
}
if (calculateNumberOfDaysFrom(date) < 2) {
  taskDate.setAttribute("style", "color: red;");
}

if (task.priority === "High") {
  taskPriority.setAttribute("style", "color: red; font-weight: bold;");
}
if (task.priority === "Medium") {
  taskPriority.setAttribute("style", "color: orange; font-weight: bold;");
}
if (task.priority === "Low") {
  taskPriority.setAttribute("style", "color: green; font-weight: bold;");
}

if (task.status === "In Progress") {
  taskStatus.setAttribute("style", "color: orange;");
}
if (task.status === "Completed") {
  taskStatus.setAttribute("style", "color: green; font-weight: bold;");
}

document.querySelector(".complete-btn").addEventListener("click", () => {
  taskStatus.innerHTML = "Completed";
  taskStatus.setAttribute("style", "color: green; font-weight: bold;");
  let tsks = JSON.parse(localStorage.getItem("Tasks"));
  tsks.forEach((tsk) => {
    if (tsk.task_id === task.task_id) {
      tsk.status = "Completed";
    }
  });
  localStorage.setItem("Tasks", JSON.stringify(tsks));
});
