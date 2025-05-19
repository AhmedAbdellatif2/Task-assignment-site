from django.urls import path
from . import views

urlpatterns = [
    path("",views.SignUp,name="auth/signup"),
] 
from django.urls import path
from . import views

urlpatterns = [
    path("",views.SignUp,name="auth/signup"),
]