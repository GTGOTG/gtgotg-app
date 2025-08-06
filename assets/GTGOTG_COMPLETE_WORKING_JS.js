// GTGOTG - "Got To Go On The Go" - Complete Application
// Copyright © 2025 Jessica Esposito / Colorado Quality LLC. All rights reserved.

console.log('🚽 GTGOTG - Got To Go On The Go - Initializing...');

// Global variables
let currentUser = null;
let currentBusinesses = [];
let currentBusinessForReview = null;
let map = null;
let userLocation = null;
let businessMarkers = [];

// Photo upload configuration
const PHOTO_CONFIG = {
    maxFiles: 3,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

// Review system variables
let selectedPhotos = [];
let selectedBathroomType = null;
let isWheelchairAccessible = false;
let currentRatings = {
    overall: 0,
    cleanliness: 0,
    safety: 0,
    accessibility: 0
};

// Sample business data with comprehensive coverage
const sampleBusinesses = [
    {
        id: 1,
        name: "Shell Gas Station",
        category: "gas_station",
        address: "1234 Main St, Denver, CO 80202",
        coordinates: { lat: 39.7392, lng: -104.9903 },
        distance: "0.2 miles",
        ratings: { overall: 8.5, cleanliness: 9.0, safety: 8.0, accessibility: 7.5 },
        reviewCount: 127,
        amenities: ["soap", "paper_towels", "toilet_paper", "wheelchair_accessible"],
        bathroomTypes: ["mens", "womens", "accessible"],
        hours: "24/7",
        verified: true,
        photos: []
    },
    {
        id: 2,
        name: "McDonald's",
        category: "restaurant",
        address: "5678 Broadway, Denver, CO 80203",
        coordinates: { lat: 39.7317, lng: -104.9804 },
        distance: "0.5 miles",
        ratings: { overall: 7.8, cleanliness: 8.2, safety: 8.5, accessibility: 8.0 },
        reviewCount: 89,
        amenities: ["soap", "hand_dryer", "toilet_paper", "baby_changing", "wheelchair_accessible"],
        bathroomTypes: ["mens", "womens", "accessible"],
        hours: "6:00 AM - 11:00 PM",
        verified: true,
        photos: []
    },
    {
        id: 3,
        name: "Starbucks Coffee",
        category: "coffee_shop",
        address: "9012 17th Ave, Denver, CO 80204",
        coordinates: { lat: 39.7462, lng: -105.0178 },
        distance: "0.8 miles",
        ratings: { overall: 8.9, cleanliness: 9.2, safety: 9.0, accessibility: 8.5 },
        reviewCount: 156,
        amenities: ["soap", "paper_towels", "hand_dryer", "toilet_paper", "air_freshener"],
        bathroomTypes: ["unisex"],
        hours: "5:30 AM - 9:00 PM",
        verified: true,
        photos: []
    },
    {
        id: 4,
        name: "Walmart Supercenter",
        category: "retail",
        address: "3456 Colorado Blvd, Denver, CO 80205",
        coordinates: { lat: 39.7645, lng: -104.9402 },
        distance: "1.2 miles",
        ratings: { overall: 7.2, cleanliness: 7.5, safety: 7.8, accessibility: 9.0 },
        reviewCount: 203,
        amenities: ["soap", "paper_towels", "toilet_paper", "baby_changing", "wheelchair_accessible", "family_restroom"],
        bathroomTypes: ["mens", "womens", "family", "accessible"],
        hours: "6:00 AM - 11:00 PM",
        verified: true,
        photos: []
    },
    {
        id: 5,
        name: "Target",
        category: "retail",
        address: "7890 Federal Blvd, Denver, CO 80221",
        coordinates: { lat: 39.8315, lng: -105.0253 },
        distance: "1.5 miles",
        ratings: { overall: 8.3, cleanliness: 8.7, safety: 8.5, accessibility: 8.8 },
        reviewCount: 94,
        amenities: ["soap", "paper_towels", "hand_dryer", "toilet_paper", "baby_changing", "wheelchair_accessible"],
        bathroomTypes: ["mens", "womens", "family", "accessible"],
        hours: "8:00 AM - 10:00 PM",
        verified: true,
        photos: []
    },
    {
        id: 6,
        name: "Colorado Rest Area - Mile 247",
        category: "rest_area",
        address: "I-25 Mile 247, Colorado Springs, CO 80909",
        coordinates: { lat: 38.8339, lng: -104.8214 },
        distance: "65 miles",
        ratings: { overall: 6.8, cleanliness: 6.5, safety: 7.2, accessibility: 8.0 },
        reviewCount: 78,
        amenities: ["soap", "paper_towels", "toilet_paper", "wheelchair_accessible", "baby_changing"],
        bathroomTypes: ["mens", "womens", "accessible"],
        hours: "24/7",
        verified: true,
        photos: []
    },
    {
        id: 7,
        name: "Denver International Airport - Terminal B",
        category: "airport",
        address: "8500 Peña Blvd, Denver, CO 80249",
        coordinates: { lat: 39.8561, lng: -104.6737 },
        distance: "25 miles",
        ratings: { overall: 8.7, cleanliness: 9.1, safety: 9.2, accessibility: 9.5 },
        reviewCount: 312,
        amenities: ["soap", "paper_towels", "hand_dryer", "toilet_paper", "wheelchair_accessible", "baby_changing", "family_restroom"],
        bathroomTypes: ["mens", "womens", "family", "accessible"],
        hours: "24/7",
        verified: true,
        photos: []
    },
    {
        id: 8,
        name: "Cherry Creek Mall",
        category: "mall",
        address: "3000 E 1st Ave, Denver, CO 80206",
        coordinates: { lat: 39.7197, lng: -104.9533 },
        distance: "2.1 miles",
        ratings: { overall: 8.1, cleanliness: 8.4, safety: 8.3, accessibility: 8.7 },
        reviewCount: 145,
        amenities: ["soap", "paper_towels", "hand_dryer", "toilet_paper", "baby_changing", "wheelchair_accessible", "family_restroom"],
        bathroomTypes: ["mens", "womens", "family", "accessible"],
        hours: "10:00 AM - 9:00 PM",
        verified: true,
        photos: []
    }
];

// Sample users for testing
const sampleUsers = [
    {
        id: 1,
        username: "johndoe",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        badge: "Bronze",
        reviewCount: 8,
        joinDate: "2024-01-15",
        city: "Denver"
    },
    {
        id: 2,
        username: "admin",
        email: "admin@gtgotg.com",
        firstName: "Admin",
        lastName: "User",
        password: "gtgotg2025!",
        badge: "Expert",
        reviewCount: 50,
        joinDate: "2024-01-01",
        city: "Denver",
        isAdmin: true
    }
];

// Initialize application
function initializeApp() {
    console.log('🔧 Setting up UI components...');
    
    // Initialize map
    initializeMap();
    
    // Set up event handlers
    setupEventHandlers();
    
    // Initialize enhanced review system
    initializeEnhancedReviewSystem();
    
    // Load initial data
    loadBusinesses();
    
    // Check for saved user session
    checkUserSession();
    
    console.log('✅ GTGOTG - Application initialized successfully!');
}

// Initialize OpenStreetMap
function initializeMap() {
    console.log('🗺️ Initializing OpenStreetMap...');
    
    try {
        // Initialize map centered on Denver
        map = L.map('map').setView([39.7392, -104.9903], 12);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add custom markers for businesses
        addBusinessMarkersToMap();
        
        console.log('✅ OpenStreetMap initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing map:', error);
        document.getElementById('map').innerHTML = `
            <div class="map-placeholder">
                <h4>Map Temporarily Unavailable</h4>
                <p>Please use the list view below to find restrooms</p>
            </div>
        `;
    }
}

// Add business markers to map
function addBusinessMarkersToMap() {
    if (!map) return;
    
    // Clear existing markers
    businessMarkers.forEach(marker => map.removeLayer(marker));
    businessMarkers = [];
    
    // Add markers for each business
    currentBusinesses.forEach(business => {
        const marker = L.marker([business.coordinates.lat, business.coordinates.lng])
            .addTo(map)
            .bindPopup(`
                <div class="map-popup">
                    <h4>${business.name}</h4>
                    <p>${business.address}</p>
                    <p>⭐ ${business.ratings.overall.toFixed(1)}/10 (${business.reviewCount} reviews)</p>
                    <button onclick="openReviewModal(${business.id})" class="btn btn-primary btn-sm">Rate This Restroom</button>
                </div>
            `);
        
        businessMarkers.push(marker);
    });
}

// Setup event handlers
function setupEventHandlers() {
    console.log('🔧 Setting up event handlers...');
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const locationBtn = document.getElementById('locationBtn');
    
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        searchInput.addEventListener('input', handleSearchInput);
    }
    if (locationBtn) locationBtn.addEventListener('click', enableLocation);
    
    // Filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (sortBy) sortBy.addEventListener('change', applyFilters);
    
    // Quick filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const category = e.target.dataset.category;
            if (categoryFilter) categoryFilter.value = category;
            applyFilters();
        });
    });
    
    // Authentication
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBtn = document.getElementById('adminBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', () => showModal('loginModal'));
    if (signupBtn) signupBtn.addEventListener('click', () => showModal('signupModal'));
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (adminBtn) adminBtn.addEventListener('click', () => showModal('adminModal'));
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const reviewForm = document.getElementById('reviewForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (reviewForm) reviewForm.addEventListener('submit', handleReviewSubmission);
    
    // Modal close handlers
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach(close => {
        close.addEventListener('click', (e) => {
            const modal = e.target.dataset.modal || e.target.closest('.modal').id;
            closeModal(modal);
        });
    });
    
    // Admin panel tabs
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchAdminTab(tabName);
        });
    });
    
    // Notification close
    const notificationClose = document.getElementById('notificationClose');
    if (notificationClose) {
        notificationClose.addEventListener('click', () => {
            document.getElementById('notification').style.display = 'none';
        });
    }
    
    console.log('✅ Event handlers set up successfully');
}

