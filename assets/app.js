// GTGOTG - Got To Go On The Go - Application JavaScript
// Universal Restroom Finder Application - FIXED VERSION

console.log('🚽 GTGOTG - Got To Go On The Go - Initializing...');

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
        name: "McDonald's",
        category: "restaurant",
        address: "789 Burger Lane, Food District",
        verified: true,
        ratings: {
            overall: 9.6,
            cleanliness: 9.7,
            safety: 9.9,
            accessibility: 9.2
        },
        amenities: ["toilet_paper", "soap", "paper_towels", "hand_dryer", "baby_changing", "ada_compliant"],
        reviewCount: 89,
        publicAccess: true,
        lastUpdated: "2025-01-20"
    },
    {
        id: 3,
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
        amenities: ["toilet_paper", "soap", "hand_dryer"],
        reviewCount: 34,
        publicAccess: true,
        lastUpdated: "2025-01-18"
    },
    {
        id: 4,
        name: "Walmart Supercenter",
        category: "retail",
        address: "321 Shopping Plaza, Retail Row",
        verified: true,
        ratings: {
            overall: 8.2,
            cleanliness: 8.0,
            safety: 8.5,
            accessibility: 8.8
        },
        amenities: ["toilet_paper", "soap", "paper_towels", "hand_dryer", "baby_changing", "ada_compliant"],
        reviewCount: 156,
        publicAccess: true,
        lastUpdated: "2025-01-22"
    },
    {
        id: 5,
        name: "Target",
        category: "retail",
        address: "654 Market Street, Shopping Center",
        verified: true,
        ratings: {
            overall: 8.6,
            cleanliness: 8.8,
            safety: 8.7,
            accessibility: 8.3
        },
        amenities: ["toilet_paper", "soap", "paper_towels", "hand_dryer", "baby_changing", "ada_compliant"],
        reviewCount: 92,
        publicAccess: true,
        lastUpdated: "2025-01-19"
    }
];

// Sample Users Data
const sampleUsers = [
    {
        id: 1,
        username: "admin",
        email: "admin@gtgotg.com",
        password: "gtgotg2025!",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        badgeLevel: "Expert",
        reviewCount: 0,
        city: "System",
        joinDate: "2025-01-01"
    },
    {
        id: 2,
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "user",
        badgeLevel: "Bronze",
        reviewCount: 8,
        city: "Downtown",
        joinDate: "2025-01-10"
    },
    {
        id: 3,
        username: "sarahj",
        email: "sarah@example.com",
        password: "password123",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "user",
        badgeLevel: "Silver",
        reviewCount: 12,
        city: "City Center",
        joinDate: "2025-01-12"
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚽 GTGOTG - Got To Go On The Go - Initializing...');
    
    // Initialize data
    AppState.businesses = [...sampleBusinesses];
    AppState.filteredBusinesses = [...sampleBusinesses];
    
    // Initialize UI
    initializeEventListeners();
    renderBusinesses();
    loadUserSession();
    
    console.log('✅ GTGOTG Application Ready!');
});

// Event Listeners
function initializeEventListeners() {
    // Navigation buttons
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
    if (signupBtn) signupBtn.addEventListener('click', openSignupModal);
    if (adminBtn) adminBtn.addEventListener('click', openAdminPanel);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // Filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterBusinesses(this.value);
        });
    }
    
    // Quick filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterBusinesses(category);
            
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Modal close buttons
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Modal background clicks
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModals();
        });
    });
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const reviewForm = document.getElementById('reviewForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (reviewForm) reviewForm.addEventListener('submit', handleReviewSubmission);
    
    // Star rating interactions
    setupStarRatings();
    
    // Bathroom type selection
    setupBathroomTypeSelection();
    
    // Admin panel tabs
    setupAdminTabs();
}

