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
					document.querySelector(".comments-list").childElementCount +
					1
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