// Enhanced search functionality
function handleSearchInput(e) {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    // Generate search suggestions
    const suggestions = generateSearchSuggestions(query);
    showSuggestions(suggestions);
}

function generateSearchSuggestions(query) {
    const suggestions = [];
    
    // Business name suggestions
    sampleBusinesses.forEach(business => {
        if (business.name.toLowerCase().includes(query)) {
            suggestions.push({
                type: 'business',
                text: business.name,
                subtitle: business.address
            });
        }
    });
    
    // Category suggestions
    const categories = {
        'gas': 'Gas Stations',
        'food': 'Restaurants',
        'coffee': 'Coffee Shops',
        'rest': 'Rest Areas',
        'hotel': 'Hotels',
        'mall': 'Shopping Malls',
        'park': 'Parks'
    };
    
    Object.keys(categories).forEach(key => {
        if (key.includes(query) || categories[key].toLowerCase().includes(query)) {
            suggestions.push({
                type: 'category',
                text: categories[key],
                subtitle: 'Search by category'
            });
        }
    });
    
    // City suggestions
    const cities = ['Denver', 'Boulder', 'Colorado Springs', 'Fort Collins', 'Aurora'];
    cities.forEach(city => {
        if (city.toLowerCase().includes(query)) {
            suggestions.push({
                type: 'city',
                text: city,
                subtitle: 'Search by city'
            });
        }
    });
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
}

function showSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) return;
    
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsContainer.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item" onclick="selectSuggestion('${suggestion.text}')">
            <div class="suggestion-text">${suggestion.text}</div>
            <div class="suggestion-subtitle">${suggestion.subtitle}</div>
        </div>
    `).join('');
    
    suggestionsContainer.style.display = 'block';
}

function hideSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

function selectSuggestion(text) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = text;
        hideSuggestions();
        performSearch();
    }
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    console.log(`🔍 Performing search for: "${query}"`);
    
    if (!query) {
        loadBusinesses();
        return;
    }
    
    // Filter businesses based on search query
    let filteredBusinesses = sampleBusinesses.filter(business => {
        return business.name.toLowerCase().includes(query) ||
               business.address.toLowerCase().includes(query) ||
               business.category.toLowerCase().includes(query);
    });
    
    // If no results, try broader search
    if (filteredBusinesses.length === 0) {
        filteredBusinesses = sampleBusinesses.filter(business => {
            const searchTerms = query.split(' ');
            return searchTerms.some(term => 
                business.name.toLowerCase().includes(term) ||
                business.address.toLowerCase().includes(term)
            );
        });
    }
    
    currentBusinesses = filteredBusinesses;
    renderBusinesses(currentBusinesses);
    updateSearchResultsInfo(query, currentBusinesses.length);
    
    // Update map markers
    addBusinessMarkersToMap();
    
    hideSuggestions();
}

// Enable location services
function enableLocation() {
    console.log('📍 Requesting user location...');
    
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.textContent = '📍 Getting Location...';
        locationBtn.disabled = true;
    }
    
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser.', 'error');
        resetLocationButton();
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            console.log('✅ User location obtained:', userLocation);
            
            // Update distances and sort by proximity
            updateDistances();
            applyFilters();
            
            // Center map on user location
            if (map) {
                map.setView([userLocation.lat, userLocation.lng], 14);
                
                // Add user location marker
                L.marker([userLocation.lat, userLocation.lng])
                    .addTo(map)
                    .bindPopup('📍 Your Location')
                    .openPopup();
            }
            
            if (locationBtn) {
                locationBtn.textContent = '📍 Location Enabled';
                locationBtn.classList.add('location-enabled');
            }
            
            showNotification('Location enabled! Results sorted by distance.', 'success');
        },
        (error) => {
            console.error('❌ Error getting location:', error);
            showNotification('Unable to get your location. Please check permissions.', 'error');
            resetLocationButton();
        }
    );
}

function resetLocationButton() {
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.textContent = '📍 Enable Location';
        locationBtn.disabled = false;
        locationBtn.classList.remove('location-enabled');
    }
}

// Update distances based on user location
function updateDistances() {
    if (!userLocation) return;
    
    currentBusinesses.forEach(business => {
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            business.coordinates.lat, business.coordinates.lng
        );
        business.calculatedDistance = distance;
        business.distance = `${distance.toFixed(1)} miles`;
    });
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
    return R * c;
}

// Apply filters and sorting
function applyFilters() {
    console.log('🔧 Applying filters...');
    
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');
    
    const category = categoryFilter ? categoryFilter.value : '';
    const sort = sortBy ? sortBy.value : 'relevance';
    
    console.log(`📊 Filtering by category: ${category || 'all'}, sorting by: ${sort}`);
    
    // Filter by category
    let filteredBusinesses = category ? 
        sampleBusinesses.filter(business => business.category === category) :
        [...sampleBusinesses];
    
    // Sort businesses
    switch (sort) {
        case 'distance':
            if (userLocation) {
                updateDistances();
                filteredBusinesses.sort((a, b) => (a.calculatedDistance || 999) - (b.calculatedDistance || 999));
            }
            break;
        case 'rating':
            filteredBusinesses.sort((a, b) => b.ratings.overall - a.ratings.overall);
            break;
        case 'reviews':
            filteredBusinesses.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
        case 'name':
            filteredBusinesses.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // relevance
            // Keep original order
            break;
    }
    
    currentBusinesses = filteredBusinesses;
    renderBusinesses(currentBusinesses);
    updateSearchResultsInfo('', currentBusinesses.length);
    
    // Update map markers
    addBusinessMarkersToMap();
    
    console.log(`✅ Filtered to ${currentBusinesses.length} businesses`);
}

// Load and render businesses
function loadBusinesses() {
    console.log('📊 Loading businesses...');
    currentBusinesses = [...sampleBusinesses];
    renderBusinesses(currentBusinesses);
    updateSearchResultsInfo('', currentBusinesses.length);
    
    // Add markers to map
    addBusinessMarkersToMap();
}

// Render businesses
function renderBusinesses(businesses) {
    console.log(`🏢 Rendering ${businesses.length} businesses...`);
    
    const businessGrid = document.getElementById('businessGrid');
    if (!businessGrid) {
        console.error('❌ Business grid element not found');
        return;
    }
    
    if (businesses.length === 0) {
        businessGrid.innerHTML = `
            <div class="no-results">
                <h3>No restrooms found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    businessGrid.innerHTML = businesses.map(business => createBusinessCard(business)).join('');
    
    console.log('✅ Business cards rendered successfully');
}

