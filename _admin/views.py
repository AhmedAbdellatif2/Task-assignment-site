from django.shortcuts import render, redirect
from .models import Teacher, Admin, Task, Comment
from django.contrib.auth import logout
from django.contrib.auth.hashers import make_password,check_password
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods
from django.http import JsonResponse
import json
from django.views.decorators.http import require_POST
from django.template.loader import render_to_string
from django.http import HttpResponse

# Routs logic

def Dashboard(request):
    return render(request, '_admin/AdminDashboard.html')

def addtask(request):
    return render(request, '_admin/AdminTask.html')

def EditPage(request):
    return render(request, '_admin/AdminEditPage.html')

def Profile(request):
    return render(request, '_admin/profile_page.html')

def Settings(request):
    return render(request, '_admin/settings.html')

def Search(request):
    return render(request, '_admin/SearchPage.html')

def teachers_task_list(request):
    return render(request, '_admin/teachers_task_list.html')


# Authentication logic

@csrf_exempt
def SignUp(request):
    if request.method == 'POST':
        if request.content_type != 'application/json':
            print(request.content_type)
            return JsonResponse({"success": False, "error": "Content-Type must be application/json"}, status=400)
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)
        user_type = data.get('role')
        name = data.get('name')
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        avatar_url = data.get('avatar_url')

        # Check if the username or email already exists
        if user_type == 'teacher':
            if Teacher.objects.filter(username=username).exists():
                return JsonResponse({"success": False, "error": "Username already exists"}, status=400)
            if Teacher.objects.filter(email=email).exists():
                return JsonResponse({"success": False, "error": "Email already exists"}, status=400)

            if not is_strong_password(password):
                return JsonResponse({"success": False, "error": "Password must be at least 8 characters long and contain at least one digit, one special character, and the first letter should be capitalized"}, status=400)

            hashed_password = make_password(password)
            teacher = Teacher(name=name, username=username, password=hashed_password, email=email, avatar_url=avatar_url or '')
            teacher.save()
            return JsonResponse({"success": True, "message": "Teacher registration successful"})

        elif user_type == 'admin':
            if Admin.objects.filter(username=username).exists():
                return JsonResponse({"success": False, "error": "Username already exists"}, status=400)
            if Admin.objects.filter(email=email).exists():
                return JsonResponse({"success": False, "error": "Email already exists"}, status=400)

            if not is_strong_password(password):
                return JsonResponse({"success": False, "error": "Password must be at least 8 characters long and contain at least one digit, one special character, and the first letter should be capitalized"}, status=400)

            hashed_password = make_password(password)
            admin = Admin(name=name, username=username, password=hashed_password, email=email, avatar_url=avatar_url or '')
            admin.save()
            return JsonResponse({"success": True, "message": "Admin registration successful"})

        else:
            return JsonResponse({"success": False, "error": "Invalid user type"}, status=400)

    return render(request, '_admin/signup.html')
@csrf_exempt
def Login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        role = data.get('role')
        username = data.get('username')
        password = data.get('password')

        if not role:
            teacher_exists = Teacher.objects.filter(username=username).exists()
            admin_exists = Admin.objects.filter(username=username).exists()
            if teacher_exists and not admin_exists:
                role = 'teacher'
            elif admin_exists and not teacher_exists:
                role = 'admin'
            elif teacher_exists and admin_exists:
                return JsonResponse({"success": False, "error": "Username exists as both teacher and admin. Please specify role."}, status=400)
            else:
                return JsonResponse({"success": False, "error": "Invalid username"}, status=400)

        if role == 'teacher':
            try:
                teacher = Teacher.objects.get(username=username)
                if check_password(password, teacher.password):
                    request.session['teacher_id'] = teacher.id
                    request.session['username'] = teacher.username
                    return JsonResponse({"success": True, "role": "teacher"}, status=200)
                else:
                    return JsonResponse({"success": False, "error": "Invalid password for teacher"}, status=400)
            except Teacher.DoesNotExist:
                return JsonResponse({"success": False, "error": "Invalid username for teacher"}, status=400)

        elif role == 'admin':
            try:
                admin = Admin.objects.get(username=username)
                if check_password(password, admin.password):
                    request.session['admin_id'] = admin.id
                    request.session['username'] = admin.username
                    return JsonResponse({"success": True, "role": "admin"}, status=200)
                else:
                    return JsonResponse({"success": False, "error": "Invalid password for admin"}, status=400)
            except Admin.DoesNotExist:
                return JsonResponse({"success": False, "error": "Invalid username for admin"}, status=400)

        else:
            return JsonResponse({"success": False, "error": "Invalid role"}, status=400)

    return render(request, '_admin/login.html')

