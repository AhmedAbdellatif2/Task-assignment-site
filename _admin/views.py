from django.shortcuts import render, redirect
from .models import Teacher, Admin, Task, Comment
from django.contrib.auth import logout
from django.contrib.auth.hashers import make_password,check_password
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.http import JsonResponse
import json

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
    if request.session.get("teacher_id"):
        filters["assighned_to"] = request.session["teacher_id"]
        queryset = Task.objects.filter(**filters)
    elif request.session.get("admin_id"):
        queryset = Task.objects.filter(**filters)
    else:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    print(queryset)
    tasks_list = list(queryset.values())
    return JsonResponse(tasks_list, safe=False)

def teacher_task(request):
    task_id = request.GET.get("task_id")
    teacher_id = request.session.get("teacher_id")
    if not task_id or not teacher_id:
        return redirect("/teachers_task_list")
    try:
        task = Task.objects.get(task_id=task_id, assigned_to=teacher_id)
    except Task.DoesNotExist:
        return redirect("/teachers_task_list")
    return render(request, '_admin/teacher_task.html', {"task": task})

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
        "task_id": task.task_id,
        "task_title": task.task_title,
        "task_description": task.task_description,
        "due_date": task.due_date,
        "start_date": task.start_date,
        "status": task.status,
        "priority": task.perioty,
        "assigned_to": task.assigned_to_id,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
    }
    return JsonResponse(task_data)