// Create business card HTML
function createBusinessCard(business) {
    const bathroomSymbols = business.bathroomTypes.map(type => {
        switch(type) {
            case 'mens': return '🚹';
            case 'womens': return '🚺';
            case 'unisex': return '🚻';
            case 'family': return '👨‍👩‍👧‍👦';
            case 'accessible': return '♿';
            default: return '';
        }
    }).join(' ');
    
    const amenityIcons = business.amenities.slice(0, 4).map(amenity => {
        switch(amenity) {
            case 'soap': return '🧼';
            case 'paper_towels': return '📄';
            case 'hand_dryer': return '💨';
            case 'toilet_paper': return '🧻';
            case 'baby_changing': return '👶';
            case 'wheelchair_accessible': return '♿';
            case 'family_restroom': return '👨‍👩‍👧‍👦';
            case 'air_freshener': return '🌸';
            default: return '✓';
        }
    }).join(' ');
    
    return `
        <div class="business-card" data-business-id="${business.id}">
            <div class="business-header">
                <div class="business-info">
                    <h3 class="business-name">${business.name}</h3>
                    <p class="business-address">${business.address}</p>
                    <p class="business-distance">${business.distance}</p>
                </div>
                <div class="business-rating">
                    <div class="rating-stars">
                        <span class="rating-number">${business.ratings.overall.toFixed(1)}</span>
                        <span class="rating-scale">/10</span>
                    </div>
                    <div class="review-count">${business.reviewCount} reviews</div>
                </div>
            </div>
            
            <div class="business-details">
                <div class="bathroom-types">
                    <span class="detail-label">Bathrooms:</span>
                    <span class="bathroom-symbols">${bathroomSymbols}</span>
                </div>
                
                <div class="amenities">
                    <span class="detail-label">Amenities:</span>
                    <span class="amenity-icons">${amenityIcons}</span>
                    ${business.amenities.length > 4 ? `<span class="more-amenities">+${business.amenities.length - 4} more</span>` : ''}
                </div>
                
                <div class="business-hours">
                    <span class="detail-label">Hours:</span>
                    <span class="hours-text">${business.hours}</span>
                </div>
            </div>
            
            <div class="business-actions">
                <button class="btn btn-primary" onclick="openReviewModal(${business.id})">
                    Rate This Restroom
                </button>
                <button class="btn btn-secondary" onclick="getDirections(${business.id})">
                    Get Directions
                </button>
            </div>
            
            ${business.verified ? '<div class="verified-badge">✓ Verified</div>' : ''}
        </div>
    `;
}

// Update search results info
function updateSearchResultsInfo(query, count) {
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    if (!searchResultsInfo) return;
    
    let message = '';
    if (query) {
        message = `Found ${count} restroom${count !== 1 ? 's' : ''} for "${query}"`;
    } else {
        message = `Showing ${count} restroom${count !== 1 ? 's' : ''}`;
    }
    
    if (userLocation) {
        message += ' (sorted by distance)';
    }
    
    searchResultsInfo.textContent = message;
}

