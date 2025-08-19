// GTGOTG - "Got To Go On The Go" Complete Application
// Copyright © 2025 Jessica Esposito / Colorado Quality LLC. All rights reserved.

console.log('🚽 GTGOTG - Got To Go On The Go - Loading...');

// Global Variables
let map;
let userLocation = null;
let currentUser = null;
let currentBusinesses = [];
let currentBusinessForReview = null;
let activeFilters = {
    category: '',
    distance: '',
    rating: '',
    quickFilters: []
};

// Sample Business Data
const sampleBusinesses = [
    {
        id: 1,
        name: "Downtown Coffee Co.",
        category: "coffee-shop",
        address: "123 Main St, Downtown",
        phone: "(555) 123-4567",
        coordinates: [40.7128, -74.0060],
        distance: 0.3,
        hours: "6:00 AM - 10:00 PM",
        ratings: {
            overall: 4.2,
            cleanliness: 4.5,
            safety: 4.0,
            accessibility: 3.8
        },
        reviewCount: 24,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer"],
        bathroomTypes: ["mens", "womens", "accessible"],
        isOpen: true
    },
    {
        id: 2,
        name: "QuickStop Gas Station",
        category: "gas-station",
        address: "456 Highway Blvd",
        phone: "(555) 234-5678",
        coordinates: [40.7589, -73.9851],
        distance: 1.2,
        hours: "24 Hours",
        ratings: {
            overall: 3.6,
            cleanliness: 3.2,
            safety: 3.8,
            accessibility: 4.2
        },
        reviewCount: 18,
        amenities: ["toilet-paper", "soap", "hand-dryer", "ada-compliant"],
        bathroomTypes: ["neutral", "accessible"],
        isOpen: true
    },
    {
        id: 3,
        name: "Bella's Italian Restaurant",
        category: "restaurant",
        address: "789 Oak Avenue",
        phone: "(555) 345-6789",
        coordinates: [40.7505, -73.9934],
        distance: 0.8,
        hours: "11:00 AM - 11:00 PM",
        ratings: {
            overall: 4.7,
            cleanliness: 4.8,
            safety: 4.6,
            accessibility: 4.5
        },
        reviewCount: 42,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"],
        isOpen: true
    },
    {
        id: 4,
        name: "City Park Visitor Center",
        category: "park",
        address: "Central Park East",
        phone: "(555) 456-7890",
        coordinates: [40.7829, -73.9654],
        distance: 2.1,
        hours: "8:00 AM - 6:00 PM",
        ratings: {
            overall: 3.9,
            cleanliness: 4.1,
            safety: 3.5,
            accessibility: 4.8
        },
        reviewCount: 31,
        amenities: ["toilet-paper", "soap", "paper-towels", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "neutral", "accessible"],
        isOpen: true
    },
    {
        id: 5,
        name: "MegaMart Superstore",
        category: "retail",
        address: "1000 Shopping Plaza Dr",
        phone: "(555) 567-8901",
        coordinates: [40.7282, -74.0776],
        distance: 3.4,
        hours: "7:00 AM - 11:00 PM",
        ratings: {
            overall: 4.1,
            cleanliness: 4.3,
            safety: 4.0,
            accessibility: 4.6
        },
        reviewCount: 67,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"],
        isOpen: true
    },
    {
        id: 6,
        name: "Grand Hotel Downtown",
        category: "hotel",
        address: "555 Luxury Lane",
        phone: "(555) 678-9012",
        coordinates: [40.7614, -73.9776],
        distance: 1.7,
        hours: "24 Hours",
        ratings: {
            overall: 4.8,
            cleanliness: 4.9,
            safety: 4.7,
            accessibility: 4.8
        },
        reviewCount: 89,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"],
        isOpen: true
    },
    {
        id: 7,
        name: "University Library",
        category: "library",
        address: "200 Campus Drive",
        phone: "(555) 789-0123",
        coordinates: [40.7505, -73.9934],
        distance: 2.8,
        hours: "8:00 AM - 10:00 PM",
        ratings: {
            overall: 4.4,
            cleanliness: 4.6,
            safety: 4.2,
            accessibility: 4.7
        },
        reviewCount: 53,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "neutral", "accessible"],
        isOpen: true
    },
    {
        id: 8,
        name: "Metro Hospital",
        category: "hospital",
        address: "300 Health Plaza",
        phone: "(555) 890-1234",
        coordinates: [40.7831, -73.9712],
        distance: 4.2,
        hours: "24 Hours",
        ratings: {
            overall: 4.0,
            cleanliness: 4.5,
            safety: 4.3,
            accessibility: 4.9
        },
        reviewCount: 76,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"],
        isOpen: true
    }
];

