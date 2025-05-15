from django import forms
from .models import SignUp

class SignUpForm(forms.ModelForm):
    class Meta:
        model = SignUp
        fields = '__all__'
        widgets = {
            'full_name': forms.TextInput(attrs={'placeholder': 'Full Name', 'style': 'margin-bottom: 2px;'}),
            'username': forms.TextInput(attrs={'placeholder': 'Username', 'style': 'margin-bottom: 2px;'}),
            'email': forms.EmailInput(attrs={'placeholder': 'Email', 'style': 'margin-bottom: 2px;'}),
            'password': forms.PasswordInput(attrs={'placeholder': 'Password', 'style': 'margin-bottom: 2px;'}),
            'confirm_password': forms.PasswordInput(attrs={'placeholder': 'Confirm Password', 'style': 'margin-bottom: 2px;'}),
            'role': forms.Select(attrs={'placeholder': 'Admin - Teacher', 'style': 'margin-bottom: 2px;'}),
        }