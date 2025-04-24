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
    chat_bot.classList.remove("visible"); // start hiding the bot

    // After the bot has fully slid out, hide the toggle
    setTimeout(() => {
      chat_toggle.classList.remove("active");
    }, 300); // match the transition duration in CSS (300ms)
  });

  let chat_input = document.getElementById("chatbot_input");
  let chat_send = document.getElementById("chat_send");
  let chat_body = document.getElementsByClassName("chatbot-messages")[0];

  chat_send.addEventListener("click", async () => {
    let message = chat_input.value;
    if (message.trim() === "") return; // Ignore empty messages
    chat_input.value = ""; // Clear the input field
    chat_body.innerHTML += `<div class="message user-message">${message}</div>`;
    chat_body.scrollTop = chat_body.scrollHeight; // Scroll to the bottom
    chat_body.innerHTML += `
  <div class="message bot-message typing-dots">
    <span>.</span><span>.</span><span>.</span>
  </div>`;
    chat_body.scrollTop = chat_body.scrollHeight; // Scroll to the bottom
    messages.push({ role: "user", content: message });
    let resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "thudm/glm-4-32b:free",
        messages: messages,
      }),
    });
    let data = await resp.json();
    if (data.error) {
      console.error("Error:", data.error);
      chat_body.innerHTML += `<div class="message bot-message">Error: ${data.error}</div>`;
      return;
    }
    let message_out = data.choices[0].message.content;
    messages.push({ role: "assistant", content: message_out });
    chat_body.innerHTML = chat_body.innerHTML.replace(
      `<div class="message bot-message typing-dots">
        <span>.</span><span>.</span><span>.</span>
      </div>`,
      `<div class="message bot-message">${message_out}</div>`
    );
  });
  document
    .getElementById("chatbot_input")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault(); // Optional: prevent default form submission
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
let currentMinutes = new Date().getMinutes();
// let task = JSON.parse(localStorage.getItem("commentsList"));
// let commentsList = task.comments;
// let commentLocalStorage = `[{"task_id": ${task.task_id}, "task_title": "${
// 	task.task_title
// }", "task_description": "${task.task_description}", "start_date": "${
// 	task.start_date.innerHTML
// }", "due_date": "${task.due_date.innerHTML}", "status": "${
// 	task.status.innerHTML
// }", "priority": "${task.priority.innerHTML}", "assigned_to": "${
// 	task.assigned_to
// }", "comments": ${JSON.stringify(task.comments)}, "created_at": "${
// 	task.created_at.innerHTML
// }", "updated_at": "${task.updated_at.innerHTML}"}]`;
// localStorage.setItem("commentsList", commentLocalStorage);
// let commentsFromLocalStorage = JSON.parse(localStorage.getItem("commentsList"));

// window.addEventListener("load", function () {
// 	for (let i = 0; i < commentsFromLocalStorage.length; i++) {
// 		if (commentsFromLocalStorage[i]["task_id"] === task.task_id) {
// 			for (
// 				let j = 0;
// 				j < commentsFromLocalStorage[i]["comments"].length;
// 				j++
// 			) {
// 				this.document
// 					.querySelector(".comments-list")
// 					.insertAdjacentHTML(
// 						"beforeend",
// 						`<li><p><strong>
// 							${currentDate} -
// 							${currentHour}:
// 							${currentMinutes}
// 							${new Date().getHours() >= 12 ? "PM" : "AM"}</strong>:
// 							<span>${commentsFromLocalStorage[i]["comments"][j]["comment"]}</span>
// 							</p><button onClick="this.parentElement.remove();">Remove Comment</button></li>`
// 					);
// 			}
// 		}
// 	}
// });

document
  .querySelector(".submit-comment-btn")
  .addEventListener("click", function () {
    let commentText = document.querySelector(".comment-textarea").value;
    if (commentText !== "") {
      document.querySelector(".comments-list").insertAdjacentHTML(
        "beforeend",
        `<li id="${
          document.querySelector(".comments-list").childElementCount + 1
        }">
					<p>
						<span class="comment-user" style="border: 2px solid blue;padding: 5px 10px;border-radius: 5px;font-size: 25px;">User1</span>
						<sub class="comment-created-at">${currentDate} - ${currentHour}:
						${currentMinutes}
						${new Date().getHours() >= 12 ? "PM" : "AM"}</sub>:
						${commentText}
						</p>
		            <button onclick="this.parentElement.remove();">Remove Comment</button>
            	</li>`
      );
      commentText = "";
    }
  });

let taskDate = document.querySelector(".taskDueDate");
let taskStatus = document.querySelector(".taskStatus");
let date = new Date(taskDate.innerHTML);

if (calculateNumberOfDaysFrom(date) < 7) {
  taskDate.setAttribute("style", "color: green;");
}
if (calculateNumberOfDaysFrom(date) < 4) {
  taskDate.setAttribute("style", "color: orange;");
}
if (calculateNumberOfDaysFrom(date) < 2) {
  taskDate.setAttribute("style", "color: red;");
}

if (taskStatus.innerHTML === "In Progress") {
  taskStatus.setAttribute("style", "color: orange;");
}
if (taskStatus.innerHTML === "Completed") {
  taskStatus.setAttribute("style", "color: green;");
}

document.querySelector(".complete-btn").addEventListener("click", () => {
  taskStatus.innerHTML = "Completed";
  taskStatus.setAttribute("style", "color: green; font-weight: bold;");
});
