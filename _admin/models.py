from django.db import models

# Create your models here.
class SignUp(models.Model):
    full_name = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    email = models.EmailField()
    password = models.CharField(max_length=100)
    confirm_password = models.CharField(max_length=100)
    role = models.CharField(choices=[('0', 'Teacher'), ('1', 'Admin')])
    
    def __str__(self):
        return self.full_name
    
    class Meta:
        verbose_name = 'Sign Up Form'
        ordering = ['full_name']