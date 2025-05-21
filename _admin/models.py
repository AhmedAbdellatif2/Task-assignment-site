from django.db import models
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

# Create your models here.

class Teacher(models.Model):
    name = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.EmailField()
    avatar_url = models.URLField(blank=True, null=True)  # URL field for avatar image
    joined_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name   
       # return self.user.username
      
class Admin(models.Model):
    name = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.EmailField()
    avatar_url = models.URLField(blank=True, null=True)  # URL field for avatar image
    joined_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    def __str__(self):
         return self.name  
        # return self.user.username 
class Task(models.Model):
    task_id = models.AutoField(primary_key=True)
    task_title = models.CharField(max_length=100)
    task_description  = models.TextField()
    due_date = models.DateTimeField()
    start_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed')])
    perioty = models.CharField(max_length=20, choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')])
    assigned_to = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.task_title
class Comment(models.Model):
    comment_id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, related_name='comments', on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    admin = models.ForeignKey(Admin, on_delete=models.SET_NULL, null=True, blank=True)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.teacher:
            author = self.teacher.username
        elif self.admin:
            author = self.admin.username
        else:
            author = "Unknown"
        return f"Comment by {author} on {self.created_at}"