// Get directions to business
function getDirections(businessId) {
    const business = sampleBusinesses.find(b => b.id === businessId);
    if (!business) return;
    
    const address = encodeURIComponent(business.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(url, '_blank');
    
    console.log(`🗺️ Opening directions to: ${business.name}`);
}

// Enhanced review system initialization
function initializeEnhancedReviewSystem() {
    console.log('🔧 Initializing enhanced review system...');
    
    // Initialize photo upload functionality
    initializePhotoUpload();
    
    // Initialize bathroom symbol selection
    initializeBathroomSymbols();
    
    // Initialize enhanced star ratings
    initializeEnhancedRatings();
    
    console.log('✅ Enhanced review system initialized');
}

// Initialize photo upload functionality
function initializePhotoUpload() {
    const photoUpload = document.getElementById('photoUpload');
    const uploadDropzone = document.querySelector('.upload-dropzone');
    
    if (!photoUpload || !uploadDropzone) return;
    
    // File input change handler
    photoUpload.addEventListener('change', handleFileSelection);
    
    // Drag and drop handlers
    uploadDropzone.addEventListener('dragover', handleDragOver);
    uploadDropzone.addEventListener('dragleave', handleDragLeave);
    uploadDropzone.addEventListener('drop', handleFileDrop);
    
    console.log('📷 Photo upload initialized');
}

// Handle file selection
function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    processSelectedFiles(files);
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('dragover');
}

// Handle file drop
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    processSelectedFiles(files);
}

// Process selected files
function processSelectedFiles(files) {
    console.log(`📁 Processing ${files.length} selected files...`);
    
    // Filter valid image files
    const validFiles = files.filter(file => {
        if (!PHOTO_CONFIG.allowedTypes.includes(file.type)) {
            showNotification(`File "${file.name}" is not a supported image format.`, 'warning');
            return false;
        }
        
        if (file.size > PHOTO_CONFIG.maxFileSize) {
            showNotification(`File "${file.name}" is too large. Maximum size is 5MB.`, 'warning');
            return false;
        }
        
        return true;
    });
    
    // Check total file limit
    if (selectedPhotos.length + validFiles.length > PHOTO_CONFIG.maxFiles) {
        const remaining = PHOTO_CONFIG.maxFiles - selectedPhotos.length;
        showNotification(`You can only upload ${PHOTO_CONFIG.maxFiles} photos total. ${remaining} slots remaining.`, 'warning');
        validFiles.splice(remaining);
    }
    
    // Add valid files to selection
    validFiles.forEach(file => {
        addPhotoToSelection(file);
    });
    
    // Update preview
    updatePhotoPreview();
    
    console.log(`✅ Added ${validFiles.length} photos to selection`);
}

// Add photo to selection
function addPhotoToSelection(file) {
    const photoData = {
        file: file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
    };
    
    selectedPhotos.push(photoData);
}

// Update photo preview
function updatePhotoPreview() {
    const previewContainer = document.getElementById('photoPreview');
    const previewList = document.getElementById('photoPreviewList');
    
    if (!previewContainer || !previewList) return;
    
    if (selectedPhotos.length === 0) {
        previewContainer.style.display = 'none';
        return;
    }
    
    previewContainer.style.display = 'block';
    previewList.innerHTML = '';
    
    selectedPhotos.forEach(photo => {
        const previewItem = createPhotoPreviewItem(photo);
        previewList.appendChild(previewItem);
    });
}

// Create photo preview item
function createPhotoPreviewItem(photo) {
    const item = document.createElement('div');
    item.className = 'photo-preview-item';
    item.innerHTML = `
        <img src="${photo.url}" alt="${photo.name}" class="photo-preview-img">
        <div class="photo-preview-info">
            <div class="photo-filename">${photo.name}</div>
            <div class="photo-size">${formatFileSize(photo.size)}</div>
        </div>
        <button type="button" class="photo-remove" onclick="removePhoto('${photo.id}')">×</button>
    `;
    
    return item;
}

// Remove photo from selection
function removePhoto(photoId) {
    const index = selectedPhotos.findIndex(photo => photo.id == photoId);
    if (index !== -1) {
        // Revoke object URL to free memory
        URL.revokeObjectURL(selectedPhotos[index].url);
        selectedPhotos.splice(index, 1);
        updatePhotoPreview();
        
        console.log(`🗑️ Removed photo from selection`);
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize bathroom symbol selection
function initializeBathroomSymbols() {
    const bathroomBtns = document.querySelectorAll('.bathroom-symbol-btn');
    const wheelchairBtn = document.querySelector('.wheelchair-btn');
    
    // Bathroom type selection
    bathroomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected class from all buttons
            bathroomBtns.forEach(b => b.classList.remove('selected'));
            
            // Add selected class to clicked button
            btn.classList.add('selected');
            
            // Store selected type
            selectedBathroomType = btn.dataset.type;
            
            console.log(`🚻 Selected bathroom type: ${selectedBathroomType}`);
        });
    });
    
    // Wheelchair accessibility selection
    if (wheelchairBtn) {
        wheelchairBtn.addEventListener('click', () => {
            isWheelchairAccessible = !isWheelchairAccessible;
            wheelchairBtn.classList.toggle('selected', isWheelchairAccessible);
            wheelchairBtn.dataset.accessible = isWheelchairAccessible;
            
            console.log(`♿ Wheelchair accessible: ${isWheelchairAccessible}`);
        });
    }
    
    console.log('🚻 Bathroom symbol selection initialized');
}

