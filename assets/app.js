// GTGOTG - "Got To Go On The Go" Application JavaScript
// Copyright © 2025 Jessica Esposito / Colorado Quality LLC. All rights reserved.

console.log('🚽 GTGOTG - Got To Go On The Go - Initializing...');

// Application state
const AppState = {
    businesses: [],
    filteredBusinesses: [],
    currentFilter: '',
    currentUser: null,
    ratings: {
        overall: 0,
        cleanliness: 0,
        safety: 0,
        accessibility: 0
    },
    selectedBathroom: {
        type: null,
        wheelchair: false
    },
    selectedAmenities: []
};

// Sample business data
const sampleBusinesses = [
    {
        id: 1,
        name: "Shell Gas Station",
        category: "gas_station",
        address: "123 Main St, Downtown",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        phone: "(555) 123-4567",
        website: "https://shell.com",
        verified: true,
        ratings: {
            overall: 8.2,
            cleanliness: 8.5,
            safety: 8.0,
            accessibility: 7.8
        },
        reviewCount: 24,
        amenities: ["soap", "paper_towels", "hand_dryer", "baby_changing", "wheelchair_accessible"],
        hours: "24/7",
        publicAccess: true,
        lastUpdated: "2025-01-15"
    },
    {
        id: 2,
        name: "McDonald's",
        category: "restaurant",
        address: "456 Broadway Ave",
        city: "New York",
        state: "NY",
        zipCode: "10002",
        phone: "(555) 234-5678",
        website: "https://mcdonalds.com",
        verified: true,
        ratings: {
            overall: 7.8,
            cleanliness: 8.2,
            safety: 7.5,
            accessibility: 8.0
        },
        reviewCount: 18,
        amenities: ["soap", "paper_towels", "hand_dryer", "baby_changing"],
        hours: "6:00 AM - 11:00 PM",
        publicAccess: true,
        lastUpdated: "2025-01-14"
    },
    {
        id: 3,
        name: "Starbucks Coffee",
        category: "coffee_shop",
        address: "789 Coffee Lane",
        city: "New York",
        state: "NY",
        zipCode: "10003",
        phone: "(555) 345-6789",
        website: "https://starbucks.com",
        verified: true,
        ratings: {
            overall: 8.6,
            cleanliness: 9.0,
            safety: 8.2,
            accessibility: 8.5
        },
        reviewCount: 32,
        amenities: ["soap", "paper_towels", "hand_dryer", "wheelchair_accessible", "baby_changing"],
        hours: "5:30 AM - 10:00 PM",
        publicAccess: true,
        lastUpdated: "2025-01-16"
    },
    {
        id: 4,
        name: "Walmart Supercenter",
        category: "retail",
        address: "321 Shopping Blvd",
        city: "New York",
        state: "NY",
        zipCode: "10004",
        phone: "(555) 456-7890",
        website: "https://walmart.com",
        verified: true,
        ratings: {
            overall: 7.5,
            cleanliness: 7.8,
            safety: 7.2,
            accessibility: 8.8
        },
        reviewCount: 15,
        amenities: ["soap", "paper_towels", "hand_dryer", "wheelchair_accessible", "baby_changing", "family_restroom"],
        hours: "6:00 AM - 11:00 PM",
        publicAccess: true,
        lastUpdated: "2025-01-13"
    },
    {
        id: 5,
        name: "Target",
        category: "retail",
        address: "654 Retail Row",
        city: "New York",
        state: "NY",
        zipCode: "10005",
        phone: "(555) 567-8901",
        website: "https://target.com",
        verified: true,
        ratings: {
            overall: 8.4,
            cleanliness: 8.7,
            safety: 8.1,
            accessibility: 8.6
        },
        reviewCount: 21,
        amenities: ["soap", "paper_towels", "hand_dryer", "wheelchair_accessible", "baby_changing", "family_restroom"],
        hours: "8:00 AM - 10:00 PM",
        publicAccess: true,
        lastUpdated: "2025-01-15"
    }
];

