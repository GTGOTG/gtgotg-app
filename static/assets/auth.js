// Authentication Module for GTGOTG
class AuthManager {
    constructor() {
        this.baseURL = '/api/auth';
        this.token = localStorage.getItem('gtgotg_token');
        this.user = null;
        this.init();
    }

    async init() {
        if (this.token) {
            await this.verifyToken();
        }
        this.updateUI();
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.auth_token;
                this.user = data.user;
                localStorage.setItem('gtgotg_token', this.token);
                this.updateUI();
                return { success: true, message: data.message, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.auth_token;
                this.user = data.user;
                localStorage.setItem('gtgotg_token', this.token);
                this.updateUI();
                return { success: true, message: data.message, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async logout() {
        try {
            if (this.token) {
                await fetch(`${this.baseURL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.token = null;
            this.user = null;
            localStorage.removeItem('gtgotg_token');
            this.updateUI();
        }
    }

    async verifyToken() {
        try {
            const response = await fetch(`${this.baseURL}/verify-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                return true;
            } else {
                this.token = null;
                this.user = null;
                localStorage.removeItem('gtgotg_token');
                return false;
            }
        } catch (error) {
            this.token = null;
            this.user = null;
            localStorage.removeItem('gtgotg_token');
            return false;
        }
    }

    async getProfile() {
        try {
            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                return { success: true, user: data.user };
            } else {
                const data = await response.json();
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (response.ok) {
                this.user = data.user;
                this.updateUI();
                return { success: true, message: data.message, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    isAuthenticated() {
        return this.token && this.user;
    }

    getAuthHeaders() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const businessOwnerBtn = document.getElementById('business-owner-btn');
        const userMenu = document.getElementById('user-menu');

        if (this.isAuthenticated()) {
            // Hide login/signup buttons
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            
            // Update business owner button
            if (businessOwnerBtn) {
                if (this.user.is_business_owner) {
                    businessOwnerBtn.textContent = '🏢 My Business';
                    businessOwnerBtn.onclick = () => this.showBusinessDashboard();
                } else {
                    businessOwnerBtn.textContent = '🏢 Claim Business';
                    businessOwnerBtn.onclick = () => this.showBusinessClaim();
                }
            }

            // Show user menu
            this.createUserMenu();
        } else {
            // Show login/signup buttons
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (signupBtn) signupBtn.style.display = 'inline-block';
            
            // Reset business owner button
            if (businessOwnerBtn) {
                businessOwnerBtn.textContent = '🏢 Business Owner?';
                businessOwnerBtn.onclick = () => this.showLoginPrompt('business');
            }

            // Hide user menu
            if (userMenu) userMenu.remove();
        }
    }

    createUserMenu() {
        let userMenu = document.getElementById('user-menu');
        if (userMenu) userMenu.remove();

        userMenu = document.createElement('div');
        userMenu.id = 'user-menu';
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-menu-trigger">
                <img src="${this.user.profile_picture || '/assets/default-avatar.png'}" alt="Profile" class="user-avatar">
                <span class="user-name">${this.user.full_name}</span>
                <span class="dropdown-arrow">▼</span>
            </div>
            <div class="user-menu-dropdown" style="display: none;">
                <a href="#" onclick="auth.showProfile()">👤 My Profile</a>
                <a href="#" onclick="auth.showMyReviews()">⭐ My Reviews</a>
                <a href="#" onclick="auth.showMyPhotos()">📸 My Photos</a>
                ${this.user.is_business_owner ? '<a href="#" onclick="auth.showBusinessDashboard()">🏢 My Business</a>' : ''}
                <hr>
                <a href="#" onclick="auth.logout()">🚪 Logout</a>
            </div>
        `;

        // Insert user menu after business owner button
        const businessOwnerBtn = document.getElementById('business-owner-btn');
        if (businessOwnerBtn) {
            businessOwnerBtn.parentNode.insertBefore(userMenu, businessOwnerBtn.nextSibling);
        }

        // Add dropdown functionality
        const trigger = userMenu.querySelector('.user-menu-trigger');
        const dropdown = userMenu.querySelector('.user-menu-dropdown');
        
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    showLoginForm() {
        this.showModal('Login to GTGOTG', `
            <form id="login-form" class="auth-form">
                <div class="form-group">
                    <label for="login-email">Email Address</label>
                    <input type="email" id="login-email" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Login</button>
                    <button type="button" class="btn btn-secondary" onclick="auth.closeModal()">Cancel</button>
                </div>
                <div class="form-footer">
                    <p>Don't have an account? <a href="#" onclick="auth.showSignupForm()">Sign up here</a></p>
                </div>
            </form>
        `);

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const result = await this.login(email, password);
            if (result.success) {
                this.closeModal();
                this.showMessage('Welcome back!', 'success');
            } else {
                this.showMessage(result.error, 'error');
            }
        });
    }

    showSignupForm() {
        this.showModal('Join GTGOTG', `
            <form id="signup-form" class="auth-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="signup-firstname">First Name</label>
                        <input type="text" id="signup-firstname">
                    </div>
                    <div class="form-group">
                        <label for="signup-lastname">Last Name</label>
                        <input type="text" id="signup-lastname">
                    </div>
                </div>
                <div class="form-group">
                    <label for="signup-username">Username</label>
                    <input type="text" id="signup-username" required>
                </div>
                <div class="form-group">
                    <label for="signup-email">Email Address</label>
                    <input type="email" id="signup-email" required>
                </div>
                <div class="form-group">
                    <label for="signup-password">Password</label>
                    <input type="password" id="signup-password" required>
                    <small>Must be at least 8 characters with letters and numbers</small>
                </div>
                <div class="form-group">
                    <label for="signup-location">Location (Optional)</label>
                    <input type="text" id="signup-location" placeholder="City, State">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Create Account</button>
                    <button type="button" class="btn btn-secondary" onclick="auth.closeModal()">Cancel</button>
                </div>
                <div class="form-footer">
                    <p>Already have an account? <a href="#" onclick="auth.showLoginForm()">Login here</a></p>
                </div>
            </form>
        `);

        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                first_name: document.getElementById('signup-firstname').value,
                last_name: document.getElementById('signup-lastname').value,
                username: document.getElementById('signup-username').value,
                email: document.getElementById('signup-email').value,
                password: document.getElementById('signup-password').value,
                location: document.getElementById('signup-location').value
            };
            
            const result = await this.register(userData);
            if (result.success) {
                this.closeModal();
                this.showMessage('Account created successfully! Welcome to GTGOTG!', 'success');
            } else {
                this.showMessage(result.error, 'error');
            }
        });
    }

    showLoginPrompt(context = 'general') {
        let message = 'Please login to access this feature.';
        if (context === 'business') {
            message = 'Please login to access business owner features.';
        }
        
        this.showMessage(message, 'info');
        setTimeout(() => this.showLoginForm(), 1000);
    }

    showModal(title, content) {
        // Remove existing modal
        const existingModal = document.getElementById('auth-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="auth.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Close modal when clicking overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    closeModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.remove();
    }

    showMessage(message, type = 'info') {
        // Remove existing message
        const existingMessage = document.getElementById('auth-message');
        if (existingMessage) existingMessage.remove();

        const messageEl = document.createElement('div');
        messageEl.id = 'auth-message';
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;

        document.body.appendChild(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) messageEl.remove();
        }, 5000);
    }

    // Placeholder methods for future implementation
    showProfile() {
        this.showMessage('Profile management coming soon!', 'info');
    }

    showMyReviews() {
        this.showMessage('Review management coming soon!', 'info');
    }

    showMyPhotos() {
        this.showMessage('Photo management coming soon!', 'info');
    }

    showBusinessDashboard() {
        this.showMessage('Business dashboard coming soon!', 'info');
    }

    showBusinessClaim() {
        this.showMessage('Business claiming coming soon!', 'info');
    }
}

// Initialize authentication manager
const auth = new AuthManager();