// Initialize enhanced star ratings
function initializeEnhancedRatings() {
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const ratingType = rating.dataset.rating;
        const stars = rating.querySelectorAll('.star');
        const display = document.getElementById(`${ratingType}RatingDisplay`);
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const value = parseInt(star.dataset.value);
                setRating(ratingType, value, stars, display);
            });
            
            star.addEventListener('mouseenter', () => {
                highlightStars(stars, parseInt(star.dataset.value));
            });
        });
        
        rating.addEventListener('mouseleave', () => {
            highlightStars(stars, currentRatings[ratingType] || 0);
        });
    });
    
    console.log('⭐ Enhanced star ratings initialized');
}

// Set rating value
function setRating(type, value, stars, display) {
    currentRatings[type] = value;
    highlightStars(stars, value);
    
    if (display) {
        display.textContent = `${value}/10`;
    }
    
    console.log(`⭐ Set ${type} rating to ${value}/10`);
}

// Highlight stars up to value
function highlightStars(stars, value) {
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Handle review submission
async function handleReviewSubmission(event) {
    event.preventDefault();
    
    console.log('📝 Submitting review...');
    
    // Validate required fields
    if (!validateReviewForm()) {
        return;
    }
    
    // Prepare review data
    const reviewData = prepareReviewData();
    
    // Show loading state
    showLoadingState(true);
    
    try {
        // Simulate photo upload and review submission
        await submitReviewWithPhotos(reviewData);
        
        // Show success message
        showNotification('Review submitted successfully! Thank you for helping others find great restrooms.', 'success');
        
        // Update business data
        updateBusinessWithReview(reviewData);
        
        // Close modal and reset form
        closeModal('reviewModal');
        resetReviewForm();
        
        // Update user badge if logged in
        if (currentUser) {
            updateUserBadge();
        }
        
    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('Error submitting review. Please try again.', 'error');
    } finally {
        showLoadingState(false);
    }
}

// Validate review form
function validateReviewForm() {
    // Check if at least overall rating is provided
    if (currentRatings.overall === 0) {
        showNotification('Please provide at least an overall rating.', 'warning');
        return false;
    }
    
    // Check if bathroom type is selected
    if (!selectedBathroomType) {
        showNotification('Please select which bathroom you used.', 'warning');
        return false;
    }
    
    return true;
}

// Prepare review data
function prepareReviewData() {
    const form = document.getElementById('reviewForm');
    const formData = new FormData(form);
    
    const reviewData = {
        businessId: currentBusinessForReview,
        userId: currentUser ? currentUser.id : null,
        ratings: { ...currentRatings },
        bathroomType: selectedBathroomType,
        wheelchairAccessible: isWheelchairAccessible,
        amenities: [],
        comment: formData.get('comment') || '',
        photos: selectedPhotos,
        timestamp: new Date().toISOString(),
        anonymous: !currentUser
    };
    
    // Get selected amenities
    const amenityCheckboxes = form.querySelectorAll('input[name="amenities"]:checked');
    reviewData.amenities = Array.from(amenityCheckboxes).map(cb => cb.value);
    
    return reviewData;
}

// Submit review with photos
async function submitReviewWithPhotos(reviewData) {
    console.log('📤 Submitting review with photos...');
    
    // Simulate photo upload process
    if (reviewData.photos.length > 0) {
        for (let i = 0; i < reviewData.photos.length; i++) {
            const photo = reviewData.photos[i];
            console.log(`📷 Uploading photo ${i + 1}/${reviewData.photos.length}: ${photo.name}`);
            
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // In a real implementation, you would upload to a server here
            photo.uploadedUrl = `uploads/reviews/${reviewData.businessId}/${photo.id}.${photo.type.split('/')[1]}`;
        }
    }
    
    // Store review data (in a real app, this would go to a server)
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    reviews.push(reviewData);
    localStorage.setItem('gtgotg_reviews', JSON.stringify(reviews));
    
    console.log('✅ Review submitted successfully');
}

// Update business with new review
function updateBusinessWithReview(reviewData) {
    const business = sampleBusinesses.find(b => b.id === reviewData.businessId);
    if (!business) return;
    
    // Update review count
    business.reviewCount = (business.reviewCount || 0) + 1;
    
    // Update ratings (simple average for demo)
    const totalReviews = business.reviewCount;
    Object.keys(reviewData.ratings).forEach(key => {
        if (reviewData.ratings[key] > 0) {
            const currentRating = business.ratings[key] || 0;
            const newRating = reviewData.ratings[key];
            business.ratings[key] = ((currentRating * (totalReviews - 1)) + newRating) / totalReviews;
        }
    });
    
    // Update amenities based on review
    if (reviewData.amenities.length > 0) {
        business.amenities = [...new Set([...business.amenities, ...reviewData.amenities])];
    }
    
    // Update bathroom types
    if (reviewData.bathroomType && !business.bathroomTypes.includes(reviewData.bathroomType)) {
        business.bathroomTypes.push(reviewData.bathroomType);
    }
    
    if (reviewData.wheelchairAccessible && !business.bathroomTypes.includes('accessible')) {
        business.bathroomTypes.push('accessible');
    }
    
    // Re-render the business card
    renderBusinesses(currentBusinesses);
    
    console.log('🔄 Business data updated with new review');
}

// Reset review form
function resetReviewForm() {
    // Reset ratings
    currentRatings = {
        overall: 0,
        cleanliness: 0,
        safety: 0,
        accessibility: 0
    };
    
    // Reset rating displays
    Object.keys(currentRatings).forEach(type => {
        const display = document.getElementById(`${type}RatingDisplay`);
        if (display) display.textContent = '0/10';
        
        const stars = document.querySelectorAll(`[data-rating="${type}"] .star`);
        stars.forEach(star => star.classList.remove('active'));
    });
    
    // Reset bathroom selection
    selectedBathroomType = null;
    isWheelchairAccessible = false;
    
    document.querySelectorAll('.bathroom-symbol-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const wheelchairBtn = document.querySelector('.wheelchair-btn');
    if (wheelchairBtn) {
        wheelchairBtn.classList.remove('selected');
        wheelchairBtn.dataset.accessible = 'false';
    }
    
    // Reset photos
    selectedPhotos.forEach(photo => {
        URL.revokeObjectURL(photo.url);
    });
    selectedPhotos = [];
    updatePhotoPreview();
    
    // Reset form fields
    const form = document.getElementById('reviewForm');
    if (form) {
        form.reset();
    }
    
    console.log('🔄 Review form reset');
}

// Show loading state
function showLoadingState(loading) {
    const submitBtn = document.querySelector('#reviewForm button[type="submit"]');
    const form = document.getElementById('reviewForm');
    
    if (loading) {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }
        if (form) {
            form.classList.add('photo-uploading');
        }
    } else {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Review';
        }
        if (form) {
            form.classList.remove('photo-uploading');
        }
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
    
    // Reset form
    resetReviewForm();
    
    // Show modal
    showModal('reviewModal');
    
    console.log(`📝 Opened review modal for: ${business.name}`);
}

// Authentication functions
function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    console.log(`🔐 Attempting login for: ${username}`);
    
    // Check against sample users
    const user = sampleUsers.find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
        currentUser = { ...user };
        delete currentUser.password; // Remove password from memory
        
        updateUserStatus();
        closeModal('loginModal');
        showNotification(`Welcome back, ${user.firstName}!`, 'success');
        
        console.log(`✅ Login successful for: ${user.username}`);
    } else {
        showNotification('Invalid username or password.', 'error');
        console.log(`❌ Login failed for: ${username}`);
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        id: Date.now(),
        username: formData.get('username'),
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        password: formData.get('password'),
        city: formData.get('city'),
        badge: 'Reviewer',
        reviewCount: 0,
        joinDate: new Date().toISOString().split('T')[0],
        isAdmin: false
    };
    
    console.log(`📝 Creating account for: ${userData.username}`);
    
    // Check if username or email already exists
    const existingUser = sampleUsers.find(u => 
        u.username === userData.username || u.email === userData.email
    );
    
    if (existingUser) {
        showNotification('Username or email already exists.', 'error');
        return;
    }
    
    // Add to sample users (in a real app, this would go to a server)
    sampleUsers.push(userData);
    
    // Auto-login the new user
    currentUser = { ...userData };
    delete currentUser.password;
    
    updateUserStatus();
    closeModal('signupModal');
    showNotification(`Welcome to GTGOTG, ${userData.firstName}!`, 'success');
    
    console.log(`✅ Account created for: ${userData.username}`);
}

