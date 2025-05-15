from django.contrib import admin
from .models import SignUp

# Register your models here.
class SignUpAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'username', 'email', 'role')
    search_fields = ('full_name', 'username', 'email')
    list_filter = ('role',)
    ordering = ('full_name',)
    
admin.site.register(SignUp, SignUpAdmin)