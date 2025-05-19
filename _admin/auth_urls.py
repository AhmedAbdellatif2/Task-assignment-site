from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.SignUp, name="auth/signup"),
    path("check-username/", views.check_username, name="auth/check-username"),
]
