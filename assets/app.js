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

// Sample Business Data with Real Recognizable Businesses
const sampleBusinesses = [
    {
        id: 1,
        name: "McDonald's",
        category: "restaurant",
        address: "123 Main St, Downtown",
        phone: "(555) 123-4567",
        coordinates: [40.7128, -74.0060],
        distance: 0.3,
        hours: "6:00 AM - 11:00 PM",
        ratings: {
            overall: 7.2,
            cleanliness: 6.8,
            safety: 7.5,
            accessibility: 8.2
        },
        reviewCount: 124,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing"],
        bathroomTypes: ["mens", "womens", "accessible"],
        isOpen: true
    },
    {
        id: 2,
        name: "Shell Gas Station",
        category: "gas-station",
        address: "456 Highway Blvd",
        phone: "(555) 234-5678",
        coordinates: [40.7589, -73.9851],
        distance: 1.2,
        hours: "24 Hours",
        ratings: {
            overall: 6.4,
            cleanliness: 5.8,
            safety: 6.9,
            accessibility: 7.1
        },
        reviewCount: 89,
        amenities: ["toilet-paper", "soap", "hand-dryer", "ada-compliant"],
        bathroomTypes: ["neutral", "accessible"],
        isOpen: true
    },
    {
        id: 3,
        name: "Starbucks Coffee",
        category: "coffee-shop",
        address: "789 Oak Avenue",
        phone: "(555) 345-6789",
        coordinates: [40.7505, -73.9934],
        distance: 0.8,
        hours: "5:00 AM - 10:00 PM",
        ratings: {
            overall: 8.7,
            cleanliness: 9.1,
            safety: 8.4,
            accessibility: 8.9
        },
        reviewCount: 203,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"],
        isOpen: true
    },
    {
        id: 4,
        name: "Walmart Supercenter",
        category: "retail",
        address: "321 Commerce Drive",
        phone: "(555) 456-7890",
        coordinates: [40.7282, -74.0776],
        distance: 2.1,
        hours: "6:00 AM - 11:00 PM",
        ratings: {
            overall: 7.8,
            cleanliness: 7.5,
            safety: 8.1,
            accessibility: 9.2
        },
        reviewCount: 156,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"],
        isOpen: true
    },
    {
        id: 5,
        name: "Target",
        category: "retail",
        address: "654 Shopping Plaza",
        phone: "(555) 567-8901",
        coordinates: [40.7614, -73.9776],
        distance: 1.7,
        hours: "8:00 AM - 10:00 PM",
        ratings: {
            overall: 8.3,
            cleanliness: 8.7,
            safety: 8.0,
            accessibility: 9.1
        },
        reviewCount: 178,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"],
        isOpen: true
    },
    {
        id: 6,
        name: "Subway",
        category: "restaurant",
        address: "987 Food Court Way",
        phone: "(555) 678-9012",
        coordinates: [40.7505, -74.0014],
        distance: 0.6,
        hours: "7:00 AM - 10:00 PM",
        ratings: {
            overall: 6.9,
            cleanliness: 6.5,
            safety: 7.2,
            accessibility: 7.8
        },
        reviewCount: 67,
        amenities: ["toilet-paper", "soap", "hand-dryer"],
        bathroomTypes: ["neutral"],
        isOpen: true
    },
    {
        id: 7,
        name: "Dunkin' Donuts",
        category: "coffee-shop",
        address: "147 Morning Street",
        phone: "(555) 789-0123",
        coordinates: [40.7392, -74.0020],
        distance: 1.1,
        hours: "5:00 AM - 9:00 PM",
        ratings: {
            overall: 7.6,
            cleanliness: 7.8,
            safety: 7.4,
            accessibility: 7.9
        },
        reviewCount: 92,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer"],
        bathroomTypes: ["mens", "womens"],
        isOpen: true
    },
    {
        id: 8,
        name: "CVS Pharmacy",
        category: "retail",
        address: "258 Health Plaza",
        phone: "(555) 890-1234",
        coordinates: [40.7451, -73.9903],
        distance: 1.4,
        hours: "8:00 AM - 10:00 PM",
        ratings: {
            overall: 7.1,
            cleanliness: 7.3,
            safety: 6.9,
            accessibility: 8.5
        },
        reviewCount: 45,
        amenities: ["toilet-paper", "soap", "hand-dryer", "ada-compliant"],
        bathroomTypes: ["neutral", "accessible"],
        isOpen: true
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing GTGOTG application...');
    
    initializeMap();
    renderBusinesses(sampleBusinesses);
    initializeSearch();
    initializeFilters();
    checkUserLogin();
    
    console.log('✅ GTGOTG application initialized successfully');
});