@csrf_exempt
def user_logout(request):
    if request.method != "POST":
        return JsonResponse({"error": "not a post method"})
    logout(request)
    return JsonResponse({"success": True, "message": "Logged out successfully"})

@require_GET
def current_user(request):
    user_info = None
    if request.session.get('admin_id'):
        try:
            admin = Admin.objects.get(id=request.session['admin_id'])
            user_info = {
                "role": "admin",
                "id": admin.id,
                "name": admin.name,
                "username": admin.username,
                "email": admin.email,
                "avatar_url": admin.avatar_url,
            }
        except Admin.DoesNotExist:
            pass
    elif request.session.get('teacher_id'):
        try:
            teacher = Teacher.objects.get(id=request.session['teacher_id'])
            user_info = {
                "role": "teacher",
                "id": teacher.id,
                "name": teacher.name,
                "username": teacher.username,
                "email": teacher.email,
                "avatar_url": teacher.avatar_url,
            }
        except Teacher.DoesNotExist:
            pass

    if user_info:
        return JsonResponse(user_info)
    else:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
def is_strong_password(password):
    # Check if password length is at least 8 characters
    if len(password) < 8:
        return False

    # Check if password contains at least one digit
    if not any(char.isdigit() for char in password):
        return False

    # Check if password contains at least one special character
    if not any(char in '!@#$%^&*()-_=+[{]}|;:"<>,.?/' for char in password):
        return False

    return True

@csrf_exempt
def check_username(request):
    if request.method == 'GET':
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'exists': False, 'error': 'No username provided'}, status=400)
        exists = Teacher.objects.filter(username=username).exists() or Admin.objects.filter(username=username).exists()
        return JsonResponse({'exists': exists})
    return JsonResponse({'error': 'Invalid request method'}, status=405)

# Tasks Logic

def tasks(request):
    filters = dict(request.GET.items()) if request.method == 'GET' else {}
    queryset = None
    teacher_id = request.session.get("teacher_id")
    admin_id = request.session.get("admin_id")
    if teacher_id:
        filters["assigned_to"] = teacher_id
        queryset = Task.objects.filter(**filters)
    elif admin_id:
        # Admin can see all tasks, but allow filtering by assigned_to if provided
        queryset = Task.objects.filter(**filters)
    else:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    tasks_list = [
        {
            "id": t.task_id,
            "title": t.task_title,
            "description": t.task_description,
            "dueDate": t.due_date,
            "startDate": t.start_date,
            "status": t.status,
            "priority": t.priority,
            "assignedTo": t.assigned_to_id,
            "createdAt": t.created_at,
            "updatedAt": t.updated_at,
        }
        for t in queryset
    ]
    return JsonResponse(tasks_list, safe=False)

def teacher_task_data(request):
    task_id = request.GET.get("task_id")
    teacher_id = request.session.get("teacher_id")
    admin_id = request.session.get("admin_id")
    if not task_id:
        return JsonResponse({"error": "Missing task_id"}, status=400)
    if not teacher_id and not admin_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    try:
        if teacher_id:
            task = Task.objects.get(task_id=task_id, assigned_to=teacher_id)
        elif admin_id:
            task = Task.objects.get(task_id=task_id)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    task_data = {
        "id": task.task_id,
        "title": task.task_title,
        "description": task.task_description,
        "dueDate": task.due_date,
        "startDate": task.start_date,
        "status": task.status,
        "priority": task.priority,
        "assignedTo": task.assigned_to_id,
        "createdAt": task.created_at,
        "updatedAt": task.updated_at,
    }
    return JsonResponse(task_data)

