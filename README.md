# 📚 School Task Assignment Website

A simple and user-friendly school task assignment web application where **Admins** can assign and manage tasks for **Teachers**, and **Teachers** can view, complete, and interact with assigned tasks.

---

### 🔐 User Management
- Sign up as an **Admin** or a **Teacher**
- Login system with role-based redirection
- Authentication securely in **Login** and **Registeration** for users (teachers and admins)
- Dynamic navigation bar based on user role and login status

### 🛠️ Admin Capabilities
- Create, edit, and delete tasks
- Assign tasks to teachers with priority (Low / Medium / High)
- View all tasks created by the currently logged-in admin

### 📘 Teacher Capabilities
- View only tasks assigned to the logged-in teacher
- Search tasks by **priority**
- View task details
- Mark tasks as **completed**
- View completed tasks

### 🌐 Additional Features
- **Settings page** with support for **Light/Dark Mode**
- **Notifications** Automated alerts for new assignments and deadlines
- Integration with an **AI Chatbot** via API
- Responsive and accessible UI

---

## 🛠️ Built With

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Django (Python)
- **Database:** SQLite
- **API Integration:** Chatbot (via REST APIs)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone "https://github.com/AhmedAbdellatif2/Task-assignment-site.git"
cd Task-assignment-site
```

### 2. Create and Activate virtual environment
```bash
python -m venv env
source env\Scripts\activate
```


### 3. Run Database Migrations
 ```bash
 python manage.py makemigrations
 python manage.py migrate
 ```

### 4. Run the development server
```bash
python manage.py runserver
```

then open **http://127.0.0.1:8000** in your browser

---

## 📬 Contact
- Marwan Hussein: [LinkedIn](http://www.linkedin.com/in/marawan-hussein-568373314)
- Adel Hefney: [LinkedIn]()
- Ahmed Abdellatef: [LinkedIn](https://www.linkedin.com/in/ahmed-abdellatif-521b1b27b/)
- Mahmoud AbdelAziz: [LinkedIn]()
- Youssef Fahmy: [LinkedIn]()
- Youssef Edris: [LinkedIn](http://www.linkedin.com/in/yousif-edris)

## 📜 License
This project is licensed under the MIT License.