// Business Rendering
function renderBusinesses() {
    const businessGrid = document.getElementById('businessGrid');
    if (!businessGrid) {
        console.error('Business grid element not found');
        return;
    }
    
    if (AppState.filteredBusinesses.length === 0) {
        businessGrid.innerHTML = '<div class="no-results">No restrooms found matching your criteria.</div>';
        return;
    }
    
    businessGrid.innerHTML = AppState.filteredBusinesses.map(business => `
        <div class="business-card" data-id="${business.id}">
            <div class="business-header">
                <div class="business-info">
                    <h4 class="business-name">${business.name}</h4>
                    <p class="business-address">${business.address}</p>
                    <div class="business-category">
                        <span class="category-badge category-${business.category}">
                            ${getCategoryLabel(business.category)}
                        </span>
                        ${business.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                    </div>
                </div>
            </div>
            
            <div class="business-body">
                <div class="rating-summary">
                    <div class="overall-rating">
                        <div class="rating-stars">${generateStarDisplay(business.ratings.overall)}</div>
                        <span class="rating-value">${business.ratings.overall}/10</span>
                        <span class="review-count">(${business.reviewCount} reviews)</span>
                    </div>
                </div>
                
                <div class="rating-breakdown">
                    <div class="rating-item">
                        <span class="rating-label">Cleanliness:</span>
                        <span class="rating-value">${business.ratings.cleanliness}/10</span>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">Safety:</span>
                        <span class="rating-value">${business.ratings.safety}/10</span>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">Accessibility:</span>
                        <span class="rating-value">${business.ratings.accessibility}/10</span>
                    </div>
                </div>
                
                <div class="amenities-preview">
                    ${business.amenities.slice(0, 4).map(amenity => `
                        <span class="amenity-tag">${getAmenityIcon(amenity)} ${getAmenityLabel(amenity)}</span>
                    `).join('')}
                    ${business.amenities.length > 4 ? `<span class="amenity-more">+${business.amenities.length - 4} more</span>` : ''}
                </div>
                
                <div class="business-actions">
                    <button class="btn btn-primary write-review-btn" data-business-id="${business.id}">
                        Write Review
                    </button>
                    <button class="btn btn-secondary view-details-btn" data-business-id="${business.id}">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to new buttons
    const writeReviewBtns = businessGrid.querySelectorAll('.write-review-btn');
    writeReviewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const businessId = parseInt(this.getAttribute('data-business-id'));
            openReviewModal(businessId);
        });
    });
    
    const viewDetailsBtns = businessGrid.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const businessId = parseInt(this.getAttribute('data-business-id'));
            viewBusinessDetails(businessId);
        });
    });
}

// Helper Functions
function getCategoryLabel(category) {
    const labels = {
        'gas_station': 'Gas Station',
        'restaurant': 'Restaurant',
        'coffee_shop': 'Coffee Shop',
        'retail': 'Retail',
        'grocery': 'Grocery'
    };
    return labels[category] || category;
}

function generateStarDisplay(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '★';
    if (hasHalfStar) stars += '☆';
    for (let i = 0; i < emptyStars; i++) stars += '☆';
    
    return stars;
}

function getAmenityIcon(amenity) {
    const icons = {
        'toilet_paper': '🧻',
        'soap': '🧼',
        'paper_towels': '📄',
        'hand_dryer': '💨',
        'baby_changing': '👶',
        'ada_compliant': '♿'
    };
    return icons[amenity] || '✓';
}

function getAmenityLabel(amenity) {
    const labels = {
        'toilet_paper': 'Toilet Paper',
        'soap': 'Soap',
        'paper_towels': 'Paper Towels',
        'hand_dryer': 'Hand Dryer',
        'baby_changing': 'Baby Changing',
        'ada_compliant': 'ADA Compliant'
    };
    return labels[amenity] || amenity;
}

// Search and Filter Functions
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        AppState.filteredBusinesses = [...AppState.businesses];
    } else {
        AppState.filteredBusinesses = AppState.businesses.filter(business => 
            business.name.toLowerCase().includes(query) ||
            business.address.toLowerCase().includes(query) ||
            getCategoryLabel(business.category).toLowerCase().includes(query)
        );
    }
    
    renderBusinesses();
}

function filterBusinesses(category) {
    AppState.currentFilter = category;
    
    if (category === '' || category === 'all') {
        AppState.filteredBusinesses = [...AppState.businesses];
    } else {
        AppState.filteredBusinesses = AppState.businesses.filter(business => 
            business.category === category
        );
    }
    
    // Update category filter dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
    }
    
    renderBusinesses();
}

// Modal Functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'block';
}

function openSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) modal.style.display = 'block';
}

function openReviewModal(businessId) {
    const modal = document.getElementById('reviewModal');
    if (!modal) return;
    
    const business = AppState.businesses.find(b => b.id === businessId);
    if (!business) return;
    
    // Set business ID
    const businessIdInput = document.getElementById('reviewBusinessId');
    if (businessIdInput) businessIdInput.value = businessId;
    
    // Reset form
    resetReviewForm();
    
    modal.style.display = 'block';
}

function openAdminPanel() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'block';
        loadAdminData();
    }
}

function closeModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!username || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check against sample users
    const user = sampleUsers.find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
        AppState.currentUser = user;
        updateUserInterface();
        closeModals();
        showNotification(`Welcome back, ${user.firstName}!`, 'success');
        
        // Save session
        localStorage.setItem('gtgotg_user', JSON.stringify(user));
    } else {
        showNotification('Invalid username or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('signupFirstName')?.value;
    const lastName = document.getElementById('signupLastName')?.value;
    const username = document.getElementById('signupUsername')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const city = document.getElementById('signupCity')?.value || '';
    
    if (!firstName || !lastName || !username || !email || !password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Check if username or email already exists
    const existingUser = sampleUsers.find(u => u.username === username || u.email === email);
    if (existingUser) {
        showNotification('Username or email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: sampleUsers.length + 1,
        username,
        email,
        password,
        firstName,
        lastName,
        role: 'user',
        badgeLevel: 'Reviewer',
        reviewCount: 0,
        city,
        joinDate: new Date().toISOString().split('T')[0]
    };
    
    sampleUsers.push(newUser);
    AppState.currentUser = newUser;
    
    updateUserInterface();
    closeModals();
    showNotification(`Welcome to GTGOTG, ${firstName}!`, 'success');
    
    // Save session
    localStorage.setItem('gtgotg_user', JSON.stringify(newUser));
}

function logout() {
    AppState.currentUser = null;
    updateUserInterface();
    localStorage.removeItem('gtgotg_user');
    showNotification('Logged out successfully', 'success');
}

function loadUserSession() {
    const savedUser = localStorage.getItem('gtgotg_user');
    if (savedUser) {
        try {
            AppState.currentUser = JSON.parse(savedUser);
            updateUserInterface();
        } catch (e) {
            localStorage.removeItem('gtgotg_user');
        }
    }
}

function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (AppState.currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        if (AppState.currentUser.role === 'admin' && adminBtn) {
            adminBtn.style.display = 'inline-block';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminBtn) adminBtn.style.display = 'none';
    }
}

// Star Rating System
function setupStarRatings() {
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const ratingType = rating.getAttribute('data-rating');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                AppState.ratings[ratingType] = value;
                
                // Update visual state
                stars.forEach((s, i) => {
                    if (i < value) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            });
            
            star.addEventListener('mouseenter', function() {
                const value = parseInt(this.getAttribute('data-value'));
                
                stars.forEach((s, i) => {
                    if (i < value) {
                        s.classList.add('hover');
                    } else {
                        s.classList.remove('hover');
                    }
                });
            });
        });
        
        rating.addEventListener('mouseleave', function() {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// Bathroom Type Selection
function setupBathroomTypeSelection() {
    const bathroomBtns = document.querySelectorAll('.bathroom-type-btn');
    const wheelchairBtn = document.querySelector('.wheelchair-btn');
    
    bathroomBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active state from all bathroom type buttons
            bathroomBtns.forEach(b => b.classList.remove('selected'));
            
            // Add active state to clicked button
            this.classList.add('selected');
            
            // Update state
            AppState.selectedBathroom.type = this.getAttribute('data-type');
        });
    });
    
    if (wheelchairBtn) {
        wheelchairBtn.addEventListener('click', function() {
            const isAccessible = this.getAttribute('data-accessible') === 'true';
            
            if (isAccessible) {
                this.classList.remove('selected');
                this.setAttribute('data-accessible', 'false');
                AppState.selectedBathroom.wheelchair = false;
            } else {
                this.classList.add('selected');
                this.setAttribute('data-accessible', 'true');
                AppState.selectedBathroom.wheelchair = true;
            }
        });
    }
}

// Review System
function handleReviewSubmission(e) {
    e.preventDefault();
    
    const businessId = parseInt(document.getElementById('reviewBusinessId')?.value);
    const comment = document.getElementById('reviewComment')?.value;
    
    // Check if ratings are provided
    if (AppState.ratings.overall === 0) {
        showNotification('Please provide at least an overall rating', 'error');
        return;
    }
    
    // Check if bathroom type is selected
    if (!AppState.selectedBathroom.type) {
        showNotification('Please select which restroom you used', 'error');
        return;
    }
    
    // Get selected amenities
    const amenityCheckboxes = document.querySelectorAll('input[name="amenities"]:checked');
    const selectedAmenities = Array.from(amenityCheckboxes).map(cb => cb.value);
    
    // Create review object
    const review = {
        id: Date.now(),
        businessId,
        userId: AppState.currentUser?.id || null,
        username: AppState.currentUser?.username || 'Anonymous',
        ratings: { ...AppState.ratings },
        bathroomType: AppState.selectedBathroom.type,
        wheelchairAccessible: AppState.selectedBathroom.wheelchair,
        amenities: selectedAmenities,
        comment: comment || '',
        date: new Date().toISOString().split('T')[0]
    };
    
    // For demo purposes, just show success message
    showNotification('Review submitted successfully!', 'success');
    
    // Update user's review count if logged in
    if (AppState.currentUser) {
        AppState.currentUser.reviewCount++;
        updateUserBadge();
        localStorage.setItem('gtgotg_user', JSON.stringify(AppState.currentUser));
    }
    
    // Reset form and close modal
    resetReviewForm();
    closeModals();
}

function resetReviewForm() {
    // Reset ratings
    AppState.ratings = { overall: 0, cleanliness: 0, safety: 0, accessibility: 0 };
    
    // Reset bathroom selection
    AppState.selectedBathroom = { type: null, wheelchair: false };
    
    // Reset amenities
    AppState.selectedAmenities = [];
    
    // Reset UI elements
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('selected', 'hover'));
    
    const bathroomBtns = document.querySelectorAll('.bathroom-type-btn');
    bathroomBtns.forEach(btn => btn.classList.remove('selected'));
    
    const wheelchairBtn = document.querySelector('.wheelchair-btn');
    if (wheelchairBtn) {
        wheelchairBtn.classList.remove('selected');
        wheelchairBtn.setAttribute('data-accessible', 'false');
    }
    
    const amenityCheckboxes = document.querySelectorAll('input[name="amenities"]');
    amenityCheckboxes.forEach(cb => cb.checked = false);
    
    const commentField = document.getElementById('reviewComment');
    if (commentField) commentField.value = '';
}

function updateUserBadge() {
    if (!AppState.currentUser) return;
    
    const reviewCount = AppState.currentUser.reviewCount;
    let newBadge = 'Reviewer';
    
    if (reviewCount >= 25) newBadge = 'Expert';
    else if (reviewCount >= 20) newBadge = 'Platinum';
    else if (reviewCount >= 15) newBadge = 'Gold';
    else if (reviewCount >= 10) newBadge = 'Silver';
    else if (reviewCount >= 5) newBadge = 'Bronze';
    
    if (newBadge !== AppState.currentUser.badgeLevel) {
        AppState.currentUser.badgeLevel = newBadge;
        showNotification(`Congratulations! You've earned the ${newBadge} badge!`, 'success');
    }
}