// Utility functions
const utils = {
    formatRating: (rating) => {
        if (!rating || rating === 0) return 'N/A';
        return `${rating.toFixed(1)}/10`;
    },
    
    generateStars: (rating, maxStars = 10) => {
        if (!rating || rating === 0) return '☆'.repeat(maxStars);
        const filledStars = Math.floor(rating);
        const emptyStars = maxStars - filledStars;
        return '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
    },
    
    capitalizeWords: (str) => {
        return str.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },
    
    sanitizeInput: (input) => {
        return input.replace(/[<>\"']/g, '');
    },
    
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    showNotification: (message, type = 'info') => {
        console.log(`Notification (${type}): ${message}`);
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        if (notification && notificationText) {
            notificationText.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
    }
};

// Business Manager
const businessManager = {
    getBusinesses: (category = '') => {
        console.log('Getting businesses for category:', category);
        if (!category) return AppState.businesses;
        return AppState.businesses.filter(business => business.category === category);
    },
    
    getBusinessById: (id) => {
        return AppState.businesses.find(business => business.id === parseInt(id));
    },
    
    searchBusinesses: (query) => {
        if (!query) return AppState.businesses;
        
        const searchTerm = query.toLowerCase();
        return AppState.businesses.filter(business => 
            business.name.toLowerCase().includes(searchTerm) ||
            business.address.toLowerCase().includes(searchTerm) ||
            business.city.toLowerCase().includes(searchTerm) ||
            business.category.toLowerCase().includes(searchTerm)
        );
    }
};

// Authentication system
const auth = {
    users: [
        { id: 1, username: 'johndoe', email: 'john@example.com', password: 'password123', firstName: 'John', lastName: 'Doe', badgeLevel: 'Bronze', reviewCount: 8 },
        { id: 2, username: 'sarahj', email: 'sarah@example.com', password: 'password123', firstName: 'Sarah', lastName: 'Johnson', badgeLevel: 'Silver', reviewCount: 12 },
        { id: 3, username: 'admin', email: 'admin@gtgotg.com', password: 'gtgotg2025!', firstName: 'Admin', lastName: 'User', badgeLevel: 'Expert', reviewCount: 50, isAdmin: true }
    ],
    
    login: (username, password) => {
        console.log('Attempting login for:', username);
        const user = auth.users.find(u => 
            (u.username === username || u.email === username) && u.password === password
        );
        
        if (user) {
            AppState.currentUser = { ...user };
            delete AppState.currentUser.password;
            console.log('Login successful for:', user.username);
            return { success: true, user: AppState.currentUser };
        }
        
        console.log('Login failed for:', username);
        return { success: false, message: 'Invalid username or password' };
    },
    
    register: (userData) => {
        console.log('Attempting registration for:', userData.username);
        
        const existingUser = auth.users.find(u => 
            u.username === userData.username || u.email === userData.email
        );
        
        if (existingUser) {
            return { success: false, message: 'Username or email already exists' };
        }
        
        const newUser = {
            id: auth.users.length + 1,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            badgeLevel: 'Reviewer',
            reviewCount: 0,
            isAdmin: false
        };
        
        auth.users.push(newUser);
        console.log('Registration successful for:', newUser.username);
        return { success: true, user: newUser };
    },
    
    logout: () => {
        console.log('User logged out');
        AppState.currentUser = null;
    },
    
    getCurrentUser: () => {
        return AppState.currentUser;
    }
};

// Badge system
const badgeSystem = {
    getBadgeColor: (badgeLevel) => {
        const colors = {
            'Reviewer': '#6B7280',
            'Bronze': '#CD7F32',
            'Silver': '#C0C0C0',
            'Gold': '#FFD700',
            'Platinum': '#E5E4E2',
            'Expert': '#8B5CF6'
        };
        return colors[badgeLevel] || '#6B7280';
    },
    
    getNextBadge: (currentBadge) => {
        const progression = ['Reviewer', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Expert'];
        const currentIndex = progression.indexOf(currentBadge);
        return currentIndex < progression.length - 1 ? progression[currentIndex + 1] : null;
    }
};

// Review system
const reviewSystem = {
    submitReview: (businessId, reviewData) => {
        console.log('Submitting review for business:', businessId);
        console.log('Review data:', reviewData);
        
        if (AppState.currentUser) {
            AppState.currentUser.reviewCount++;
            
            if (AppState.currentUser.reviewCount % 5 === 0) {
                const nextBadge = badgeSystem.getNextBadge(AppState.currentUser.badgeLevel);
                if (nextBadge) {
                    AppState.currentUser.badgeLevel = nextBadge;
                }
            }
        }
        
        return { success: true, message: 'Review submitted successfully!' };
    }
};

// Admin system
const adminSystem = {
    loadUsers: () => {
        console.log('🔧 Loading users for admin panel');
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        
        usersList.innerHTML = auth.users.map(user => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h6>${user.firstName} ${user.lastName}</h6>
                    <p>@${user.username} | ${user.email}</p>
                    <span class="badge" style="background-color: ${badgeSystem.getBadgeColor(user.badgeLevel)}">${user.badgeLevel}</span>
                    <span class="review-count">${user.reviewCount} reviews</span>
                </div>
                <div class="admin-item-actions">
                    ${user.isAdmin ? '<span class="admin-tag">Admin</span>' : ''}
                    <button class="btn btn-small">Edit</button>
                </div>
            </div>
        `).join('');
    },
    
    loadBusinesses: () => {
        console.log('🔧 Loading businesses for admin panel');
        const businessesList = document.getElementById('businessesList');
        if (!businessesList) return;
        
        businessesList.innerHTML = AppState.businesses.map(business => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h6>${business.name}</h6>
                    <p>${business.address}, ${business.city}, ${business.state}</p>
                    <span class="category-tag">${utils.capitalizeWords(business.category)}</span>
                    <span class="rating-tag">${utils.formatRating(business.ratings.overall)} (${business.reviewCount} reviews)</span>
                </div>
                <div class="admin-item-actions">
                    ${business.verified ? '<span class="verified-tag">Verified</span>' : ''}
                    <button class="btn btn-small">Edit</button>
                </div>
            </div>
        `).join('');
    },
    
    loadReviews: () => {
        console.log('🔧 Loading reviews for admin panel');
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) return;
        
        reviewsList.innerHTML = `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h6>Sample Review</h6>
                    <p>Great restroom, very clean and accessible!</p>
                    <span class="user-tag">By: johndoe</span>
                    <span class="business-tag">At: Shell Gas Station</span>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-small">Approve</button>
                    <button class="btn btn-small btn-danger">Remove</button>
                </div>
            </div>
            <div class="admin-item">
                <div class="admin-item-info">
                    <h6>Another Review</h6>
                    <p>Could use better lighting, but overall decent facilities.</p>
                    <span class="user-tag">By: sarahj</span>
                    <span class="business-tag">At: McDonald's</span>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-small">Approve</button>
                    <button class="btn btn-small btn-danger">Remove</button>
                </div>
            </div>
        `;
    },
    
    loadAnalytics: () => {
        console.log('🔧 Loading analytics for admin panel');
        const totalUsers = document.getElementById('totalUsers');
        const totalBusinesses = document.getElementById('totalBusinesses');
        const totalReviews = document.getElementById('totalReviews');
        const averageRating = document.getElementById('averageRating');
        
        if (totalUsers) totalUsers.textContent = auth.users.length;
        if (totalBusinesses) totalBusinesses.textContent = AppState.businesses.length;
        if (totalReviews) totalReviews.textContent = AppState.businesses.reduce((sum, b) => sum + b.reviewCount, 0);
        
        if (averageRating) {
            const avgRating = AppState.businesses.reduce((sum, b) => sum + b.ratings.overall, 0) / AppState.businesses.length;
            averageRating.textContent = avgRating.toFixed(1);
        }
    },
    
    switchTab: (tabName) => {
        console.log('🔧 Switching admin tab to:', tabName);
        
        // Update tab buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
        
        // Load appropriate data
        switch(tabName) {
            case 'users':
                adminSystem.loadUsers();
                break;
            case 'businesses':
                adminSystem.loadBusinesses();
                break;
            case 'reviews':
                adminSystem.loadReviews();
                break;
            case 'analytics':
                adminSystem.loadAnalytics();
                break;
        }
    }
};

// UI Manager
const ui = {
    renderBusinesses: (businesses = null) => {
        console.log('🔧 renderBusinesses called');
        
        const businessGrid = document.getElementById('businessGrid');
        if (!businessGrid) {
            console.error('❌ businessGrid element not found!');
            return;
        }
        
        const businessesToRender = businesses || AppState.filteredBusinesses;
        console.log('📋 Rendering', businessesToRender.length, 'businesses');
        
        if (businessesToRender.length === 0) {
            businessGrid.innerHTML = '<div class="no-results">No restrooms found matching your criteria.</div>';
            return;
        }
        
        businessGrid.innerHTML = businessesToRender.map(business => `
            <div class="business-card" data-business-id="${business.id}">
                <div class="business-header">
                    <h4 class="business-name">${business.name}</h4>
                    <div class="business-category">${utils.capitalizeWords(business.category)}</div>
                </div>
                
                <div class="business-info">
                    <div class="business-address">
                        <span class="address-icon">📍</span>
                        <span>${business.address}, ${business.city}, ${business.state}</span>
                    </div>
                    
                    <div class="business-hours">
                        <span class="hours-icon">🕒</span>
                        <span>${business.hours}</span>
                    </div>
                </div>
                
                <div class="business-ratings">
                    <div class="rating-item">
                        <span class="rating-label">Overall:</span>
                        <div class="rating-value">
                            <span class="stars">${utils.generateStars(business.ratings.overall)}</span>
                            <span class="rating-number">${utils.formatRating(business.ratings.overall)}</span>
                        </div>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">Cleanliness:</span>
                        <div class="rating-value">
                            <span class="stars">${utils.generateStars(business.ratings.cleanliness)}</span>
                            <span class="rating-number">${utils.formatRating(business.ratings.cleanliness)}</span>
                        </div>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">Safety:</span>
                        <div class="rating-value">
                            <span class="stars">${utils.generateStars(business.ratings.safety)}</span>
                            <span class="rating-number">${utils.formatRating(business.ratings.safety)}</span>
                        </div>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">Accessibility:</span>
                        <div class="rating-value">
                            <span class="stars">${utils.generateStars(business.ratings.accessibility)}</span>
                            <span class="rating-number">${utils.formatRating(business.ratings.accessibility)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="business-amenities">
                    <div class="amenities-list">
                        ${business.amenities.map(amenity => 
                            `<span class="amenity-tag">${utils.capitalizeWords(amenity)}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="business-actions">
                    <button class="btn btn-primary write-review-btn" data-business-id="${business.id}">
                        Write Review
                    </button>
                    <button class="btn btn-secondary">
                        Get Directions
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Business cards rendered successfully');
        
        document.querySelectorAll('.write-review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const businessId = e.target.getAttribute('data-business-id');
                ui.openReviewModal(businessId);
            });
        });
    },
    
    updateUserStatus: () => {
        console.log('🔧 updateUserStatus called');
        
        const user = auth.getCurrentUser();
        const userStatus = document.getElementById('userStatus');
        const userWelcome = document.getElementById('userWelcome');
        const userBadge = document.getElementById('userBadge');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const adminBtn = document.getElementById('adminBtn');
        
        if (user) {
            if (userStatus) userStatus.style.display = 'block';
            if (userWelcome) userWelcome.textContent = `Welcome back, ${user.firstName}! (${user.reviewCount} reviews)`;
            if (userBadge) {
                userBadge.textContent = user.badgeLevel;
                userBadge.style.backgroundColor = badgeSystem.getBadgeColor(user.badgeLevel);
            }
            
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-flex';
            if (adminBtn && user.isAdmin) {
                adminBtn.style.display = 'inline-flex';
                console.log('✅ Admin button shown for admin user');
            }
        } else {
            if (userStatus) userStatus.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'inline-flex';
            if (signupBtn) signupBtn.style.display = 'inline-flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (adminBtn) adminBtn.style.display = 'none';
        }
    },
    
    openModal: (modalId) => {
        console.log('🔧 openModal called for:', modalId);
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // If opening admin modal, load initial data
            if (modalId === 'adminModal') {
                console.log('🔧 Loading admin panel data');
                setTimeout(() => {
                    adminSystem.switchTab('users');
                }, 100);
            }
        }
    },
    
    closeModal: (modalId) => {
        console.log('🔧 closeModal called for:', modalId);
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        if (modalId === 'reviewModal') {
            ui.resetReviewModal();
        }
    },
    
    openReviewModal: (businessId) => {
        console.log('🔧 openReviewModal called for business:', businessId);
        
        const business = businessManager.getBusinessById(businessId);
        if (!business) return;
        
        const businessNameDisplay = document.getElementById('businessNameDisplay');
        if (businessNameDisplay) businessNameDisplay.textContent = `Rating: ${business.name}`;
        
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) reviewForm.setAttribute('data-business-id', businessId);
        
        ui.openModal('reviewModal');
    },
    
    resetReviewModal: () => {
        console.log('🔧 resetReviewModal called');
        
        AppState.ratings = { overall: 0, cleanliness: 0, safety: 0, accessibility: 0 };
        AppState.selectedBathroom = { type: null, wheelchair: false };
        AppState.selectedAmenities = [];
        
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
        document.querySelectorAll('.rating-display').forEach(display => display.textContent = '0/10');
        document.querySelectorAll('.bathroom-type-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('input[name="amenities"]').forEach(cb => cb.checked = false);
        const wheelchairBtn = document.getElementById('wheelchairBtn');
        if (wheelchairBtn) wheelchairBtn.classList.remove('selected');
    },
    
    applyFilter: (category) => {
        console.log('🔧 applyFilter called with category:', category);
        
        AppState.currentFilter = category;
        AppState.filteredBusinesses = businessManager.getBusinesses(category);
        ui.renderBusinesses();
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-category') === category);
        });
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) categoryFilter.value = category;
    }
};