// Initialize Map
function initializeMap() {
    console.log('🗺️ Initializing map...');
    
    try {
        // Default to New York City coordinates
        const defaultLat = 40.7128;
        const defaultLng = -74.0060;
        
        // Initialize map
        map = L.map('map').setView([defaultLat, defaultLng], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add business markers
        addBusinessMarkersToMap();
        
        console.log('✅ Map initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing map:', error);
        showNotification('Map failed to load. Please refresh the page.', 'error');
    }
}

// Add business markers to map
function addBusinessMarkersToMap() {
    if (!map) return;
    
    sampleBusinesses.forEach(business => {
        const marker = L.marker(business.coordinates).addTo(map);
        
        const popupContent = `
            <div style="min-width: 200px;">
                <h4 style="margin: 0 0 0.5rem 0; color: #8B5CF6;">${business.name}</h4>
                <p style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.9rem;">${business.address}</p>
                <div style="margin: 0.5rem 0;">
                    <strong>Overall Rating: ${business.ratings.overall.toFixed(1)}/10</strong>
                    <div style="color: #f59e0b; font-size: 0.9rem;">${generateStars(business.ratings.overall)}</div>
                </div>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #64748b;">${business.reviewCount} reviews</p>
                <button onclick="openReviewModal(${business.id})" style="background: #8B5CF6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; margin-top: 0.5rem;">Rate & Review</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
    });
}

// Generate star display for ratings
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '★';
    if (hasHalfStar) stars += '☆';
    for (let i = 0; i < emptyStars; i++) stars += '☆';
    
    return stars;
}

// Initialize Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
}

// Handle search input
function handleSearchInput(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    // Filter businesses based on search query
    const suggestions = sampleBusinesses.filter(business => 
        business.name.toLowerCase().includes(query) ||
        business.address.toLowerCase().includes(query) ||
        business.category.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to 5 suggestions
    
    showSuggestions(suggestions);
}

// Show search suggestions
function showSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) return;
    
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsContainer.innerHTML = suggestions.map(business => `
        <div class="search-suggestion" onclick="selectSuggestion('${business.name}')">
            <div class="suggestion-main">${business.name}</div>
            <div class="suggestion-subtitle">${business.address} • ${business.distance} mi</div>
        </div>
    `).join('');
    
    suggestionsContainer.style.display = 'block';
}

// Hide search suggestions
function hideSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

// Select a suggestion
function selectSuggestion(businessName) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = businessName;
    }
    hideSuggestions();
    performSearch();
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    console.log(`🔍 Performing search for: "${query}"`);
    
    if (!query) {
        currentBusinesses = [...sampleBusinesses];
    } else {
        currentBusinesses = sampleBusinesses.filter(business => 
            business.name.toLowerCase().includes(query) ||
            business.address.toLowerCase().includes(query) ||
            business.category.toLowerCase().includes(query)
        );
    }
    
    // Apply current filters
    applyFilters();
    
    // Update search results info
    updateSearchResultsInfo(query, currentBusinesses.length);
    
    hideSuggestions();
}

// Update search results info
function updateSearchResultsInfo(query, count) {
    const infoElement = document.getElementById('searchResultsInfo');
    if (!infoElement) return;
    
    if (query) {
        infoElement.textContent = `Found ${count} restroom${count !== 1 ? 's' : ''} for "${query}"`;
    } else {
        infoElement.textContent = `Showing ${count} restroom${count !== 1 ? 's' : ''} in your area`;
    }
}

// Initialize Filters
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const distanceFilter = document.getElementById('distanceFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (distanceFilter) distanceFilter.addEventListener('change', applyFilters);
    if (ratingFilter) ratingFilter.addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
    console.log('🔧 Applying filters...');
    
    let filteredBusinesses = [...currentBusinesses];
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter && categoryFilter.value) {
        filteredBusinesses = filteredBusinesses.filter(b => b.category === categoryFilter.value);
    }
    
    // Distance filter
    const distanceFilter = document.getElementById('distanceFilter');
    if (distanceFilter && distanceFilter.value) {
        const maxDistance = parseFloat(distanceFilter.value);
        filteredBusinesses = filteredBusinesses.filter(b => b.distance <= maxDistance);
    }
    
    // Rating filter
    const ratingFilter = document.getElementById('ratingFilter');
    if (ratingFilter && ratingFilter.value) {
        const minRating = parseFloat(ratingFilter.value);
        filteredBusinesses = filteredBusinesses.filter(b => b.ratings.overall >= minRating);
    }
    
    // Quick filters
    activeFilters.quickFilters.forEach(filter => {
        switch (filter) {
            case 'wheelchair':
                filteredBusinesses = filteredBusinesses.filter(b => 
                    b.bathroomTypes.includes('accessible') || b.amenities.includes('ada-compliant')
                );
                break;
            case 'baby-changing':
                filteredBusinesses = filteredBusinesses.filter(b => 
                    b.amenities.includes('baby-changing')
                );
                break;
            case 'open-now':
                filteredBusinesses = filteredBusinesses.filter(b => b.isOpen);
                break;
            case 'high-rated':
                filteredBusinesses = filteredBusinesses.filter(b => b.ratings.overall >= 8.0);
                break;
        }
    });
    
    renderBusinesses(filteredBusinesses);
}

// Toggle quick filter
function toggleQuickFilter(button) {
    const filter = button.dataset.filter;
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        button.classList.remove('active');
        activeFilters.quickFilters = activeFilters.quickFilters.filter(f => f !== filter);
    } else {
        button.classList.add('active');
        activeFilters.quickFilters.push(filter);
    }
    
    applyFilters();
}

// Render businesses
function renderBusinesses(businesses) {
    const grid = document.getElementById('businessGrid');
    if (!grid) return;
    
    if (businesses.length === 0) {
        grid.innerHTML = '<div class="no-results">No restrooms found matching your criteria. Try adjusting your filters.</div>';
        return;
    }
    
    grid.innerHTML = businesses.map(business => createBusinessCard(business)).join('');
}

// Create business card HTML
function createBusinessCard(business) {
    const bathroomSymbols = business.bathroomTypes.map(type => {
        switch (type) {
            case 'mens': return '🚹';
            case 'womens': return '🚺';
            case 'neutral': return '🚻';
            case 'accessible': return '♿';
            default: return '';
        }
    }).join('');
    
    const amenityTags = business.amenities.map(amenity => {
        const amenityNames = {
            'toilet-paper': 'Toilet Paper',
            'soap': 'Soap',
            'paper-towels': 'Paper Towels',
            'hand-dryer': 'Hand Dryer',
            'baby-changing': 'Baby Changing',
            'ada-compliant': 'ADA Compliant'
        };
        return `<span class="amenity-tag">${amenityNames[amenity] || amenity}</span>`;
    }).join('');
    
    return `
        <div class="business-card">
            <div class="business-header">
                <div>
                    <h4 class="business-name">${business.name}</h4>
                    <p class="business-category">${formatCategory(business.category)}</p>
                </div>
                <div class="bathroom-types">
                    ${bathroomSymbols.split('').map(symbol => 
                        `<span class="bathroom-symbol">${symbol}</span>`
                    ).join('')}
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
                    <span class="rating-label">Overall:</span>
                    <div class="rating-value">
                        <span class="stars">${generateStars(business.ratings.overall)}</span>
                        <span class="rating-number">${business.ratings.overall.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Cleanliness:</span>
                    <div class="rating-value">
                        <span class="stars">${generateStars(business.ratings.cleanliness)}</span>
                        <span class="rating-number">${business.ratings.cleanliness.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Safety:</span>
                    <div class="rating-value">
                        <span class="stars">${generateStars(business.ratings.safety)}</span>
                        <span class="rating-number">${business.ratings.safety.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Accessibility:</span>
                    <div class="rating-value">
                        <span class="stars">${generateStars(business.ratings.accessibility)}</span>
                        <span class="rating-number">${business.ratings.accessibility.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="review-count">${business.reviewCount} reviews</div>
            </div>
            
            <div class="business-amenities">
                <div class="amenities-list">
                    ${amenityTags}
                </div>
            </div>
            
            <div class="business-actions">
                <button class="btn btn-primary" onclick="openReviewModal(${business.id})">Rate & Review</button>
                <button class="btn btn-secondary" onclick="getDirections(${business.coordinates[0]}, ${business.coordinates[1]})">Get Directions</button>
                <button class="btn btn-secondary" onclick="centerMapOnBusiness(${business.coordinates[0]}, ${business.coordinates[1]})">Show on Map</button>
            </div>
        </div>
    `;
}

// Format category for display
function formatCategory(category) {
    const categoryNames = {
        'gas-station': 'Gas Station',
        'restaurant': 'Restaurant',
        'coffee-shop': 'Coffee Shop',
        'retail': 'Retail Store',
        'hotel': 'Hotel',
        'park': 'Park',
        'hospital': 'Hospital',
        'library': 'Library'
    };
    return categoryNames[category] || category;
}

// Get current location
function getCurrentLocation() {
    console.log('📍 Getting current location...');
    
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser.', 'error');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            console.log('✅ Location obtained:', userLocation);
            
            // Update map view
            if (map) {
                map.setView([userLocation.lat, userLocation.lng], 15);
                
                // Add user location marker
                L.marker([userLocation.lat, userLocation.lng])
                    .addTo(map)
                    .bindPopup('Your Location')
                    .openPopup();
            }
            
            // Update business distances
            updateBusinessDistances();
            
            showNotification('Location updated successfully!', 'success');
        },
        function(error) {
            console.error('❌ Error getting location:', error);
            showNotification('Unable to get your location. Please check your browser settings.', 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

// Update business distances based on user location
function updateBusinessDistances() {
    if (!userLocation) return;
    
    sampleBusinesses.forEach(business => {
        business.distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            business.coordinates[0], business.coordinates[1]
        );
    });
    
    // Re-render businesses with updated distances
    renderBusinesses(currentBusinesses);
}

// Calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
}

// Center map on business
function centerMapOnBusiness(lat, lng) {
    if (map) {
        map.setView([lat, lng], 16);
    }
}

// Center map on user
function centerMapOnUser() {
    if (userLocation && map) {
        map.setView([userLocation.lat, userLocation.lng], 15);
    } else {
        getCurrentLocation();
    }
}

// Toggle map view
function toggleMapView() {
    if (map) {
        const currentZoom = map.getZoom();
        const newZoom = currentZoom > 15 ? 13 : 18;
        map.setZoom(newZoom);
    }
}

// Get directions
function getDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

// Modal functions
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

// Open review modal
function openReviewModal(businessId) {
    const business = sampleBusinesses.find(b => b.id === businessId);
    if (!business) return;
    
    currentBusinessForReview = businessId;
    
    // Update modal title
    const titleElement = document.getElementById('businessNameDisplay');
    if (titleElement) {
        titleElement.textContent = `Rate ${business.name}`;
    }
    
    showModal('reviewModal');
    console.log(`📝 Opened review modal for: ${business.name}`);
}

// Handle review submission
function handleReviewSubmission(event) {
    event.preventDefault();
    console.log('📝 Submitting review...');
    
    // Get form data
    const formData = new FormData(event.target);
    const comment = formData.get('comment') || '';
    
    // Create review object
    const review = {
        businessId: currentBusinessForReview,
        userId: currentUser ? currentUser.id : null,
        comment: comment,
        timestamp: new Date().toISOString(),
        anonymous: !currentUser
    };
    
    // Store review
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    reviews.push(review);
    localStorage.setItem('gtgotg_reviews', JSON.stringify(reviews));
    
    // Show success message
    showNotification('Review submitted successfully! Thank you for helping others find great restrooms.', 'success');
    
    // Close modal and reset form
    closeModal('reviewModal');
    event.target.reset();
    
    console.log('✅ Review submitted successfully');
}

// User authentication functions
function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    console.log(`🔐 Attempting login for: ${email}`);
    
    // Check test accounts
    if ((email === 'user@gtgotg.com' && password === 'password123') ||
        (email === 'admin@gtgotg.com' && password === 'admin123')) {
        
        currentUser = {
            id: Date.now(),
            email: email,
            name: email === 'admin@gtgotg.com' ? 'Admin User' : 'Test User',
            badge: 'Reviewer',
            isAdmin: email === 'admin@gtgotg.com'
        };
        
        updateUserStatus();
        closeModal('loginModal');
        showNotification(`Welcome back, ${currentUser.name}!`, 'success');
        
        console.log('✅ Login successful');
    } else {
        showNotification('Invalid email or password.', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    
    currentUser = {
        id: Date.now(),
        email: email,
        name: `${firstName} ${lastName}`,
        badge: 'Reviewer',
        isAdmin: false
    };
    
    // Store user data
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    users.push(currentUser);
    localStorage.setItem('gtgotg_users', JSON.stringify(users));
    
    updateUserStatus();
    closeModal('registerModal');
    showNotification(`Welcome to GTGOTG, ${currentUser.name}!`, 'success');
    
    console.log('✅ Registration successful');
}

function logout() {
    currentUser = null;
    updateUserStatus();
    showNotification('You have been logged out.', 'info');
    console.log('👋 User logged out');
}

function updateUserStatus() {
    const userStatus = document.getElementById('userStatus');
    const userName = document.getElementById('userName');
    const userBadge = document.getElementById('userBadge');
    const adminBtn = document.getElementById('adminBtn');
    const loginBtn = document.querySelector('button[onclick="showModal(\'loginModal\')"]');
    const signUpBtn = document.querySelector('button[onclick="showModal(\'registerModal\')"]');
    
    if (currentUser) {
        if (userStatus) userStatus.style.display = 'block';
        if (userName) userName.textContent = currentUser.name;
        if (userBadge) userBadge.textContent = currentUser.badge;
        if (adminBtn && currentUser.isAdmin) adminBtn.style.display = 'inline-block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (signUpBtn) signUpBtn.style.display = 'none';
    } else {
        if (userStatus) userStatus.style.display = 'none';
        if (adminBtn) adminBtn.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signUpBtn) signUpBtn.style.display = 'inline-block';
    }
}

function checkUserLogin() {
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('gtgotg_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserStatus();
    }
}

// Admin functions
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
    const selectedTab = document.getElementById(`${tabName}Tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load tab content
    if (tabName === 'analytics') {
        loadAnalytics();
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

// Notification system
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

// Initialize current businesses
currentBusinesses = [...sampleBusinesses];

// Export functions to global scope
window.performSearch = performSearch;
window.getCurrentLocation = getCurrentLocation;
window.applyFilters = applyFilters;
window.toggleQuickFilter = toggleQuickFilter;
window.openReviewModal = openReviewModal;
window.handleReviewSubmission = handleReviewSubmission;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.showModal = showModal;
window.closeModal = closeModal;
window.showAdminTab = showAdminTab;
window.centerMapOnUser = centerMapOnUser;
window.toggleMapView = toggleMapView;
window.getDirections = getDirections;
window.centerMapOnBusiness = centerMapOnBusiness;
window.selectSuggestion = selectSuggestion;

console.log('✅ GTGOTG - Got To Go On The Go - Loaded successfully!');
