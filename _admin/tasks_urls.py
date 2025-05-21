from django.urls import path
from . import views

urlpatterns = [
    path("", views.tasks, name="tasks"),
    path("<int:task_id>/", views.get_task, name="get_by_id"),
]