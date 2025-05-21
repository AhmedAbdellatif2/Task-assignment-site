from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.SignUp, name="auth/signup"),
    path("check-username/", views.check_username, name="auth/check-username"),
    path("login/", views.Login, name="auth/login"),
    path("logout/", views.user_logout, name="auth/logout"),
]