function logout() {
    console.log('🚪 Logging out user');
    
    currentUser = null;
    updateUserStatus();
    showNotification('You have been logged out.', 'info');
}

function updateUserStatus() {
    const userStatus = document.getElementById('userStatus');
    const userWelcome = document.getElementById('userWelcome');
    const userBadge = document.getElementById('userBadge');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBtn = document.getElementById('adminBtn');
    
    if (currentUser) {
        if (userStatus) userStatus.style.display = 'block';
        if (userWelcome) userWelcome.textContent = `Welcome, ${currentUser.firstName}!`;
        if (userBadge) {
            userBadge.textContent = currentUser.badge;
            userBadge.className = `user-badge badge-${currentUser.badge.toLowerCase()}`;
        }
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (adminBtn && currentUser.isAdmin) adminBtn.style.display = 'inline-block';
    } else {
        if (userStatus) userStatus.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminBtn) adminBtn.style.display = 'none';
    }
}

function checkUserSession() {
    // In a real app, you would check for a stored session token
    console.log('🔍 Checking for existing user session...');
    // For demo purposes, we'll skip auto-login
}

// Update user badge after review
function updateUserBadge() {
    if (!currentUser) return;
    
    // Get user's review count
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    const userReviews = reviews.filter(r => r.userId === currentUser.id);
    const reviewCount = userReviews.length;
    
    // Update badge based on review count
    let newBadge = 'Reviewer';
    if (reviewCount >= 25) newBadge = 'Expert';
    else if (reviewCount >= 20) newBadge = 'Platinum';
    else if (reviewCount >= 15) newBadge = 'Gold';
    else if (reviewCount >= 10) newBadge = 'Silver';
    else if (reviewCount >= 5) newBadge = 'Bronze';
    
    if (newBadge !== currentUser.badge) {
        currentUser.badge = newBadge;
        updateUserStatus();
        showNotification(`Congratulations! You've earned the ${newBadge} badge!`, 'success');
        
        // Update stored user data
        const userIndex = sampleUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            sampleUsers[userIndex].badge = newBadge;
        }
    }
}