// Admin Panel Functions
function setupAdminTabs() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    
    adminTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            adminTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            const adminContents = document.querySelectorAll('.admin-content');
            adminContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(tabName + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function loadAdminData() {
    // Update overview stats
    const totalBusinessesEl = document.getElementById('totalBusinesses');
    const totalUsersEl = document.getElementById('totalUsers');
    const totalReviewsEl = document.getElementById('totalReviews');
    const averageRatingEl = document.getElementById('averageRating');
    
    if (totalBusinessesEl) totalBusinessesEl.textContent = AppState.businesses.length;
    if (totalUsersEl) totalUsersEl.textContent = sampleUsers.length;
    if (totalReviewsEl) totalReviewsEl.textContent = AppState.businesses.reduce((sum, b) => sum + b.reviewCount, 0);
    if (averageRatingEl) {
        const avgRating = AppState.businesses.reduce((sum, b) => sum + b.ratings.overall, 0) / AppState.businesses.length;
        averageRatingEl.textContent = avgRating.toFixed(1);
    }
}

// Utility Functions
function viewBusinessDetails(businessId) {
    const business = AppState.businesses.find(b => b.id === businessId);
    if (!business) return;
    
    // For now, just show an alert with business details
    alert(`Business Details:\n\nName: ${business.name}\nAddress: ${business.address}\nCategory: ${getCategoryLabel(business.category)}\nOverall Rating: ${business.ratings.overall}/10\nReviews: ${business.reviewCount}`);
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;
    
    notificationText.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
    
    // Close button
    const closeBtn = document.getElementById('notificationClose');
    if (closeBtn) {
        closeBtn.onclick = () => notification.classList.remove('show');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚽 GTGOTG - Got To Go On The Go - Initializing...');
        
        // Initialize data
        AppState.businesses = [...sampleBusinesses];
        AppState.filteredBusinesses = [...sampleBusinesses];
        
        // Initialize UI
        initializeEventListeners();
        renderBusinesses();
        loadUserSession();
        
        console.log('✅ GTGOTG Application Ready!');
    });
} else {
    // DOM already loaded
    console.log('🚽 GTGOTG - Got To Go On The Go - Initializing...');
    
    // Initialize data
    AppState.businesses = [...sampleBusinesses];
    AppState.filteredBusinesses = [...sampleBusinesses];
    
    // Initialize UI
    initializeEventListeners();
    renderBusinesses();
    loadUserSession();
    
    console.log('✅ GTGOTG Application Ready!');
}


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
        
        // Check if username or email already exists
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
        
        // In a real app, this would save to a database
        // For now, we'll just simulate success
        
        // Update user's review count and badge if logged in
        if (AppState.currentUser) {
            AppState.currentUser.reviewCount++;
            
            // Update badge every 5 reviews
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
        
        // Add event listeners for review buttons
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
            if (adminBtn && user.isAdmin) adminBtn.style.display = 'inline-flex';
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
        }
    },
    
    closeModal: (modalId) => {
        console.log('🔧 closeModal called for:', modalId);
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Reset forms
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        // Reset rating states
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
        
        // Store business ID for form submission
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) reviewForm.setAttribute('data-business-id', businessId);
        
        ui.openModal('reviewModal');
    },
    
    resetReviewModal: () => {
        console.log('🔧 resetReviewModal called');
        
        // Reset ratings
        AppState.ratings = { overall: 0, cleanliness: 0, safety: 0, accessibility: 0 };
        AppState.selectedBathroom = { type: null, wheelchair: false };
        AppState.selectedAmenities = [];
        
        // Reset UI elements
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
        document.querySelectorAll('.rating-display').forEach(display => display.textContent = '0/10');
        document.querySelectorAll('.bathroom-type-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('input[name="amenities"]').forEach(cb => cb.checked = false);
        document.getElementById('wheelchairBtn')?.classList.remove('selected');
    },
    
    applyFilter: (category) => {
        console.log('🔧 applyFilter called with category:', category);
        
        AppState.currentFilter = category;
        AppState.filteredBusinesses = businessManager.getBusinesses(category);
        ui.renderBusinesses();
        
        // Update filter button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-category') === category);
        });
        
        // Update select element
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) categoryFilter.value = category;
    }
};

