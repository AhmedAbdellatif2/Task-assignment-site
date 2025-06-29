export const tasks = [
  {
    task_id: "task-001",
    task_title: "Design Landing Page",
    task_description:
      "Create a responsive design for the product landing page.",
    start_date: new Date("2025-04-20"),
    due_date: new Date("2025-04-27"),
    status: "in_progress",
    priority: "high",
    assigned_to: ["user-101", "user-102"],
    comments: [
      {
        comment_id: "comment-001",
        user_name: "user-101",
        comment: "Initial wireframes are ready for review.",
        created_at: new Date("2025-04-21T10:30:00Z"),
      },
    ],
    created_at: new Date("2025-04-20T08:00:00Z"),
    updated_at: new Date("2025-04-21T12:00:00Z"),
  },
  {
    task_id: "task-002",
    task_title: "Fix Signup Bug",
    task_description:
      "Resolve the issue where users can't sign up with Google.",
    start_date: new Date("2025-04-22"),
    due_date: new Date("2025-04-23"),
    status: "pending",
    priority: "medium",
    assigned_to: "user-103",
    comments: [],
    created_at: new Date("2025-04-22T09:00:00Z"),
    updated_at: new Date("2025-04-22T09:00:00Z"),
  },
  {
    task_id: "task-003",
    task_title: "Backend API Integration",
    task_description: "Integrate frontend with backend API for data fetching.",
    start_date: new Date("2025-04-18"),
    due_date: new Date("2025-04-25"),
    status: "completed",
    priority: "high",
    assigned_to: ["user-102"],
    comments: [
      {
        comment_id: "comment-002",
        user_name: "user-102",
        comment: "API integration done. Awaiting QA testing.",
        created_at: new Date("2025-04-23T14:45:00Z"),
      },
      {
        comment_id: "comment-003",
        user_name: "user-104",
        comment: "QA passed. Ready to deploy.",
        created_at: new Date("2025-04-24T10:10:00Z"),
      },
    ],
    created_at: new Date("2025-04-18T07:30:00Z"),
    updated_at: new Date("2025-04-24T10:15:00Z"),
  },
  {
    task_id: "task-004",
    task_title: "Archive Old Reports",
    task_description: "Move all reports from 2023 to the archive storage.",
    start_date: new Date("2025-04-01"),
    due_date: new Date("2025-04-10"),
    status: "archived",
    priority: "low",
    assigned_to: "user-105",
    comments: [
      {
        comment_id: "comment-004",
        user_name: "user-105",
        comment: "All reports successfully archived.",
        created_at: new Date("2025-04-09T16:00:00Z"),
      },
    ],
    created_at: new Date("2025-04-01T11:00:00Z"),
    updated_at: new Date("2025-04-10T18:00:00Z"),
  },
];
export const users = [
  {
    user_id: "user-101",
    name: "Alice Johnson",
    username: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "teacher",
    avatar_url: "https://randomuser.me/api/portraits/women/1.jpg",
    joined_at: new Date("2024-11-15"),
    last_active: new Date("2025-04-23T14:20:00Z"),
  },
  {
    user_id: "user-102",
    name: "Mark Spencer",
    username: "Mark Spencer",
    email: "mark.spencer@example.com",
    role: "teacher",
    avatar_url: "https://randomuser.me/api/portraits/men/2.jpg",
    joined_at: new Date("2024-09-05"),
    last_active: new Date("2025-04-22T09:45:00Z"),
  },
  {
    user_id: "user-103",
    name: "Sophia Lin",
    username: "Sophia Lin",
    email: "sophia.lin@example.com",
    role: "teacher",
    avatar_url: "https://randomuser.me/api/portraits/women/3.jpg",
    joined_at: new Date("2023-06-30"),
    last_active: new Date("2025-04-21T11:10:00Z"),
  },
  {
    user_id: "user-105",
    name: "Daniel O'Neill",
    username: "Daniel O'Neill",
    email: "daniel.oneill@example.com",
    role: "admin",
    avatar_url: "https://randomuser.me/api/portraits/men/5.jpg",
    joined_at: new Date("2022-03-12"),
    last_active: new Date("2025-04-20T08:30:00Z"),
  },
];