// Sample Users Data
const sampleUsers = [
    {
        id: 1,
        email: "user@gtgotg.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        badge: "Silver",
        isAdmin: false,
        joinDate: "2024-01-15"
    },
    {
        id: 2,
        email: "admin@gtgotg.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        badge: "Expert",
        isAdmin: true,
        joinDate: "2023-12-01"
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing GTGOTG application...');
    
    // Initialize components
    initializeMap();
    initializeSearch();
    initializeFilters();
    initializeAuth();
    loadBusinesses();
    
    // Load stored user session
    loadUserSession();
    
    console.log('✅ GTGOTG application initialized successfully!');
});

// Map Initialization
function initializeMap() {
    console.log('🗺️ Initializing map...');
    
    // Initialize map centered on New York City
    map = L.map('map').setView([40.7128, -74.0060], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = [position.coords.latitude, position.coords.longitude];
                map.setView(userLocation, 15);
                
                // Add user location marker
                L.marker(userLocation)
                    .addTo(map)
                    .bindPopup('📍 Your Location')
                    .openPopup();
                
                console.log('📍 User location found and set');
                updateDistances();
            },
            (error) => {
                console.log('📍 Could not get user location:', error.message);
                showNotification('Could not get your location. Using default location.', 'info');
            }
        );
    }
    
    console.log('✅ Map initialized');
}

// Search Initialization
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });
    
    console.log('🔍 Search initialized');
}

// Handle search input
function handleSearchInput(event) {
    const query = event.target.value.toLowerCase().trim();
    const suggestions = document.getElementById('searchSuggestions');
    
    if (query.length < 2) {
        suggestions.style.display = 'none';
        return;
    }
    
    // Generate suggestions based on businesses
    const matchingBusinesses = sampleBusinesses.filter(business => 
        business.name.toLowerCase().includes(query) ||
        business.address.toLowerCase().includes(query) ||
        business.category.toLowerCase().includes(query)
    ).slice(0, 5);
    
    if (matchingBusinesses.length > 0) {
        suggestions.innerHTML = matchingBusinesses.map(business => `
            <div class="search-suggestion" onclick="selectSuggestion('${business.name}', '${business.address}')">
                <div class="suggestion-main">${business.name}</div>
                <div class="suggestion-subtitle">${business.address} • ${getCategoryName(business.category)}</div>
            </div>
        `).join('');
        suggestions.style.display = 'block';
    } else {
        suggestions.style.display = 'none';
    }
}

// Select search suggestion
function selectSuggestion(name, address) {
    document.getElementById('searchInput').value = name;
    document.getElementById('searchSuggestions').style.display = 'none';
    performSearch();
}

// Perform search
function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
        loadBusinesses();
        return;
    }
    
    const filteredBusinesses = sampleBusinesses.filter(business => 
        business.name.toLowerCase().includes(query) ||
        business.address.toLowerCase().includes(query) ||
        business.category.toLowerCase().includes(query)
    );
    
    currentBusinesses = filteredBusinesses;
    renderBusinesses(filteredBusinesses);
    updateMapMarkers(filteredBusinesses);
    updateSearchResultsInfo(filteredBusinesses.length, query);
    
    console.log(`🔍 Search performed for: "${query}" - ${filteredBusinesses.length} results`);
}