def teacher_task(request):
    # Only render the page, data is fetched via AJAX
    return render(request, '_admin/teacher_task.html')

def get_task(request, task_id):
    # Only allow access if user is authenticated
    teacher_id = request.session.get("teacher_id")
    admin_id = request.session.get("admin_id")
    try:
        if teacher_id:
            task = Task.objects.get(task_id=task_id, assigned_to_id=teacher_id)
        elif admin_id:
            task = Task.objects.get(task_id=task_id)
        else:
            return JsonResponse({"error": "Not authenticated"}, status=401)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)

    task_data = {
        "id": task.task_id,
        "title": task.task_title,
        "description": task.task_description,
        "dueDate": task.due_date,
        "startDate": task.start_date,
        "status": task.status,
        "priority": task.priority,
        "assignedTo": task.assigned_to_id,
        "createdAt": task.created_at,
        "updatedAt": task.updated_at,
    }
    return JsonResponse(task_data)

@csrf_exempt
@require_http_methods(["PUT"])
def update_task(request, task_id):
    teacher_id = request.session.get("teacher_id")
    admin_id = request.session.get("admin_id")
    try:
        if teacher_id:
            task = Task.objects.get(task_id=task_id, assigned_to=teacher_id)
        elif admin_id:
            task = Task.objects.get(task_id=task_id)
        else:
            return JsonResponse({"error": "Not authenticated"}, status=401)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    for field in ["task_title", "task_description", "due_date", "start_date", "status", "priority", "assigned_to"]:
        if field in data:
            if field == "assigned_to":
                # ForeignKey expects an object, not just the id
                try:
                    teacher = Teacher.objects.get(id=data[field])
                    task.assigned_to = teacher
                except Teacher.DoesNotExist:
                    return JsonResponse({"error": "Assigned teacher not found"}, status=400)
            else:
                setattr(task, field, data[field])
    task.save()

    return JsonResponse({"success": True, "message": "Task updated successfully"})

@require_GET
def get_task_comments(request, task_id):
    teacher_id = request.session.get("teacher_id")
    admin_id = request.session.get("admin_id")
    try:
        if teacher_id:
            task = Task.objects.get(task_id=task_id, assigned_to=teacher_id)
        elif admin_id:
            task = Task.objects.get(task_id=task_id)
        else:
            return JsonResponse({"error": "Not authenticated"}, status=401)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)

    comments = Comment.objects.filter(task=task).order_by('created_at')
    comments_data = [
        {
            "comment_id": c.comment_id,
            "author": c.teacher.username if c.teacher else (c.admin.username if c.admin else "Unknown"),
            "comment": c.comment,
            "date": c.created_at,
        }
        for c in comments
    ]
    return JsonResponse(comments_data, safe=False)

@csrf_exempt
@require_http_methods(["POST"])
def add_task_comment(request, task_id):
    teacher_id = request.session.get("teacher_id")
    admin_id = request.session.get("admin_id")
    try:
        if teacher_id:
            task = Task.objects.get(task_id=task_id, assigned_to_id=teacher_id)
        elif admin_id:
            task = Task.objects.get(task_id=task_id)
        else:
            return JsonResponse({"error": "Not authenticated"}, status=401)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)

    try:
        data = json.loads(request.body)
        text = data.get("text", "").strip()
        if not text:
            return JsonResponse({"error": "Comment text required"}, status=400)
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    teacher = None
    admin = None
    if teacher_id:
        teacher = Teacher.objects.get(id=teacher_id)
    elif admin_id:
        admin = Admin.objects.get(id=admin_id)

    comment = Comment(task=task, teacher=teacher, admin=admin, comment=text)
    comment.save()
    return JsonResponse({"success": True, "message": "Comment added successfully"})

