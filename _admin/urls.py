from django.urls import path, include
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.SignUp, name='signup'),
    path('login/', views.Login, name='login'),
    path('dashboard/', views.Dashboard, name='dashboard'),
    path('tasks/', views.Tasks, name='tasks'),
    path('editpage/', views.EditPage, name='editpage'),
    path('profile/', views.Profile, name='profile'),
    path('settings/', views.Settings, name='settings'),
    path('search/', views.Search, name='search'),
    path('teacher_task/', views.teacher_task, name='teacher_task'),
    path('teachers_task_list/', views.teachers_task_list, name='teachers_task_list'),
    path('auth/',include("_admin.auth_urls"))
    path('auth/',include("_admin.auth_urls"))
]