function calculateNumberOfDaysFrom(dueDate) {
	return (dueDate - new Date().getTime()) / (24 * 60 * 60 * 1000);
}
let currentDate = new Date().toDateString();
let currentHour =
	((new Date().getHours() + 24) % 12 || 12) < 10
		? `0${(new Date().getHours() + 24) % 12 || 1}`
		: (new Date().getHours() + 24) % 12 || 12;
let currentMinutes = new Date().getMinutes();
// localStorage.setItem(
// 	"Tasks",
// 	JSON.stringify([
// 		{
// 			task_id: Number.parseInt(
// 				document
// 					.querySelector(".task-view")
// 					.children[0].className.toString()
// 					.substring(4)
// 			),
// 			task_title: document.querySelector(".taskTitle h1").innerHTML,
// 			task_description:
// 				document.querySelector(".description").nextElementSibling
// 					.children[0].innerHTML,
// 			start_date: new Date(
// 				document.querySelector(".taskStartDate").innerHTML
// 			).toDateString(),
// 			due_date: new Date(
// 				document.querySelector(".taskDueDate").innerHTML
// 			).toDateString(),
// 			status: document.querySelector(".taskStatus").innerHTML,
// 			priority: document.querySelector(".taskPriority").innerHTML,
// 			assigned_to: [],
// 			comments: [],
// 			created_at: new Date(
// 				document.querySelector(".taskCreateDate").innerHTML
// 			).toDateString(),
// 			updated_at: new Date(
// 				document.querySelector(".taskUpdateDate").innerHTML
// 			).toDateString(),
// 		},
// 	])
// );
window.addEventListener("load", function () {
	let commentsList = JSON.parse(this.localStorage.getItem("Tasks"))[0]
		.comments;
	for (let j = 0; j < commentsList.length; j++) {
		document.querySelector(".comments-list").insertAdjacentHTML(
			"beforeend",
			`<li id="${commentsList[j].comment_id}">
				<div class="comment-header">
				<span class="comment-author">${commentsList[j].user_id}: </span>
				<span class="comment-text">${commentsList[j].comment}</span>
				</div>
				<button onclick="this.parentElement.nextElementSibling.remove();this.parentElement.remove();" class="remove-comment">Remove Comment</button>
			</li>
			<pre class="comment-date">${commentsList[j].created_at}</pre>`
		);
	}
});

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
					<span class="comment-author">${commentID}: </span>
					<span class="comment-text">${commentText}</span>
					</div>
					<button onclick="this.parentElement.nextElementSibling.remove();this.parentElement.remove();" class="remove-comment">Remove Comment</button>
				</li>
				<pre class="comment-date">${currentDate} - ${currentHour}:${currentMinutes} ${
					new Date().getHours() >= 12 ? "PM" : "AM"
				}</pre>`
			);
			let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];
			if (tasks.length > 0) {
				tasks[0].comments.push({
					comment_id: commentID,
					user_id: commentID,
					comment: commentText,
					created_at: `${currentDate} - ${currentHour}:${currentMinutes} ${
						new Date().getHours() >= 12 ? "PM" : "AM"
					}`,
				});
				localStorage.setItem("Tasks", JSON.stringify(tasks));
			}
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