// Get current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser.', 'error');
        return;
    }
    
    showNotification('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = [position.coords.latitude, position.coords.longitude];
            map.setView(userLocation, 15);
            
            // Update or add user location marker
            map.eachLayer((layer) => {
                if (layer.options && layer.options.isUserLocation) {
                    map.removeLayer(layer);
                }
            });
            
            L.marker(userLocation, { isUserLocation: true })
                .addTo(map)
                .bindPopup('📍 Your Current Location')
                .openPopup();
            
            updateDistances();
            showNotification('Location updated successfully!', 'success');
        },
        (error) => {
            let message = 'Could not get your location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Location access denied.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    message += 'Location request timed out.';
                    break;
                default:
                    message += 'Unknown error occurred.';
                    break;
            }
            showNotification(message, 'error');
        }
    );
}

// Update distances based on user location
function updateDistances() {
    if (!userLocation) return;
    
    sampleBusinesses.forEach(business => {
        business.distance = calculateDistance(
            userLocation[0], userLocation[1],
            business.coordinates[0], business.coordinates[1]
        );
    });
    
    // Re-render businesses with updated distances
    renderBusinesses(currentBusinesses);
}

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round((R * c) * 10) / 10; // Round to 1 decimal place
}

// Filter Initialization
function initializeFilters() {
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    // Distance filter
    const distanceFilter = document.getElementById('distanceFilter');
    if (distanceFilter) {
        distanceFilter.addEventListener('change', applyFilters);
    }
    
    // Rating filter
    const ratingFilter = document.getElementById('ratingFilter');
    if (ratingFilter) {
        ratingFilter.addEventListener('change', applyFilters);
    }
    
    console.log('🔧 Filters initialized');
}

// Apply filters
function applyFilters() {
    activeFilters.category = document.getElementById('categoryFilter').value;
    activeFilters.distance = document.getElementById('distanceFilter').value;
    activeFilters.rating = document.getElementById('ratingFilter').value;
    
    let filteredBusinesses = [...sampleBusinesses];
    
    // Apply category filter
    if (activeFilters.category) {
        filteredBusinesses = filteredBusinesses.filter(business => 
            business.category === activeFilters.category
        );
    }
    
    // Apply distance filter
    if (activeFilters.distance && userLocation) {
        const maxDistance = parseFloat(activeFilters.distance);
        filteredBusinesses = filteredBusinesses.filter(business => 
            business.distance <= maxDistance
        );
    }
    
    // Apply rating filter
    if (activeFilters.rating) {
        const minRating = parseFloat(activeFilters.rating);
        filteredBusinesses = filteredBusinesses.filter(business => 
            business.ratings.overall >= minRating
        );
    }
    
    // Apply quick filters
    activeFilters.quickFilters.forEach(filter => {
        switch(filter) {
            case 'wheelchair':
                filteredBusinesses = filteredBusinesses.filter(business => 
                    business.bathroomTypes.includes('accessible') || 
                    business.amenities.includes('ada-compliant')
                );
                break;
            case 'baby-changing':
                filteredBusinesses = filteredBusinesses.filter(business => 
                    business.amenities.includes('baby-changing')
                );
                break;
            case 'open-now':
                filteredBusinesses = filteredBusinesses.filter(business => 
                    business.isOpen
                );
                break;
            case 'high-rated':
                filteredBusinesses = filteredBusinesses.filter(business => 
                    business.ratings.overall >= 4.0
                );
                break;
        }
    });
    
    currentBusinesses = filteredBusinesses;
    renderBusinesses(filteredBusinesses);
    updateMapMarkers(filteredBusinesses);
    updateSearchResultsInfo(filteredBusinesses.length);
    
    console.log(`🔧 Filters applied - ${filteredBusinesses.length} results`);
}

