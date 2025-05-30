const serverBaseURL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : "https://server-project-web.vercel.app";

document.addEventListener('DOMContentLoaded', function () {
    // Bootstrap tab: không cần JS custom, chỉ cần data-bs-toggle/tab
    // Form validation
    initFormValidation();

    // Password visibility toggle
    initPasswordToggle();

    // Form submission handlers
    initFormSubmission();
});

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                showNotification('Please fix the errors above', 'error');
            }
            form.classList.add('was-validated');
        }, false);
    });
}

// Password Toggle Functionality
function initPasswordToggle() {
    document.querySelectorAll('input[type="password"]').forEach(field => {
        const wrapper = field.parentNode;
        wrapper.style.position = 'relative';
        field.style.paddingRight = '40px';

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y px-2';
        toggleBtn.tabIndex = -1;
        toggleBtn.innerHTML = '<span class="fa fa-eye"></span>';
        toggleBtn.style.zIndex = 2;

        toggleBtn.addEventListener('click', function () {
            if (field.type === 'password') {
                field.type = 'text';
                toggleBtn.innerHTML = '<span class="fa fa-eye-slash"></span>';
            } else {
                field.type = 'password';
                toggleBtn.innerHTML = '<span class="fa fa-eye"></span>';
            }
        });

        wrapper.appendChild(toggleBtn);
    });
}

// Form Submission
function initFormSubmission() {
    // Login
    const loginForm = document.querySelector('#login-form form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!loginForm.checkValidity()) return;

            const email = loginForm.querySelector('[name="email"]').value.trim();
            const password = loginForm.querySelector('[name="password"]').value;

            try {
                const response = await fetch(`${serverBaseURL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Lưu token vào localStorage nếu muốn
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUser', JSON.stringify({ email }));
                    // Log token to console for debugging
                    console.log('accessToken', data.accessToken);
                    console.log('refreshToken', data.refreshToken);

                    const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
                    const role = payload.role;

                    showNotification('Login successful! Redirecting...', 'success');
                    // Xác định base path tới thư mục chứa "src"
                    const pathParts = window.location.pathname.split('/');
                    const srcIndex = pathParts.indexOf('src');
                    const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';
                    setTimeout(() => {
                        if (role === 'admin') {
                            window.location.href = baseURL + 'pages/adminPage/productPage/product-page.html';
                        } else {
                            window.location.href = baseURL + 'index.html';
                        } // Redirect to home page
                    }, 1200);
                } else {
                    showNotification(data.message || 'Invalid email or password', 'error');
                }
            } catch (error) {
                showNotification('Login failed: ' + error.message, 'error');
            }
        });
    }


    // Register
    const registerForm = document.querySelector('#register-form form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!registerForm.checkValidity()) return;

            const firstName = registerForm.querySelector('[name="firstname"]').value.trim();
            const lastName = registerForm.querySelector('[name="lastname"]').value.trim();
            const email = registerForm.querySelector('[name="email"]').value.trim();
            const password = registerForm.querySelector('[name="password"]').value;
            const confirmPassword = registerForm.querySelector('[name="confirm-password"]').value;
            const terms = registerForm.querySelector('[name="terms"]').checked;

            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                registerForm.querySelector('[name="confirm-password"]').classList.add('is-invalid');
                return;
            }

            if (!terms) {
                showNotification('You must agree to the Terms & Conditions', 'error');
                return;
            }

            try {
                const response = await fetch(`${serverBaseURL}/users/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: firstName + ' ' + lastName,
                        email,
                        password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showNotification('Registration successful! Please login.', 'success');
                    setTimeout(() => {
                        // Chuyển sang tab login
                        const loginTab = document.querySelector('#login-tab');
                        if (loginTab) new bootstrap.Tab(loginTab).show();
                        registerForm.reset();
                        registerForm.classList.remove('was-validated');
                    }, 1200);
                } else {
                    showNotification(data.message || 'Registration failed', 'error');
                }
            } catch (error) {
                showNotification('Registration failed: ' + error.message, 'error');
            }
        });
    }
}

// Notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type === 'error' ? 'danger' : type} position-fixed top-0 end-0 m-4`;
    notification.style.zIndex = 9999;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3500);
}