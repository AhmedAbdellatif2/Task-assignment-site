from django.shortcuts import render
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from .models import Teacher, Admin
from django.contrib.auth.hashers import make_password,check_password
# Create your views here.


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
        user_type = request.POST.get('role')  # Determine user type (teacher or admin)
        name = request.POST.get('name')
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email')


        # Check if the username or email already exists
        if user_type == 'teacher':
            if teacher.objects.filter(username=username).exists():
                messages.error(request, "Username already exists")
                return redirect('signup')
            if Teacher.objects.filter(email=email).exists():
                messages.error(request, "Email already exists")
                return redirect('signup')

            # Check if password is strong
            if not is_strong_password(password):
                messages.error(request, "Password must be at least 8 characters long and contain at least one digit, one special character, and the first letter should be capitalized")
                return redirect('signup')

            # Create new teacher
            hashed_password = make_password(password)
            # add avatar_url
            avatar_url = request.POST.get('avatar_url')  # Assuming you have a field for avatar URL

            teacher = Teacher(name=name, username=username, password=hashed_password, email=email, avatar_url=avatar_url)
            # Set default avatar URL if not provided
            if not avatar_url:
                teacher.avatar_url = ''
            teacher.save()
            messages.success(request, "Teacher registration successful")
            return redirect('login_user')

        elif user_type == 'admin':
            if Admin.objects.filter(username=username).exists():
                messages.error(request, "Username already exists")
                return redirect('signup')
            if Admin.objects.filter(email=email).exists():
                messages.error(request, "Email already exists")
                return redirect('signup')

            # Check if password is strong
            if not is_strong_password(password):
                messages.error(request, "Password must be at least 8 characters long and contain at least one digit, one special character, and the first letter should be capitalized")
                return redirect('signup')
            avatar_url = request.POST.get('avatar_url')  # Assuming you have a field for avatar URL
            # add avatar_url

            # Create new admin
            hashed_password = make_password(password)

            admin = Admin(name=name, username=username, password=hashed_password, email=email,avatar_url=avatar_url)
            # Set default avatar URL if not provided
            if not avatar_url:
                admin.avatar_url = ''
            admin.save()
            messages.success(request, "Admin registration successful")
            return redirect('login_user')

        else:
            messages.error(request, "Invalid user type")
            return redirect('signup')

    return render(request, '_admin/signup.html')

def Login(request):
    if request.method == 'POST':
        role = request.POST.get('role')  # Determine user type (teacher or admin)
        username = request.POST.get('username')
        password = request.POST.get('password')

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
