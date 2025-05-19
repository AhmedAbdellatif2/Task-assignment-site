from django.shortcuts import render
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from .models import Teacher, Admin
from django.contrib.auth.hashers import make_password,check_password
from django.http import JsonResponse, HttpResponseBadRequest

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
def SignUp(request):
    if request.method == 'POST':
        if request.content_type != 'application/json':
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

    return  render(request, '_admin/signup.html')

def Login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        role = data.get('role')  # Determine user type (teacher or admin)
        username = data.get('username')
        password = data.POST.get('password')

        if role == 'teacher':
            try:
                teacher = Teacher.objects.get(username=username)
                # Check if the password matches using Django's check_password method
                if check_password(password, teacher.password):
                    # Store login info in session
                    request.session['teacher_id'] = teacher.id
                    request.session['username'] = teacher.username
                    return redirect('home')  # Redirect to homepage
                else:
                    messages.error(request, "Invalid password for teacher")
            except Teacher.DoesNotExist:
                messages.error(request, "Invalid username for teacher")

        elif role == 'admin':
            try:
                admin = Admin.objects.get(username=username)
                # Check if the password matches using Django's check_password method
                if check_password(password, admin.password):
                    # Store login info in session
                    request.session['admin_id'] = admin.id
                    request.session['username'] = admin.username
                    return redirect('home')  # Redirect to homepage
                else:
                    messages.error(request, "Invalid password for admin")
            except Admin.DoesNotExist:
                messages.error(request, "Invalid username for admin")

        else:
            messages.error(request, "Invalid role")

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