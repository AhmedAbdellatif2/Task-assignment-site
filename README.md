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

## Images For Our Pages:-
<br><br>**1) Sign up Page: to create an account for a new user**
   ![Sign up page](Images/1.%20sign%20up.png)

<br><br>**2) Login Page: to login with an existing account**
   ![Login page](Images/1.%20login.png)

<br><br>**3) Admin Dashboard Page: to view all tasks added by the admin (admin only)**
   ![Admin Dashboard page](Images/2.%20admin%20dashboard.png)

<br><br>**4) Admin Task Management Page: to add a task (admin only)**
   ![Admin task management page](Images/2.%20admin%20task%20management.png)

<br><br>**5) Edit Task Page: to edit existing task properties (admin only)**
   ![Edit task page](Images/2.%20edit%20task.png)

<br><br>**6) Search Page: to search for tasks and filter by status or priority**
   ![Search page](Images/3.%20search.png)
   ![Filtering results](Images/3.%20search2.png)

<br><br>**7) Settings Page:
    here you can:  
       - View and change your name  
       - Select theme (Dark / Light)
       - Manage notifications  
       - Logout or delete account**
    ![Settings page](Images/4.%20settings.png)

<br><br>**8) Tasks List Page: to view tasks assigned to the teacher**
   ![Tasks list in Dark Mode](Images/5.%20tasks%20list%20darkMode.jpg)  
![Tasks list in Light Mode](Images/5.%20tasks%20list%20lightMode.jpg)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone "https://github.com/AhmedAbdellatif2/Task-assignment-site.git"
cd Task-assignment-site
```

### 2. Create and Activate virtual environment
```bash
pip install virtualenv
virtualenv env
env\Scripts\activate
```
### 3. Download django
```bash
pip install django
pip freeze > requirements.txt
```

### 4. Run Database Migrations
 ```bash
 python manage.py makemigrations
 python manage.py migrate
 ```

### 5. Run the development server
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