// Toggle quick filter
function toggleQuickFilter(button) {
    const filter = button.dataset.filter;
    
    if (button.classList.contains('active')) {
        button.classList.remove('active');
        activeFilters.quickFilters = activeFilters.quickFilters.filter(f => f !== filter);
    } else {
        button.classList.add('active');
        activeFilters.quickFilters.push(filter);
    }
    
    applyFilters();
}

// Load businesses
function loadBusinesses() {
    currentBusinesses = [...sampleBusinesses];
    renderBusinesses(currentBusinesses);
    updateMapMarkers(currentBusinesses);
    updateSearchResultsInfo(currentBusinesses.length);
}

// Render businesses
function renderBusinesses(businesses) {
    const businessGrid = document.getElementById('businessGrid');
    
    if (!businessGrid) return;
    
    if (businesses.length === 0) {
        businessGrid.innerHTML = `
            <div class="no-results">
                <h3>No restrooms found</h3>
                <p>Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }
    
    businessGrid.innerHTML = businesses.map(business => `
        <div class="business-card">
            <div class="business-header">
                <div>
                    <h4 class="business-name">${business.name}</h4>
                    <p class="business-category">${getCategoryName(business.category)}</p>
                </div>
                <div class="bathroom-types">
                    ${business.bathroomTypes.map(type => getBathroomSymbol(type)).join('')}
                </div>
            </div>
            
            <div class="business-info">
                <p class="business-address">📍 ${business.address}</p>
                <p class="business-distance">📏 ${business.distance} miles away</p>
                <p class="business-hours">🕐 ${business.hours}</p>
                <p class="business-phone">📞 ${business.phone}</p>
            </div>
            
            <div class="business-ratings">
                <div class="rating-item">
                    <span class="rating-label">Overall</span>
                    <div class="rating-value">
                        <span class="stars">${generateStars(business.ratings.overall)}</span>
                        <span class="rating-number">${business.ratings.overall}/5</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Cleanliness</span>
                    <div class="rating-value">
                        <span class="stars">${generateStars(business.ratings.cleanliness)}</span>
                        <span class="rating-number">${business.ratings.cleanliness}/5</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Safety</span>
                    <div class="rating-value">
                        <span class="stars">${generateStars(business.ratings.safety)}</span>
                        <span class="rating-number">${business.ratings.safety}/5</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Accessibility</span>
                    <div class="rating-value">
                        <span class="stars">${generateStars(business.ratings.accessibility)}</span>
                        <span class="rating-number">${business.ratings.accessibility}/5</span>
                    </div>
                </div>
                <div class="review-count">${business.reviewCount} reviews</div>
            </div>
            
            <div class="business-amenities">
                <div class="amenities-list">
                    ${business.amenities.map(amenity => `
                        <span class="amenity-tag">${getAmenityName(amenity)}</span>
                    `).join('')}
                </div>
            </div>
            
            <div class="business-actions">
                <button class="btn btn-primary" onclick="openReviewModal(${business.id})">
                    ⭐ Rate & Review
                </button>
                <button class="btn btn-secondary" onclick="showDirections(${business.id})">
                    🧭 Directions
                </button>
                <button class="btn btn-secondary" onclick="centerMapOnBusiness(${business.id})">
                    🗺️ Show on Map
                </button>
            </div>
        </div>
    `).join('');
}

// Update map markers
function updateMapMarkers(businesses) {
    // Clear existing business markers
    map.eachLayer((layer) => {
        if (layer.options && layer.options.isBusinessMarker) {
            map.removeLayer(layer);
        }
    });
    
    // Add new markers
    businesses.forEach(business => {
        const marker = L.marker(business.coordinates, { isBusinessMarker: true })
            .addTo(map)
            .bindPopup(`
                <div style="text-align: center;">
                    <h4>${business.name}</h4>
                    <p>${getCategoryName(business.category)}</p>
                    <p>⭐ ${business.ratings.overall}/5 (${business.reviewCount} reviews)</p>
                    <button onclick="openReviewModal(${business.id})" style="margin-top: 10px; padding: 5px 10px; background: #8B5CF6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Rate & Review
                    </button>
                </div>
            `);
    });
}

// Update search results info
function updateSearchResultsInfo(count, query = '') {
    const info = document.getElementById('searchResultsInfo');
    if (!info) return;
    
    if (query) {
        info.textContent = `Found ${count} restroom${count !== 1 ? 's' : ''} matching "${query}"`;
    } else {
        info.textContent = `Showing ${count} restroom${count !== 1 ? 's' : ''} in your area`;
    }
}

// Helper Functions
function getCategoryName(category) {
    const categories = {
        'gas-station': 'Gas Station',
        'restaurant': 'Restaurant',
        'coffee-shop': 'Coffee Shop',
        'retail': 'Retail Store',
        'hotel': 'Hotel',
        'park': 'Park',
        'hospital': 'Hospital',
        'library': 'Library'
    };
    return categories[category] || category;
}

function getBathroomSymbol(type) {
    const symbols = {
        'mens': '<span class="bathroom-symbol" title="Men\'s Restroom">🚹</span>',
        'womens': '<span class="bathroom-symbol" title="Women\'s Restroom">🚺</span>',
        'neutral': '<span class="bathroom-symbol" title="Gender Neutral">🚻</span>',
        'accessible': '<span class="bathroom-symbol" title="Wheelchair Accessible">♿</span>'
    };
    return symbols[type] || '';
}

function getAmenityName(amenity) {
    const amenities = {
        'toilet-paper': 'Toilet Paper',
        'soap': 'Soap',
        'paper-towels': 'Paper Towels',
        'hand-dryer': 'Hand Dryer',
        'baby-changing': 'Baby Changing',
        'ada-compliant': 'ADA Compliant'
    };
    return amenities[amenity] || amenity;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
}

// Map Control Functions
function centerMapOnUser() {
    if (userLocation) {
        map.setView(userLocation, 15);
        showNotification('Map centered on your location', 'info');
    } else {
        showNotification('Location not available', 'warning');
    }
}

function centerMapOnBusiness(businessId) {
    const business = sampleBusinesses.find(b => b.id === businessId);
    if (business) {
        map.setView(business.coordinates, 16);
        showNotification(`Showing ${business.name} on map`, 'info');
    }
}

function toggleMapView() {
    // Toggle between different map views (could add satellite, terrain, etc.)
    showNotification('Map view toggled', 'info');
}

function showDirections(businessId) {
    const business = sampleBusinesses.find(b => b.id === businessId);
    if (business) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${business.coordinates[0]},${business.coordinates[1]}`;
        window.open(url, '_blank');
    }
}