@csrf_exempt
@require_http_methods(["GET"])
def users(request):
    # Only admin can list users
    if not request.session.get('admin_id'):
        return JsonResponse({"error": "Not authorized"}, status=403)
    teachers = list(Teacher.objects.values('id', 'name', 'username', 'email', 'avatar_url'))
    admins = list(Admin.objects.values('id', 'name', 'username', 'email', 'avatar_url'))
    return JsonResponse({"teachers": teachers, "admins": admins})

@csrf_exempt
@require_http_methods(["PUT"])
def update_user_profile(request):
    user_id = request.session.get('admin_id') or request.session.get('teacher_id')
    if not user_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    if request.session.get('admin_id'):
        user = Admin.objects.get(id=user_id)
    else:
        user = Teacher.objects.get(id=user_id)
    for field in ['name', 'email', 'avatar_url']:
        if field in data:
            setattr(user, field, data[field])
    user.save()
    return JsonResponse({"success": True, "message": "Profile updated"})

@csrf_exempt
@require_http_methods(["PUT"])
def change_password(request):
    user_id = request.session.get('admin_id') or request.session.get('teacher_id')
    if not user_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    try:
        data = json.loads(request.body)
        new_password = data.get('new_password')
        if not new_password:
            return JsonResponse({"error": "New password required"}, status=400)
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    if request.session.get('admin_id'):
        user = Admin.objects.get(id=user_id)
    else:
        user = Teacher.objects.get(id=user_id)
    user.password = make_password(new_password)
    user.save()
    return JsonResponse({"success": True, "message": "Password changed"})

@csrf_exempt
@require_http_methods(["GET", "PUT"])
def user_preferences(request):
    # For demo, just return or update a static dict in session
    if not request.session.get('admin_id') and not request.session.get('teacher_id'):
        return JsonResponse({"error": "Not authenticated"}, status=401)
    if request.method == "GET":
        prefs = request.session.get('user_preferences', {"theme": "dark", "upcomingTasks": True, "scheduledTasks": True})
        return JsonResponse(prefs)
    else:
        try:
            data = json.loads(request.body)
            request.session['user_preferences'] = data
            return JsonResponse({"success": True, "message": "Preferences updated"})
        except Exception:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

@csrf_exempt
@require_http_methods(["PUT"])
def update_username(request):
    user_id = request.session.get('admin_id') or request.session.get('teacher_id')
    if not user_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    try:
        data = json.loads(request.body)
        new_username = data.get('username')
        if not new_username:
            return JsonResponse({"error": "Username required"}, status=400)
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    if request.session.get('admin_id'):
        user = Admin.objects.get(id=user_id)
    else:
        user = Teacher.objects.get(id=user_id)
    user.username = new_username
    user.save()
    return JsonResponse({"success": True, "message": "Username updated"})

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_account(request):
    user_id = request.session.get('admin_id') or request.session.get('teacher_id')
    if not user_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    if request.session.get('admin_id'):
        Admin.objects.filter(id=user_id).delete()
        request.session.flush()
    else:
        Teacher.objects.filter(id=user_id).delete()
        request.session.flush()
    return JsonResponse({"success": True, "message": "Account deleted"})

def navbar_partial(request):
    html = render_to_string('_admin/navbar.html', request=request)
    return HttpResponse(html)

@csrf_exempt
@require_http_methods(["POST"])
def addtask_api(request):
    if not request.session.get("admin_id"):
        return JsonResponse({"error": "Not authenticated"}, status=401)
    try:
        data = json.loads(request.body)
        task = Task(
            task_title=data.get("task_title"),
            task_description=data.get("task_description"),
            due_date=data.get("due_date"),
            start_date=data.get("start_date"),
            status=data.get("status"),
            priority=data.get("priority"),
            assigned_to_id=data.get("assigned_to"),
        )
        task.save()
        return JsonResponse({"success": True, "message": "Task added successfully", "task_id": task.task_id})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_task(request, task_id):
    # Only admin can delete tasks
    if not request.session.get("admin_id"):
        return JsonResponse({"error": "Not authorized"}, status=403)
    try:
        task = Task.objects.get(task_id=task_id)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    task.delete()
    return JsonResponse({"success": True, "message": "Task deleted successfully"})