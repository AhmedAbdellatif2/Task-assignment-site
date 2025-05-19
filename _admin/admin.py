from django.contrib import admin
from .models import  Teacher, Admin, Task, Comment
# Register your models here.

admin.site.register(Teacher)
admin.site.register(Admin)
admin.site.register(Task)
admin.site.register(Comment)
