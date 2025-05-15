from django.shortcuts import render
from .forms import SignUpForm

# Create your views here.
def SignUp(request):
    if request.method == 'POST':
        form = SignUp(request.POST)
        if form.is_valid():
            form.save()
            
    return render(request, '../templates/admin/signup.html', {'form': SignUpForm()})