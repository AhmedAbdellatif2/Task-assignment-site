from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.SignUp, name='signup'),
    path('login/', views.Login, name='login'),
    path('Admindashboard/', views.Dashboard, name='dashboard'),
    path('addtask/', views.addtask, name='addtask'),
    path('addtask/api/', views.addtask_api, name='addtask_api'),
    path('editpage/', views.EditPage, name='editpage'),
    path('profile/', views.Profile, name='profile'),
    path('settings/', views.Settings, name='settings'),
    path('search/', views.Search, name='search'),
    path('teacher_task/', views.teacher_task, name='teacher_task'),
    path('teacher_task/data/', views.teacher_task_data, name='teacher_task_data'),
    path('teachers_task_list/', views.teachers_task_list, name='teachers_task_list'),
    path('auth/',include("_admin.auth_urls")),
    path('users/', views.users, name='users'),
    path('users/me', views.current_user, name='current_user'),
    path('users/me/', views.update_user_profile, name='update_user_profile'),
    path('users/me/password/', views.change_password, name='change_password'),
    path('user/preferences', views.user_preferences, name='user_preferences'),
    path('user/preferences/', views.user_preferences, name='user_preferences_update'),
    path('user/username/', views.update_username, name='update_username'),
    path('user/account', views.delete_account, name='delete_account'),
    path('tasks/',include("_admin.tasks_urls")),
    path('navbar/', views.navbar_partial, name='navbar_partial'),
]