// Application Initialization
const app = {
    init: () => {
        console.log('🚀 GTGOTG - Got To Go On The Go - Initializing...');
        
        try {
            // Initialize application state
            AppState.businesses = sampleBusinesses;
            AppState.filteredBusinesses = sampleBusinesses;
            
            // Setup UI components
            console.log('🔧 Setting up UI components...');
            ui.renderBusinesses();
            ui.updateUserStatus();
            
            // Setup event handlers
            console.log('🔧 Setting up event handlers...');
            app.setupEventHandlers();
            
            // Show welcome message
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
        
        // Login/Signup/Logout buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const adminBtn = document.getElementById('adminBtn');
        
        if (loginBtn) loginBtn.addEventListener('click', () => ui.openModal('loginModal'));
        if (signupBtn) signupBtn.addEventListener('click', () => ui.openModal('signupModal'));
        if (adminBtn) adminBtn.addEventListener('click', () => ui.openModal('adminModal'));
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            auth.logout();
            ui.updateUserStatus();
            utils.showNotification('You have been logged out successfully.');
        });
        
        // Search functionality
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
        
        // Filter functionality
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                ui.applyFilter(e.target.value);
            });
        }
        
        // Quick filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                ui.applyFilter(category);
            });
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) ui.closeModal(modal.id);
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
        
        // Form submissions
        app.setupFormHandlers();
        app.setupRatingSystem();
        app.setupBathroomSelection();
    },
    
    setupFormHandlers: () => {
        // Login form
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
        
        // Signup form
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
                    AppState.currentUser = result.user;
                    ui.updateUserStatus();
                    utils.showNotification(`Welcome to GTGOTG, ${formData.firstName}! Your account has been created.`, 'success');
                } else {
                    utils.showNotification(result.message, 'error');
                }
            });
        }
        
        // Review form
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const businessId = e.target.getAttribute('data-business-id');
                const comment = utils.sanitizeInput(document.getElementById('reviewComment')?.value || '');
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
                    
                    // Update visual state
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', i < rating);
                    });
                    
                    // Update display
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
                // Remove selection from all buttons
                document.querySelectorAll('.bathroom-type-btn').forEach(b => b.classList.remove('selected'));
                
                // Add selection to clicked button
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
