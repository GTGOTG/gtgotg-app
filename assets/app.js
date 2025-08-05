// GTGOTG - Got To Go On The Go - Application JavaScript
// Universal Restroom Finder Application

// Application State
const AppState = {
    currentUser: null,
    businesses: [],
    filteredBusinesses: [],
    currentFilter: '',
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

// Sample Business Data with Enhanced Features
const sampleBusinesses = [
    {
        id: 1,
        name: "Shell Gas Station",
        category: "gas_station",
        address: "123 Main Street, Downtown",
        verified: true,
        ratings: {
            overall: 8.1,
            cleanliness: 8.1,
            safety: 8.4,
            accessibility: 7.8
        },
        amenities: ["toilet_paper", "soap", "paper_towels", "hand_dryer"],
        reviewCount: 47,
        publicAccess: true,
        lastUpdated: "2025-01-15"
    },
    {
        id: 2,
        name: "Starbucks Coffee",
        category: "coffee_shop",
        address: "456 Oak Avenue, City Center",
        verified: true,
        ratings: {
            overall: 7.5,
            cleanliness: 7.7,
            safety: 7.6,
            accessibility: 7.2
        },
        amenities: ["toilet_paper", "soap", "hand_dryer", "baby_changing"],
        reviewCount: 89,
        publicAccess: true,
        lastUpdated: "2025-01-14"
    },
    {
        id: 3,
        name: "McDonald's Restaurant",
        category: "restaurant",
        address: "789 Pine Road, Westside",
        verified: true,
        ratings: {
            overall: 9.6,
            cleanliness: 9.7,
            safety: 9.9,
            accessibility: 9.2
        },
        amenities: ["toilet_paper", "soap", "paper_towels", "hand_dryer", "baby_changing", "ada_compliant"],
        reviewCount: 156,
        publicAccess: true,
        lastUpdated: "2025-01-16"
    },
    {
        id: 4,
        name: "Walmart Supercenter",
        category: "retail",
        address: "321 Commerce Blvd, Shopping District",
        verified: true,
        ratings: {
            overall: 8.3,
            cleanliness: 8.5,
            safety: 8.1,
            accessibility: 8.7
        },
        amenities: ["toilet_paper", "soap", "paper_towels", "hand_dryer", "baby_changing", "ada_compliant"],
        reviewCount: 203,
        publicAccess: true,
        lastUpdated: "2025-01-13"
    },
    {
        id: 5,
        name: "Target Store",
        category: "retail",
        address: "654 Market Street, North Plaza",
        verified: true,
        ratings: {
            overall: 8.8,
            cleanliness: 9.1,
            safety: 8.7,
            accessibility: 8.6
        },
        amenities: ["toilet_paper", "soap", "paper_towels", "hand_dryer", "baby_changing", "ada_compliant"],
        reviewCount: 134,
        publicAccess: true,
        lastUpdated: "2025-01-15"
    }
];

// User Badge System
const badgeSystem = {
    getBadgeLevel: (reviewCount) => {
        if (reviewCount >= 25) return 'Expert';
        if (reviewCount >= 20) return 'Platinum';
        if (reviewCount >= 15) return 'Gold';
        if (reviewCount >= 10) return 'Silver';
        if (reviewCount >= 5) return 'Bronze';
        return 'Reviewer';
    },
    
    getBadgeColor: (level) => {
        const colors = {
            'Expert': '#8B5CF6',
            'Platinum': '#6B7280',
            'Gold': '#F59E0B',
            'Silver': '#9CA3AF',
            'Bronze': '#92400E',
            'Reviewer': '#10B981'
        };
        return colors[level] || colors['Reviewer'];
    }
};

// Utility Functions
const utils = {
    generateStars: (rating, maxRating = 10) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '★'.repeat(fullStars);
        if (hasHalfStar) stars += '☆';
        stars += '☆'.repeat(emptyStars);
        
        return stars;
    },
    
    formatRating: (rating) => {
        return `${rating.toFixed(1)}/10`;
    },
    
    capitalizeWords: (str) => {
        return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    
    showNotification: (message, type = 'success') => {
        const notification = document.getElementById('notification');
        const messageEl = document.getElementById('notificationMessage');
        
        messageEl.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    },
    
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    sanitizeInput: (input) => {
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                   .replace(/[<>]/g, '');
    }
};

// Authentication System
const auth = {
    login: (username, password) => {
        // Simulate authentication
        const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
        const user = users.find(u => 
            (u.username === username || u.email === username) && u.password === password
        );
        
        if (user) {
            AppState.currentUser = user;
            localStorage.setItem('gtgotg_current_user', JSON.stringify(user));
            return { success: true, user };
        }
        
        return { success: false, message: 'Invalid credentials' };
    },
    
    register: (userData) => {
        const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
        
        // Check if user already exists
        if (users.find(u => u.username === userData.username || u.email === userData.email)) {
            return { success: false, message: 'User already exists' };
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            ...userData,
            reviewCount: 0,
            badgeLevel: 'Reviewer',
            joinDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('gtgotg_users', JSON.stringify(users));
        
        AppState.currentUser = newUser;
        localStorage.setItem('gtgotg_current_user', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
    },
    
    logout: () => {
        AppState.currentUser = null;
        localStorage.removeItem('gtgotg_current_user');
    },
    
    getCurrentUser: () => {
        if (!AppState.currentUser) {
            const stored = localStorage.getItem('gtgotg_current_user');
            if (stored) {
                AppState.currentUser = JSON.parse(stored);
            }
        }
        return AppState.currentUser;
    }
};

// Business Management
const businessManager = {
    getBusinesses: (filter = '') => {
        let businesses = [...sampleBusinesses];
        
        if (filter && filter !== '') {
            businesses = businesses.filter(business => 
                business.category === filter
            );
        }
        
        return businesses;
    },
    
    searchBusinesses: (query) => {
        const searchTerm = query.toLowerCase();
        return sampleBusinesses.filter(business =>
            business.name.toLowerCase().includes(searchTerm) ||
            business.address.toLowerCase().includes(searchTerm) ||
            business.category.toLowerCase().includes(searchTerm)
        );
    },
    
    getBusinessById: (id) => {
        return sampleBusinesses.find(business => business.id === parseInt(id));
    }
};

// Review System
const reviewSystem = {
    submitReview: (businessId, reviewData) => {
        const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
        const user = auth.getCurrentUser();
        
        const review = {
            id: Date.now(),
            businessId: parseInt(businessId),
            userId: user ? user.id : null,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
            ...reviewData,
            timestamp: new Date().toISOString()
        };
        
        reviews.push(review);
        localStorage.setItem('gtgotg_reviews', JSON.stringify(reviews));
        
        // Update user review count if logged in
        if (user) {
            user.reviewCount += 1;
            user.badgeLevel = badgeSystem.getBadgeLevel(user.reviewCount);
            
            // Update stored user data
            const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = user;
                localStorage.setItem('gtgotg_users', JSON.stringify(users));
                localStorage.setItem('gtgotg_current_user', JSON.stringify(user));
            }
        }
        
        return { success: true, review };
    },
    
    getReviewsForBusiness: (businessId) => {
        const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
        return reviews.filter(review => review.businessId === parseInt(businessId));
    }
};

// UI Management
const ui = {
    renderBusinesses: (businesses = null) => {
        const businessList = document.getElementById('businessList');
        const businessesToRender = businesses || AppState.filteredBusinesses;
        
        if (businessesToRender.length === 0) {
            businessList.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <p style="color: var(--text-secondary); font-size: 1.1rem;">
                        No restrooms found matching your criteria. Try adjusting your search or filter.
                    </p>
                </div>
            `;
            return;
        }
        
        businessList.innerHTML = businessesToRender.map(business => `
            <div class="business-card" data-business-id="${business.id}">
                <div class="business-header">
                    <div>
                        <h3 class="business-name">${business.name}</h3>
                        <p class="business-category">${utils.capitalizeWords(business.category)}</p>
                    </div>
                    ${business.verified ? `
                        <div class="business-status status-verified">
                            <span>✓</span>
                            <span>Verified</span>
                        </div>
                    ` : ''}
                </div>
                
                <p class="business-address">${business.address}</p>
                
                <div class="business-ratings">
                    <div class="rating-item">
                        <span class="rating-label">Overall</span>
                        <div class="rating-value">
                            <span class="stars">${utils.generateStars(business.ratings.overall)}</span>
                            <span class="rating-number">${utils.formatRating(business.ratings.overall)}</span>
                        </div>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">Cleanliness</span>
                        <div class="rating-value">
                            <span class="stars">${utils.generateStars(business.ratings.cleanliness)}</span>
                            <span class="rating-number">${utils.formatRating(business.ratings.cleanliness)}</span>
                        </div>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">Safety</span>
                        <div class="rating-value">
                            <span class="stars">${utils.generateStars(business.ratings.safety)}</span>
                            <span class="rating-number">${utils.formatRating(business.ratings.safety)}</span>
                        </div>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">Accessibility</span>
                        <div class="rating-value">
                            <span class="stars">${utils.generateStars(business.ratings.accessibility)}</span>
                            <span class="rating-number">${utils.formatRating(business.ratings.accessibility)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="business-amenities">
                    <div class="amenities-list">
                        ${business.amenities.map(amenity => `
                            <span class="amenity-tag">${utils.capitalizeWords(amenity)}</span>
                        `).join('')}
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
        
        // Add event listeners for review buttons
        document.querySelectorAll('.write-review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const businessId = e.target.getAttribute('data-business-id');
                ui.openReviewModal(businessId);
            });
        });
    },
    
    updateUserStatus: () => {
        const user = auth.getCurrentUser();
        const userStatus = document.getElementById('userStatus');
        const userWelcome = document.getElementById('userWelcome');
        const userBadge = document.getElementById('userBadge');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (user) {
            userStatus.style.display = 'block';
            userWelcome.textContent = `Welcome back, ${user.firstName}! (${user.reviewCount} reviews)`;
            userBadge.textContent = user.badgeLevel;
            userBadge.style.backgroundColor = badgeSystem.getBadgeColor(user.badgeLevel);
            
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-flex';
        } else {
            userStatus.style.display = 'none';
            loginBtn.style.display = 'inline-flex';
            signupBtn.style.display = 'inline-flex';
            logoutBtn.style.display = 'none';
        }
    },
    
    openModal: (modalId) => {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },
    
    closeModal: (modalId) => {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset forms
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        // Reset rating states
        if (modalId === 'reviewModal') {
            ui.resetReviewModal();
        }
    },
    
    openReviewModal: (businessId) => {
        const business = businessManager.getBusinessById(businessId);
        if (!business) return;
        
        const businessNameDisplay = document.getElementById('businessNameDisplay');
        businessNameDisplay.textContent = `Rating: ${business.name}`;
        
        // Store business ID for form submission
        document.getElementById('reviewForm').setAttribute('data-business-id', businessId);
        
        ui.openModal('reviewModal');
    },
    
    resetReviewModal: () => {
        // Reset ratings
        AppState.ratings = { overall: 0, cleanliness: 0, safety: 0, accessibility: 0 };
        AppState.selectedBathroom = { type: n
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)


