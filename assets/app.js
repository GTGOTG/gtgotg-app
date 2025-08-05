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
        AppState.selectedBathroom = { type: null, wheelchair: false };
        AppState.selectedAmenities = [];
        
        // Reset UI elements
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
        document.querySelectorAll('.rating-display').forEach(display => display.textContent = '0/10');
        document.querySelectorAll('.bathroom-type-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('wheelchairBtn').classList.remove('selected');
        document.querySelectorAll('input[name="amenities"]').forEach(cb => cb.checked = false);
    },
    
    setupStarRatings: () => {
        document.querySelectorAll('.star-rating').forEach(ratingContainer => {
            const ratingType = ratingContainer.getAttribute('data-rating');
            const stars = ratingContainer.querySelectorAll('.star');
            
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    const rating = index + 1;
                    AppState.ratings[ratingType] = rating;
                    
                    // Update visual state
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', i < rating);
                    });
                    
                    // Update display
                    const display = document.getElementById(`${ratingType}RatingDisplay`);
                    display.textContent = `${rating}/10`;
                });
                
                star.addEventListener('mouseenter', () => {
                    const rating = index + 1;
                    stars.forEach((s, i) => {
                        s.style.color = i < rating ? '#F59E0B' : '#D1D5DB';
                    });
                });
            });
            
            ratingContainer.addEventListener('mouseleave', () => {
                const currentRating = AppState.ratings[ratingType];
                stars.forEach((s, i) => {
                    s.style.color = i < currentRating ? '#F59E0B' : '#D1D5DB';
                });
            });
        });
    },
    
    setupBathroomTypeSelection: () => {
        document.querySelectorAll('.bathroom-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selection from all buttons
                document.querySelectorAll('.bathroom-type-btn').forEach(b => b.classList.remove('selected'));
                
                // Add selection to clicked button
                btn.classList.add('selected');
                AppState.selectedBathroom.type = btn.getAttribute('data-type');
            });
        });
        
        document.getElementById('wheelchairBtn').addEventListener('click', (e) => {
            e.target.classList.toggle('selected');
            AppState.selectedBathroom.wheelchair = e.target.classList.contains('selected');
        });
    },
    
    applyFilter: (category) => {
        AppState.currentFilter = category;
        AppState.filteredBusinesses = businessManager.getBusinesses(category);
        ui.renderBusinesses();
        
        // Update filter button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-category') === category);
        });
        
        // Update select element
        document.getElementById('categoryFilter').value = category;
    }
};

// Event Handlers
const eventHandlers = {
    setupAuthForms: () => {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = utils.sanitizeInput(document.getElementById('loginUsername').value);
            const password = document.getElementById('loginPassword').value;
            
            const result = auth.login(username, password);
            
            if (result.success) {
                ui.closeModal('loginModal');
                ui.updateUserStatus();
                utils.showNotification('Welcome back! You are now logged in.');
            } else {
                utils.showNotification(result.message, 'error');
            }
        });
        
        // Signup form
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                firstName: utils.sanitizeInput(document.getElementById('signupFirstName').value),
                lastName: utils.sanitizeInput(document.getElementById('signupLastName').value),
                username: utils.sanitizeInput(document.getElementById('signupUsername').value),
                email: utils.sanitizeInput(document.getElementById('signupEmail').value),
                password: document.getElementById('signupPassword').value,
                city: utils.sanitizeInput(document.getElementById('signupCity').value)
            };
            
            // Validation
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
                ui.updateUserStatus();
                utils.showNotification(`Welcome to GTGOTG, ${formData.firstName}! Your account has been created.`);
            } else {
                utils.showNotification(result.message, 'error');
            }
        });
        
        // Review form
        document.getElementById('reviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const businessId = e.target.getAttribute('data-business-id');
            const comment = utils.sanitizeInput(document.getElementById('reviewComment').value);
            const user = auth.getCurrentUser();
            
            // Check if comment is provided but user is not logged in
            if (comment && !user) {
                utils.showNotification('Please log in to leave a comment.', 'warning');
                return;
            }
            
            // Validate ratings
            if (AppState.ratings.overall === 0) {
                utils.showNotification('Please provide an overall rating.', 'error');
                return;
            }
            
            // Collect amenities
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
                ui.updateUserStatus(); // Update badge if user is logged in
                utils.showNotification('Thank you for your review! It helps others find great restrooms.');
            } else {
                utils.showNotification('Failed to submit review. Please try again.', 'error');
            }
        });
    },
    
    setupSearch: () => {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                AppState.filteredBusinesses = businessManager.searchBusinesses(query);
                ui.renderBusinesses();
                utils.showNotification(`Found ${AppState.filteredBusinesses.length} restrooms matching "${query}"`);
            } else {
                AppState.filteredBusinesses = businessManager.getBusinesses(AppState.currentFilter);
                ui.renderBusinesses();
            }
        };
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    },
    
    setupFilters: () => {
        // Category filter dropdown
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            ui.applyFilter(e.target.value);
        });
        
        // Quick filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                ui.applyFilter(category);
            });
        });
    },
    
    setupModals: () => {
        // Modal open buttons
        document.getElementById('loginBtn').addEventListener('click', () => ui.openModal('loginModal'));
        document.getElementById('signupBtn').addEventListener('click', () => ui.openModal('signupModal'));
        document.getElementById('logoutBtn').addEventListener('click', () => {
            auth.logout();
            ui.updateUserStatus();
            utils.showNotification('You have been logged out successfully.');
        });
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                ui.closeModal(modalId);
            });
        });
        
        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    ui.closeModal(modal.id);
                }
            });
        });
        
        // Notification close
        document.getElementById('notificationClose').addEventListener('click', () => {
            document.getElementById('notification').style.display = 'none';
        });
    }
};

// PWA Service Worker Registration
const pwa = {
    registerServiceWorker: () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    },
    
    setupInstallPrompt: () => {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button or prompt
            setTimeout(() => {
                if (deferredPrompt) {
                    utils.showNotification('Install GTGOTG for quick access to restroom information!', 'info');
                }
            }, 30000); // Show after 30 seconds
        });
        
        window.addEventListener('appinstalled', () => {
            utils.showNotification('GTGOTG has been installed successfully!');
            deferredPrompt = null;
        });
    }
};

// Application Initialization
const app = {
    init: () => {
        console.log('🚽 GTGOTG - Got To Go On The Go - Initializing...');
        
        // Initialize application state
        AppState.businesses = sampleBusinesses;
        AppState.filteredBusinesses = sampleBusinesses;
        
        // Setup UI components
        ui.renderBusinesses();
        ui.updateUserStatus();
        ui.setupStarRatings();
        ui.setupBathroomTypeSelection();
        
        // Setup event handlers
        eventHandlers.setupAuthForms();
        eventHandlers.setupSearch();
        eventHandlers.setupFilters();
        eventHandlers.setupModals();
        
        // Setup PWA features
        pwa.registerServiceWorker();
        pwa.setupInstallPrompt();
        
        // Show welcome message
        setTimeout(() => {
            utils.showNotification('Welcome to GTGOTG! Find clean, safe restrooms everywhere.');
        }, 1000);
        
        console.log('✅ GTGOTG - Application initialized successfully!');
    }
};

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', app.init);

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        auth,
        businessManager,
        reviewSystem,
        utils,
        badgeSystem
    };
}
