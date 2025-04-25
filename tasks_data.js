export const tasks = [
	{
		task_id: "task-001",
		task_title: "Design Landing Page",
		task_description:
			"Create a responsive design for the product landing page.",
		start_date: new Date("Apr 25 2025").toDateString(),
		due_date: new Date("May 25 2025").toDateString(),
		status: "In Progress",
		priority: "high",
		assigned_to: ["user-101", "user-102"],
		comments: [
			{
				comment_id: "comment-001",
				user_name: "user-101",
				comment: "Initial wireframes are ready for review.",
				created_at: new Date("Apr 16 2025").toDateString(),
			},
			{
				comment_id: "comment-002",
				user_name: "user-102",
				comment: "Feedback received. Working on revisions.",
				created_at: new Date("Apr 21 2025").toDateString(),
			},
		],
		created_at: new Date("Apr 15 2025").toDateString(),
		updated_at: new Date("Apr 18 2025").toDateString(),
	},
	{
		task_id: "task-002",
		task_title: "Implement Authentication System",
		task_description:
			"Develop secure user authentication with OAuth integration.",
		start_date: new Date("Apr 18 2025").toDateString(),
		due_date: new Date("May 9 2025").toDateString(),
		status: "Pending",
		priority: "High",
		assigned_to: ["user-103", "user-104"],
		comments: [
			{
				comment_id: "comment-003",
				user_name: "user-103",
				comment: "Setting up OAuth providers integration.",
				created_at: new Date("Apr 19 2025").toDateString(),
			},
			{
				comment_id: "comment-004",
				user_name: "user-104",
				comment: "Need clarification on password policy requirements.",
				created_at: new Date("Apr 22 2025").toDateString(),
			},
		],
		created_at: new Date("Apr 17 2025").toDateString(),
		updated_at: new Date("Apr 22 2025").toDateString(),
	},

	{
		task_id: "task-003",
		task_title: "Database Optimization",
		task_description:
			"Optimize database queries and implement caching for improved performance.",
		start_date: new Date("Apr 10 2025").toDateString(),
		due_date: new Date("Apr 20 2025").toDateString(),
		status: "Completed",
		priority: "Medium",
		assigned_to: ["user-105"],
		comments: [
			{
				comment_id: "comment-005",
				user_name: "user-105",
				comment: "Identified bottlenecks in main user queries.",
				created_at: new Date("Apr 12 2025").toDateString(),
			},
			{
				comment_id: "comment-006",
				user_name: "user-101",
				comment: "Great work! Response time improved by 40%.",
				created_at: new Date("Apr 19 2025").toDateString(),
			},
		],
		created_at: new Date("Apr 9 2025").toDateString(),
		updated_at: new Date("Apr 19 2025").toDateString(),
	},

	{
		task_id: "task-004",
		task_title: "Content Management System",
		task_description:
			"Build a user-friendly CMS for managing blog posts and product information.",
		start_date: new Date("May 1 2025").toDateString(),
		due_date: new Date("Jun 15 2025").toDateString(),
		status: "Archived",
		priority: "Low",
		assigned_to: ["user-102", "user-106"],
		comments: [
			{
				comment_id: "comment-007",
				user_name: "user-106",
				comment:
					"Project requirements have changed. Moving to next quarter.",
				created_at: new Date("Apr 23 2025").toDateString(),
			},
		],
		created_at: new Date("Apr 15 2025").toDateString(),
		updated_at: new Date("Apr 23 2025").toDateString(),
	},
];
export const users = [
	{
		user_id: "user-101",
		name: "Alice Johnson",
		email: "alice.johnson@example.com",
		role: "teacher",
		avatar_url: "https://randomuser.me/api/portraits/women/1.jpg",
		joined_at: new Date("2024-11-15"),
		last_active: new Date("2025-04-23T14:20:00Z"),
	},
	{
		user_id: "user-102",
		name: "Mark Spencer",
		email: "mark.spencer@example.com",
		role: "teacher",
		avatar_url: "https://randomuser.me/api/portraits/men/2.jpg",
		joined_at: new Date("2024-09-05"),
		last_active: new Date("2025-04-22T09:45:00Z"),
	},
	{
		user_id: "user-103",
		name: "Sophia Lin",
		email: "sophia.lin@example.com",
		role: "teacher",
		avatar_url: "https://randomuser.me/api/portraits/women/3.jpg",
		joined_at: new Date("2023-06-30"),
		last_active: new Date("2025-04-21T11:10:00Z"),
	},
	{
		user_id: "user-105",
		name: "Daniel O'Neill",
		email: "daniel.oneill@example.com",
		role: "admin",
		avatar_url: "https://randomuser.me/api/portraits/men/5.jpg",
		joined_at: new Date("2022-03-12"),
		last_active: new Date("2025-04-20T08:30:00Z"),
	},
];