// Authentication Functions
function initializeAuth() {
    // Initialize stored users if not exists
    if (!localStorage.getItem('gtgotg_users')) {
        localStorage.setItem('gtgotg_users', JSON.stringify(sampleUsers));
    }
    
    console.log('🔐 Authentication initialized');
}

function loadUserSession() {
    const storedUser = localStorage.getItem('gtgotg_current_user');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUserStatus();
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('gtgotg_current_user', JSON.stringify(user));
        updateUserStatus();
        closeModal('loginModal');
        showNotification(`Welcome back, ${user.firstName}!`, 'success');
        
        // Clear form
        event.target.reset();
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    
    if (users.find(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        email,
        password,
        firstName,
        lastName,
        badge: 'Reviewer',
        isAdmin: false,
        joinDate: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    localStorage.setItem('gtgotg_users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('gtgotg_current_user', JSON.stringify(newUser));
    
    updateUserStatus();
    closeModal('registerModal');
    showNotification(`Welcome to GTGOTG, ${firstName}!`, 'success');
    
    // Clear form
    event.target.reset();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('gtgotg_current_user');
    updateUserStatus();
    showNotification('Logged out successfully', 'info');
}

function updateUserStatus() {
    const userStatus = document.getElementById('userStatus');
    const userName = document.getElementById('userName');
    const userBadge = document.getElementById('userBadge');
    const adminBtn = document.getElementById('adminBtn');
    const loginBtn = document.querySelector('button[onclick="showModal(\'loginModal\')"]');
    const signUpBtn = document.querySelector('button[onclick="showModal(\'registerModal\')"]');
    
    if (currentUser) {
        userStatus.style.display = 'block';
        userName.textContent = currentUser.firstName;
        userBadge.textContent = currentUser.badge;
        
        if (currentUser.isAdmin) {
            adminBtn.style.display = 'inline-block';
        } else {
            adminBtn.style.display = 'none';
        }
        
        loginBtn.style.display = 'none';
        signUpBtn.style.display = 'none';
    } else {
        userStatus.style.display = 'none';
        adminBtn.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        signUpBtn.style.display = 'inline-block';
    }
}

// Admin Functions
function showAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    // Load tab content
    switch(tabName) {
        case 'analytics':
            loadAnalytics();
            break;
        case 'businesses':
            loadAdminBusinesses();
            break;
        case 'reviews':
            loadAdminReviews();
            break;
        case 'users':
            loadAdminUsers();
            break;
    }
}

function loadAnalytics() {
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    
    document.getElementById('totalBusinesses').textContent = sampleBusinesses.length;
    document.getElementById('totalReviews').textContent = reviews.length;
    document.getElementById('totalUsers').textContent = users.length;
    
    const avgRating = sampleBusinesses.reduce((sum, b) => sum + b.ratings.overall, 0) / sampleBusinesses.length;
    document.getElementById('averageRating').textContent = avgRating.toFixed(1);
}

function loadAdminBusinesses() {
    const list = document.getElementById('adminBusinessList');
    list.innerHTML = sampleBusinesses.map(business => `
        <div class="admin-item">
            <div class="admin-item-info">
                <h6>${business.name}</h6>
                <p>${business.address} • ${getCategoryName(business.category)}</p>
                <p>⭐ ${business.ratings.overall}/5 (${business.reviewCount} reviews)</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-small btn-secondary">Edit</button>
                <button class="btn btn-small btn-admin">Delete</button>
            </div>
        </div>
    `).join('');
}

function loadAdminReviews() {
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    const list = document.getElementById('adminReviewList');
    
    if (reviews.length === 0) {
        list.innerHTML = '<p>No reviews yet.</p>';
        return;
    }
    
    list.innerHTML = reviews.map(review => {
        const business = sampleBusinesses.find(b => b.id === review.businessId);
        return `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h6>Review for ${business ? business.name : 'Unknown Business'}</h6>
                    <p>Overall: ${review.ratings.overall}/10 • ${review.bathroomType} bathroom</p>
                    <p>${review.comment || 'No comment'}</p>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-small btn-secondary">View</button>
                    <button class="btn btn-small btn-admin">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function loadAdminUsers() {
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    const list = document.getElementById('adminUserList');
    
    list.innerHTML = users.map(user => `
        <div class="admin-item">
            <div class="admin-item-info">
                <h6>${user.firstName} ${user.lastName}</h6>
                <p>${user.email} • ${user.badge} Badge</p>
                <p>Joined: ${user.joinDate}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-small btn-secondary">Edit</button>
                ${!user.isAdmin ? '<button class="btn btn-small btn-admin">Ban</button>' : ''}
            </div>
        </div>
    `).join('');
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Export functions for global use
window.performSearch = performSearch;
window.getCurrentLocation = getCurrentLocation;
window.applyFilters = applyFilters;
window.toggleQuickFilter = toggleQuickFilter;
window.centerMapOnUser = centerMapOnUser;
window.centerMapOnBusiness = centerMapOnBusiness;
window.toggleMapView = toggleMapView;
window.showDirections = showDirections;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.showModal = showModal;
window.closeModal = closeModal;
window.showAdminTab = showAdminTab;
window.selectSuggestion = selectSuggestion;

console.log('✅ GTGOTG - Got To Go On The Go - Loaded successfully!');
