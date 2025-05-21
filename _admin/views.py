from django.shortcuts import render
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from .models import Teacher, Admin
from django.contrib.auth.hashers import make_password,check_password
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Task, Comment
from .forms import TaskForm, CommentForm
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseNotAllowed

# Create your views here.
import json
import json

def Dashboard(request):
    return render(request, '_admin/AdminDashboard.html')

def Tasks(request):
    return render(request, '_admin/AdminTask.html')

def EditPage(request):
    return render(request, '_admin/AdminEditPage.html')

def Profile(request):
    return render(request, '_admin/profile_page.html')

def Settings(request):
    return render(request, '_admin/settings.html')

def Search(request):
    return render(request, '_admin/SearchPage.html')

def teacher_task(request):
    return render(request, '_admin/teacher_task.html')

def teachers_task_list(request):
    return render(request, '_admin/teachers_task_list.html')

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
        try:
            data = json.loads(request.body)
            print(data)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

        username = data.get('username')
        password = data.get('password')
        

        if not username or not password:
            return JsonResponse({"success": False, "error": "Username and password are required"}, status=400)

        # Try teacher first
        teacher = Teacher.objects.filter(username=username).first()
        if teacher and check_password(password, teacher.password):
            request.session['teacher_id'] = teacher.id
            request.session['username'] = teacher.username
            return JsonResponse({"success": True, "role": "teacher"})

        # Try admin
        admin = Admin.objects.filter(username=username).first()
        if admin and check_password(password, admin.password):
            request.session['admin_id'] = admin.id
            request.session['username'] = admin.username
            return JsonResponse({"success": True, "role": "admin"})

        # If neither found or password incorrect
        return JsonResponse({"success": False, "error": "Invalid username or password"}, status=401)

    return render(request, '_admin/login.html')

def is_strong_password(password):
    # Check if password length is at least 8 characters
    if len(password) < 8:
        return False

    # Check if first character is capitalized
    if not password[0].isupper():
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

#################### Tasks ####################
# Create Task
@csrf_exempt
def create_task(request):
    if request.method == "POST":
        data = json.loads(request.body)
        form = TaskForm(data)
        if form.is_valid():
            task = form.save()
            return JsonResponse({"success": True, "task": task.id})
        return JsonResponse({"success": False, "errors": form.errors}, status=400)
    return HttpResponseNotAllowed(["POST"])

# Read List of all tasks
def list_tasks(request):
    if request.method == "GET":
        tasks = list(Task.objects.all().values())
        return JsonResponse({"tasks": tasks})
    return HttpResponseNotAllowed(["GET"])

# Update Task
@csrf_exempt
def update_task(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    
    if request.method == "PUT":
        data = json.loads(request.body)
        form = TaskForm(data, instance=task)
        if form.is_valid():
            form.save()
            return JsonResponse({"success": True})
        return JsonResponse({"success": False, "errors": form.errors}, status=400)
    return HttpResponseNotAllowed(["PUT"])

# Delete Task
@csrf_exempt
def delete_task(request, task_id):
    if request.method == "DELETE":
        try:
            task = Task.objects.get(id=task_id)
            task.delete()
            return JsonResponse({"success": True})
        except Task.DoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)
    return HttpResponseNotAllowed(["DELETE"])

#################### Comments ####################

# Create Comment
@csrf_exempt
def create_comment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        form = CommentForm(data)
        if form.is_valid():
            comment = form.save()
            return JsonResponse({"success": True, "comment_id": comment.id})
        return JsonResponse({"success": False, "errors": form.errors}, status=400)
    return HttpResponseNotAllowed(["POST"])

# Read List of all Comments
def list_comments(request, task_id):
    if request.method == "GET":
        comments = list(Comment.objects.filter(task_id=task_id).values())
        return JsonResponse({"comments": comments})
    return HttpResponseNotAllowed(["GET"])

# Update Comment
@csrf_exempt
def update_comment(request, comment_id):
    if request.method == "PUT":
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            return JsonResponse({"error": "Comment not found"}, status=404)

        data = json.loads(request.body)
        content = data.get("content")
        if not content:
            return JsonResponse({"error": "Content is required"}, status=400)

        comment.content = content
        comment.save()
        return JsonResponse({"success": True})
    
    return HttpResponseNotAllowed(["PUT"])

# Delete Comment
@csrf_exempt
def delete_comment(request, comment_id):
    if request.method == "DELETE":
        try:
            comment = Comment.objects.get(id=comment_id)
            comment.delete()
            return JsonResponse({"success": True})
        except Comment.DoesNotExist:
            return JsonResponse({"error": "Comment not found"}, status=404)
    return HttpResponseNotAllowed(["DELETE"])
