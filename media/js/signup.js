document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input, select');

    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }

    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors();

        const formData = {
            name: getValue('name'),
            username: getValue('username'),
            email: getValue('email'),
            password: getValue('password'),
            confirmPassword: getValue('confirm-password'),
            role: getValue('role')
        };

        const validationResults = validateForm(formData);

        if (validationResults.isValid) {
            saveUser({
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            alert('Signup successful!');
            window.location.href = 'login.html';
        } else {
            validationResults.errors.forEach(({ field, message }) => {
                showError(field, message);
            });
        }
    });

    function getValue(id) {
        return document.getElementById(id).value.trim();
    }

    function validateField(input) {
        const fieldId = input.id;
        const value = input.value.trim();
        clearError(fieldId);

        const formData = {
            name: getValue('name'),
            username: getValue('username'),
            email: getValue('email'),
            password: getValue('password'),
            confirmPassword: getValue('confirm-password'),
            role: getValue('role')
        };

        let error = null;

        if (fieldId === 'name' && !value) {
            error = { field: 'name', message: 'Full name is required' };
        } else if (fieldId === 'username') {
            if (!value) {
                error = { field: 'username', message: 'Username is required' };
            } else if (usernameExists(value)) {
                error = { field: 'username', message: 'Username already taken' };
            }
        } else if (fieldId === 'email') {
            if (!value) {
                error = { field: 'email', message: 'Email is required' };
            } else if (!EMAIL_REGEX.test(value)) {
                error = { field: 'email', message: 'Invalid email format' };
            }
        } else if (fieldId === 'password') {
            if (!value) {
                error = { field: 'password', message: 'Password is required' };
            } else if (!PASSWORD_REGEX.test(value)) {
                error = {
                    field: 'password',
                    message: 'Password must be 8+ chars with uppercase, lowercase, number & special char'
                };
            }
        } else if (fieldId === 'confirm-password') {
            if (!value) {
                error = { field: 'confirm-password', message: 'Please confirm your password' };
            } else if (value !== formData.password) {
                error = { field: 'confirm-password', message: 'Passwords do not match' };
            }
        } else if (fieldId === 'role' && !value) {
            error = { field: 'role', message: 'Please select a role' };
        }

        if (error) {
            showError(error.field, error.message);
        }
    }

    function validateForm(data) {
        const errors = [];

        if (!data.name) {
            errors.push({ field: 'name', message: 'Full name is required' });
        }

        if (!data.username) {
            errors.push({ field: 'username', message: 'Username is required' });
        } else if (usernameExists(data.username)) {
            errors.push({ field: 'username', message: 'Username already taken' });
        }

        if (!data.email) {
            errors.push({ field: 'email', message: 'Email is required' });
        } else if (!EMAIL_REGEX.test(data.email)) {
            errors.push({ field: 'email', message: 'Invalid email format' });
        }

        if (!data.password) {
            errors.push({ field: 'password', message: 'Password is required' });
        } else if (!PASSWORD_REGEX.test(data.password)) {
            errors.push({
                field: 'password',
                message: 'Password must be 8+ chars with uppercase, lowercase, number & special char'
            });
        }

        if (!data.confirmPassword) {
            errors.push({ field: 'confirm-password', message: 'Please confirm your password' });
        } else if (data.password !== data.confirmPassword) {
            errors.push({ field: 'confirm-password', message: 'Passwords do not match' });
        }


        if (!data.role) {
            errors.push({ field: 'role', message: 'Please select a role' });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    function usernameExists(username) {
        const users = JSON.parse(localStorage.getItem('users'));
        return users.some(user => user.username.toLowerCase() === username.toLowerCase());
    }

    function saveUser(user) {
        const users = JSON.parse(localStorage.getItem('users'));
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    function showError(fieldId, message) {
        const inputGroup = document.getElementById(fieldId).parentElement;
        const errorElement = document.createElement('small');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#ff4444';
        errorElement.style.marginTop = '8px';
        inputGroup.appendChild(errorElement);
    }

    function clearError(fieldId) {
        const inputGroup = document.getElementById(fieldId).parentElement;
        const errorElement = inputGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }
});