from django.urls import path, include
from django.urls import path, include
from . import views

urlpatterns = [
        # Task  URLs
    path('tasks/create/', views.create_task, name='create_task'),
    path('tasks/', views.list_tasks, name='list_tasks'),
    path('tasks/update/<int:task_id>/', views.update_task, name='update_task'),
    path('tasks/delete/<int:task_id>/', views.delete_task, name='delete_task'),
    # Comment URLs
    path('comments/create/', views.create_comment, name='create_comment'),
    path('comments/<int:task_id>/', views.list_comments, name='list_comments'),
    path('comments/update/<int:comment_id>/', views.update_comment, name='update_comment'),
    path('comments/delete/<int:comment_id>/', views.delete_comment, name='delete_comment'),
    
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
    path('auth/',include("_admin.auth_urls")),
    
]