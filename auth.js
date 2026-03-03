// Auth Logic

document.addEventListener('DOMContentLoaded', () => {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');
            
            btn.disabled = true;
            btn.textContent = 'Logging in...';
            
            try {
                const data = await AuthAPI.login(email, password);
                showToast('Login successful!');
                
                // Redirect based on role
                if (data.user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
                
            } catch (error) {
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        });
    }
    
    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                full_name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value,
                account_type: document.getElementById('accountType').value,
                preferred_currency: document.getElementById('currency').value
            };
            
            const btn = signupForm.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Creating account...';
            
            try {
                await AuthAPI.signup(userData);
                showToast('Account created! Please login.');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                
            } catch (error) {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        });
    }
    
    // Check auth on protected pages
    const protectedPages = ['dashboard.html', 'admin-dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        if (!TokenManager.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    }
    
    // Redirect if already logged in (on login page)
    if (currentPage === 'index.html' || currentPage === '') {
        if (TokenManager.isAuthenticated()) {
            if (TokenManager.isAdmin()) {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    }
});