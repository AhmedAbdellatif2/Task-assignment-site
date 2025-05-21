from django.urls import path
from . import views

urlpatterns = [
    path("", views.tasks, name="tasks"),
    path("<int:task_id>/", views.get_task, name="get_by_id"),
    path("<int:task_id>/update/", views.update_task, name="update_task"),
    path("<int:task_id>/comments/", views.get_task_comments, name="get_task_comments"),
    path("<int:task_id>/comments/add/", views.add_task_comment, name="add_task_comment"),
]