// Application Initialization
const app = {
    init: () => {
        console.log('🚀 GTGOTG - Got To Go On The Go - Initializing...');
        
        try {
            AppState.businesses = sampleBusinesses;
            AppState.filteredBusinesses = sampleBusinesses;
            
            console.log('🔧 Setting up UI components...');
            ui.renderBusinesses();
            ui.updateUserStatus();
            
            console.log('🔧 Setting up event handlers...');
            app.setupEventHandlers();
            
            setTimeout(() => {
                utils.showNotification('Welcome to GTGOTG! Find clean, safe restrooms everywhere.');
            }, 1000);
            
            console.log('✅ GTGOTG - Application initialized successfully!');
            
        } catch (error) {
            console.error('❌ Error during app initialization:', error);
            utils.showNotification('Application failed to initialize properly. Please refresh the page.', 'error');
        }
    },
    
    setupEventHandlers: () => {
        console.log('🔧 Setting up event handlers...');
        
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const adminBtn = document.getElementById('adminBtn');
        
        if (loginBtn) loginBtn.addEventListener('click', () => ui.openModal('loginModal'));
        if (signupBtn) signupBtn.addEventListener('click', () => ui.openModal('signupModal'));
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                console.log('🔧 Admin button clicked');
                ui.openModal('adminModal');
            });
        }
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            auth.logout();
            ui.updateUserStatus();
            utils.showNotification('You have been logged out successfully.');
        });
        
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        const performSearch = () => {
            const query = searchInput?.value.trim();
            if (query) {
                AppState.filteredBusinesses = businessManager.searchBusinesses(query);
                ui.renderBusinesses();
                utils.showNotification(`Found ${AppState.filteredBusinesses.length} restrooms matching "${query}"`);
            } else {
                AppState.filteredBusinesses = businessManager.getBusinesses(AppState.currentFilter);
                ui.renderBusinesses();
            }
        };
        
        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                ui.applyFilter(e.target.value);
            });
        }
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                ui.applyFilter(category);
            });
        });
        
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) ui.closeModal(modal.id);
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    ui.closeModal(modal.id);
                }
            });
        });
        
        // Setup admin tab handlers
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                adminSystem.switchTab(tabName);
            });
        });
        
        app.setupFormHandlers();
        app.setupRatingSystem();
        app.setupBathroomSelection();
    },
    
    setupFormHandlers: () => {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = utils.sanitizeInput(document.getElementById('loginUsername')?.value || '');
                const password = document.getElementById('loginPassword')?.value || '';
                
                const result = auth.login(username, password);
                
                if (result.success) {
                    ui.closeModal('loginModal');
                    ui.updateUserStatus();
                    utils.showNotification(`Welcome back, ${result.user.firstName}!`, 'success');
                } else {
                    utils.showNotification(result.message, 'error');
                }
            });
        }
        
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = {
                    firstName: utils.sanitizeInput(document.getElementById('signupFirstName')?.value || ''),
                    lastName: utils.sanitizeInput(document.getElementById('signupLastName')?.value || ''),
                    username: utils.sanitizeInput(document.getElementById('signupUsername')?.value || ''),
                    email: utils.sanitizeInput(document.getElementById('signupEmail')?.value || ''),
                    password: document.getElementById('signupPassword')?.value || ''
                };
                
                if (!utils.validateEmail(formData.email)) {
                    utils.showNotification('Please enter a valid email address.', 'error');
                    return;
                }
                
                if (formData.password.length < 6) {
                    utils.showNotification('Password must be at least 6 characters long.', 'error');
                    return;
                }
                
                const result = auth.register(formData);
                
                if (result.success) {
                    ui.closeModal('signupModal');
                    AppState.currentUser = result.user;
                    ui.updateUserStatus();
                    utils.showNotification(`Welcome to GTGOTG, ${formData.firstName}! Your account has been created.`, 'success');
                } else {
                    utils.showNotification(result.message, 'error');
                }
            });
        }
        
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const businessId = e.target.getAttribute('data-business-id');
                const comment = utils.sanitizeInput(document.getElementById('reviewComment')?.value || '');
                const user = auth.getCurrentUser();
                
                if (comment && !user) {
                    utils.showNotification('Please log in to leave a comment.', 'warning');
                    return;
                }
                
                if (AppState.ratings.overall === 0) {
                    utils.showNotification('Please provide an overall rating.', 'error');
                    return;
                }
                
                const amenities = Array.from(document.querySelectorAll('input[name="amenities"]:checked'))
                    .map(cb => cb.value);
                
                const reviewData = {
                    ratings: { ...AppState.ratings },
                    bathroomType: AppState.selectedBathroom.type,
                    wheelchairAccessible: AppState.selectedBathroom.wheelchair,
                    amenities: amenities,
                    comment: comment || null
                };
                
                const result = reviewSystem.submitReview(businessId, reviewData);
                
                if (result.success) {
                    ui.closeModal('reviewModal');
                    ui.updateUserStatus();
                    utils.showNotification('Thank you for your review! It helps others find great restrooms.', 'success');
                } else {
                    utils.showNotification('Failed to submit review. Please try again.', 'error');
                }
            });
        }
    },
    
    setupRatingSystem: () => {
        document.querySelectorAll('.star-rating').forEach(ratingContainer => {
            const stars = ratingContainer.querySelectorAll('.star');
            
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    const rating = index + 1;
                    const ratingType = ratingContainer.getAttribute('data-rating');
                    AppState.ratings[ratingType] = rating;
                    
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', i < rating);
                    });
                    
                    const display = document.getElementById(`${ratingType}RatingDisplay`);
                    if (display) display.textContent = `${rating}/10`;
                });
                
                star.addEventListener('mouseenter', () => {
                    const rating = index + 1;
                    stars.forEach((s, i) => {
                        s.style.color = i < rating ? '#F59E0B' : '#D1D5DB';
                    });
                });
            });
            
            ratingContainer.addEventListener('mouseleave', () => {
                const currentRating = AppState.ratings[ratingContainer.getAttribute('data-rating')];
                stars.forEach((s, i) => {
                    s.style.color = i < currentRating ? '#F59E0B' : '#D1D5DB';
                });
            });
        });
    },
    
    setupBathroomSelection: () => {
        document.querySelectorAll('.bathroom-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.bathroom-type-btn').forEach(b => b.classList.remove('selected'));
                
                btn.classList.add('selected');
                AppState.selectedBathroom.type = btn.getAttribute('data-type');
            });
        });
        
        const wheelchairBtn = document.querySelector('.wheelchair-btn');
        if (wheelchairBtn) {
            wheelchairBtn.addEventListener('click', (e) => {
                e.target.classList.toggle('selected');
                AppState.selectedBathroom.wheelchair = e.target.classList.contains('selected');
            });
        }
    }
};

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded - Starting GTGOTG...');
    app.init();
});

// Fallback initialization for older browsers
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    console.log('📄 DOM already loaded - Starting GTGOTG immediately...');
    app.init();
}

