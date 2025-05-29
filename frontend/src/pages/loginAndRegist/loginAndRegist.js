// Auth Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Tab switching functionality
    initTabSwitching();

    // Form validation
    initFormValidation();

    // Social login handlers
    initSocialLogin();

    // Password visibility toggle
    initPasswordToggle();

    // Form submission handlers
    initFormSubmission();
});

// Tab Switching
function initTabSwitching() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabType = this.getAttribute('data-tab');

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');

            // Show/hide forms with animation
            if (tabType === 'login') {
                showForm(loginForm, registerForm);
            } else {
                showForm(registerForm, loginForm);
            }
        });
    });
}

function showForm(showElement, hideElement) {
    hideElement.style.opacity = '0';
    setTimeout(() => {
        hideElement.classList.add('hidden');
        showElement.classList.remove('hidden');
        showElement.style.opacity = '0';
        setTimeout(() => {
            showElement.style.opacity = '1';
        }, 50);
    }, 150);
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('.auth-form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;

    // Xóa thông báo lỗi cũ
    clearFieldError(field);

    // Kiểm tra trường bắt buộc
    if (!value) {
        showFieldError(field, `${getFieldLabel(field)} is required`);
        return false;
    }

    // Kiểm tra mật khẩu
    if (fieldType === 'password') {
        // Kiểm tra mật khẩu chính
        if (fieldName === 'password') {
            if (value.length < 8) {
                showFieldError(field, 'Password must be at least 8 characters long');
                return false;
            }

            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumbers = /\d/.test(value);

            if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
                showFieldError(field, 'Password must contain uppercase, lowercase, and numbers');
                return false;
            }
        }
        // Kiểm tra xác nhận mật khẩu
        else if (fieldName === 'confirm-password') {
            // Tìm trường mật khẩu trong cùng form
            const passwordField = field.closest('form').querySelector('input[name="password"]');
            if (passwordField && value !== passwordField.value) {
                showFieldError(field, 'Passwords do not match');
                return false;
            }
        }
    }

    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');

    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function getFieldLabel(field) {
    const label = field.parentNode.querySelector('label');
    return label ? label.textContent : field.name;
}

// Password Toggle Functionality
function initPasswordToggle() {
    const passwordFields = document.querySelectorAll('input[type="password"]');

    passwordFields.forEach(field => {
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle';
        toggleButton.innerHTML = '👁️';
        toggleButton.setAttribute('aria-label', 'Toggle password visibility');

        // Style the toggle button
        toggleButton.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #777;
        `;

        // Make parent relative
        field.parentNode.style.position = 'relative';
        field.style.paddingRight = '45px';

        field.parentNode.appendChild(toggleButton);

        toggleButton.addEventListener('click', () => {
            if (field.type === 'password') {
                field.type = 'text';
                toggleButton.innerHTML = '🙈';
            } else {
                field.type = 'password';
                toggleButton.innerHTML = '👁️';
            }
        });
    });
}

// Social Login
function initSocialLogin() {
    const googleBtns = document.querySelectorAll('.social-btn:first-child');
    const facebookBtns = document.querySelectorAll('.social-btn:last-child');

    googleBtns.forEach(btn => {
        btn.addEventListener('click', () => handleGoogleLogin());
    });

    facebookBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFacebookLogin());
    });
}

function handleGoogleLogin() {
    showLoading('Connecting to Google...');

    // Simulate API call
    setTimeout(() => {
        hideLoading();
        showNotification('Google login functionality would be implemented here', 'info');
    }, 2000);
}

function handleFacebookLogin() {
    showLoading('Connecting to Facebook...');

    // Simulate API call
    setTimeout(() => {
        hideLoading();
        showNotification('Facebook login functionality would be implemented here', 'info');
    }, 2000);
}

// Form Submission
function initFormSubmission() {
    const loginForm = document.querySelector('#login-form .auth-form');
    const registerForm = document.querySelector('#register-form .auth-form');

    loginForm.addEventListener('submit', handleLoginSubmit);
    registerForm.addEventListener('submit', handleRegisterSubmit);
}

function handleLoginSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Validate all fields
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        showNotification('Please fix the errors above', 'error');
        return;
    }

    // Show loading
    showLoading('Signing in...');

    // Simulate API call
    setTimeout(() => {
        hideLoading();

        // Simulate successful login
        if (data.email && data.password) {
            showNotification('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                // Redirect to dashboard or home page
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification('Invalid credentials', 'error');
        }
    }, 2000);
}

function handleRegisterSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Validate all fields
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    // Check terms acceptance
    const termsCheckbox = form.querySelector('input[name="terms"]');
    if (!termsCheckbox.checked) {
        showNotification('Please accept the Terms & Conditions', 'error');
        isValid = false;
    }

    if (!isValid) {
        showNotification('Please fix the errors above', 'error');
        return;
    }

    // Show loading
    showLoading('Creating account...');

    // Simulate API call
    setTimeout(() => {
        hideLoading();

        // Simulate successful registration
        showNotification('Account created successfully! Please check your email for verification.', 'success');

        // Switch to login tab after successful registration
        setTimeout(() => {
            document.querySelector('.auth-tab[data-tab="login"]').click();
            form.reset();
        }, 2000);
    }, 3000);
}

// Loading and Notification Functions
function showLoading(message = 'Loading...') {
    // Remove existing loading
    hideLoading();

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;

    // Add loading styles
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;

    const loadingContent = loadingDiv.querySelector('.loading-content');
    loadingContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    `;

    const spinner = loadingDiv.querySelector('.loading-spinner');
    spinner.style.cssText = `
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #333;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    `;

    // Add spinner animation
    if (!document.querySelector('#spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
    `;

    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    notification.style.backgroundColor = colors[type] || colors.info;

    // Add slide-in animation
    if (!document.querySelector('#notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification.error input {
                border-color: #dc3545 !important;
            }
            
            .error-message {
                color: #dc3545;
                font-size: 12px;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.remove();
    });
}

// Forgot Password Handler
function initForgotPassword() {
    const forgotLinks = document.querySelectorAll('.forgot-password');

    forgotLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showForgotPasswordModal();
        });
    });
}

function showForgotPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'forgot-password-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Reset Password</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Enter your email address and we'll send you a link to reset your password.</p>
                <form class="forgot-password-form">
                    <div class="form-group">
                        <label for="forgot-email">Email Address</label>
                        <input type="email" id="forgot-email" name="email" required>
                    </div>
                    <button type="submit" class="auth-button">Send Reset Link</button>
                </form>
            </div>
        </div>
    `;

    // Modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    `;

    const modalHeader = modal.querySelector('.modal-header');
    modalHeader.style.cssText = `
        padding: 20px 20px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const modalBody = modal.querySelector('.modal-body');
    modalBody.style.cssText = `
        padding: 20px;
    `;

    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #777;
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Form submission
    const form = modal.querySelector('.forgot-password-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[name="email"]').value;

        if (email) {
            showLoading('Sending reset link...');
            setTimeout(() => {
                hideLoading();
                modal.remove();
                showNotification('Password reset link sent to your email!', 'success');
            }, 2000);
        }
    });
}

// Initialize forgot password functionality
initForgotPassword();

// Utility function to handle API calls (for future use)
async function apiCall(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Something went wrong');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Export functions for potential use in other scripts
window.AuthJS = {
    showNotification,
    showLoading,
    hideLoading,
    validateField,
    apiCall
};

function handleRegisterSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Validate all fields
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        showNotification('Please fix the errors above', 'error');
        return;
    }

    // Get existing users or create empty array
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if email already exists
    if (users.find(user => user.email === data.email)) {
        showNotification('Email already registered', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        firstName: data.firstname,
        lastName: data.lastname,
        email: data.email,
        password: data.password // In real app, should hash password
    };

    // Add user to array and save
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showNotification('Registration successful! Please login.', 'success');

    // Switch to login tab
    setTimeout(() => {
        document.querySelector('.auth-tab[data-tab="login"]').click();
        form.reset();
    }, 1500);
}

function handleLoginSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Validate fields
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        showNotification('Please fix the errors above', 'error');
        return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find user by email and password
    const user = users.find(u => u.email === data.email && u.password === data.password);

    if (user) {
        // Store login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        }));

        showNotification('Login successful! Redirecting...', 'success');

        // Xác định base path tới thư mục chứa "src"
        const pathParts = window.location.pathname.split('/');
        const srcIndex = pathParts.indexOf('src');
        const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';

        // Redirect after successful login
        setTimeout(() => {
            window.location.href = baseURL + 'index.html';
        }, 1500);
    } else {
        showNotification('Invalid email or password', 'error');
    }
}