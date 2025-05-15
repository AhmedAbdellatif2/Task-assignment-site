from django.shortcuts import render

# Create your views here.
def SignUp(request):
    return render(request, '_admin/signup.html')

def Login(request):
    return render(request, '_admin/login.html')

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