// Admin panel functions
function switchAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(`${tabName}Tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected tab button
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Load tab-specific data
    loadAdminTabData(tabName);
}

function loadAdminTabData(tabName) {
    switch (tabName) {
        case 'users':
            loadUsersData();
            break;
        case 'businesses':
            loadBusinessesData();
            break;
        case 'reviews':
            loadReviewsData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
    }
}

function loadUsersData() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    usersList.innerHTML = sampleUsers.map(user => `
        <div class="admin-item">
            <div class="admin-item-info">
                <h6>${user.firstName} ${user.lastName} (@${user.username})</h6>
                <p>Email: ${user.email}</p>
                <p>Badge: ${user.badge} | Reviews: ${user.reviewCount} | Joined: ${user.joinDate}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-sm btn-secondary">Edit</button>
                ${user.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
            </div>
        </div>
    `).join('');
}

function loadBusinessesData() {
    const businessesList = document.getElementById('businessesList');
    if (!businessesList) return;
    
    businessesList.innerHTML = sampleBusinesses.map(business => `
        <div class="admin-item">
            <div class="admin-item-info">
                <h6>${business.name}</h6>
                <p>${business.address}</p>
                <p>Rating: ${business.ratings.overall.toFixed(1)}/10 | Reviews: ${business.reviewCount}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-sm btn-secondary">Edit</button>
                ${business.verified ? '<span class="verified-badge">Verified</span>' : ''}
            </div>
        </div>
    `).join('');
}

function loadReviewsData() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet.</p>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => {
        const business = sampleBusinesses.find(b => b.id === review.businessId);
        const user = sampleUsers.find(u => u.id === review.userId);
        
        return `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h6>${business ? business.name : 'Unknown Business'}</h6>
                    <p>By: ${user ? user.firstName + ' ' + user.lastName : 'Anonymous'}</p>
                    <p>Rating: ${review.ratings.overall}/10 | Date: ${new Date(review.timestamp).toLocaleDateString()}</p>
                    ${review.comment ? `<p>Comment: "${review.comment}"</p>` : ''}
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-sm btn-secondary">Moderate</button>
                </div>
            </div>
        `;
    }).join('');
}

function loadAnalyticsData() {
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    
    // Update analytics numbers
    const totalUsers = document.getElementById('totalUsers');
    const totalBusinesses = document.getElementById('totalBusinesses');
    const totalReviews = document.getElementById('totalReviews');
    const averageRating = document.getElementById('averageRating');
    
    if (totalUsers) totalUsers.textContent = sampleUsers.length;
    if (totalBusinesses) totalBusinesses.textContent = sampleBusinesses.length;
    if (totalReviews) totalReviews.textContent = reviews.length;
    
    if (averageRating && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, review) => sum + review.ratings.overall, 0) / reviews.length;
        averageRating.textContent = avgRating.toFixed(1);
    } else if (averageRating) {
        averageRating.textContent = '0.0';
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Load admin data if opening admin modal
        if (modalId === 'adminModal') {
            loadAdminTabData('users');
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;
    
    notificationText.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
    
    console.log(`📢 Notification (${type}): ${message}`);
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Starting GTGOTG...');
    setTimeout(initializeApp, 100);
});

// Export functions for global use
window.openReviewModal = openReviewModal;
window.getDirections = getDirections;
window.removePhoto = removePhoto;
window.selectSuggestion = selectSuggestion;

console.log('✅ GTGOTG - Got To Go On The Go - Loaded successfully!');
