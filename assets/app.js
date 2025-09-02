// GTGOTG - "Got To Go On The Go" Main Application JavaScript
// Copyright © 2025 Jessica Esposito / Colorado Quality LLC. All rights reserved.

console.log('🚽 GTGOTG - Got To Go On The Go - Loading...');

// Global variables
var map;
var currentUser = null;
var currentBusinesses = [];
var allBusinesses = [];
var userLocation = null;
var currentBusinessForReview = null;
var activeFilters = {
    category: '',
    distance: '',
    rating: '',
    quickFilters: []
};

// Mapbox configuration - Using a demo token (replace with your own)
mapboxgl.accessToken = 'pk.eyJ1IjoiY29sb3JhZG9xdWFsaXR5bGxjIiwiYSI6ImNtZW4yOG9scTB4ZzgybG9jNTgwZW8wbDAifQ.Vo3vwfNTszwGPkYp4H054Q';

// Check if Mapbox token is available, otherwise show fallback
if (typeof mapboxgl !== 'undefined') {
    // Mapbox token is already set above
    console.log('🗺️ Mapbox token configured');
}

// Sample business data with enhanced information
var sampleBusinesses = [
    {
        id: 'bus_001',
        name: 'Shell Gas Station',
        category: 'gas-station',
        address: '123 Main Street, Denver, CO 80202',
        phone: '(303) 555-0123',
        coordinates: [-104.9903, 39.7392],
        distance: 0.3,
        hours: {
            monday: '6:00 AM - 11:00 PM',
            tuesday: '6:00 AM - 11:00 PM',
            wednesday: '6:00 AM - 11:00 PM',
            thursday: '6:00 AM - 11:00 PM',
            friday: '6:00 AM - 11:00 PM',
            saturday: '6:00 AM - 11:00 PM',
            sunday: '7:00 AM - 10:00 PM'
        },
        ratings: {
            overall: 4.2,
            cleanliness: 4.0,
            safety: 4.5,
            accessibility: 3.8
        },
        reviewCount: 23,
        amenities: ['toilet-paper', 'soap', 'paper-towels', 'hand-dryer'],
        bathroomTypes: ['mens', 'womens'],
        isOpen: true,
        claimed: false,
        owner: null
    },
    {
        id: 'bus_002',
        name: 'Starbucks Coffee',
        category: 'coffee-shop',
        address: '456 Broadway, Denver, CO 80203',
        phone: '(303) 555-0456',
        coordinates: [-104.9847, 39.7348],
        distance: 0.7,
        hours: {
            monday: '5:30 AM - 9:00 PM',
            tuesday: '5:30 AM - 9:00 PM',
            wednesday: '5:30 AM - 9:00 PM',
            thursday: '5:30 AM - 9:00 PM',
            friday: '5:30 AM - 9:00 PM',
            saturday: '6:00 AM - 9:00 PM',
            sunday: '6:00 AM - 8:00 PM'
        },
        ratings: {
            overall: 4.6,
            cleanliness: 4.8,
            safety: 4.7,
            accessibility: 4.2
        },
        reviewCount: 45,
        amenities: ['toilet-paper', 'soap', 'paper-towels', 'hand-dryer', 'baby-changing'],
        bathroomTypes: ['neutral', 'accessible'],
        isOpen: true,
        claimed: true,
        owner: 'owner_001'
    },
    {
        id: 'bus_003',
        name: 'McDonald\'s',
        category: 'restaurant',
        address: '789 Colfax Avenue, Denver, CO 80204',
        phone: '(303) 555-0789',
        coordinates: [-105.0178, 39.7391],
        distance: 1.2,
        hours: {
            monday: '5:00 AM - 11:00 PM',
            tuesday: '5:00 AM - 11:00 PM',
            wednesday: '5:00 AM - 11:00 PM',
            thursday: '5:00 AM - 11:00 PM',
            friday: '5:00 AM - 12:00 AM',
            saturday: '5:00 AM - 12:00 AM',
            sunday: '6:00 AM - 11:00 PM'
        },
        ratings: {
            overall: 3.8,
            cleanliness: 3.5,
            safety: 4.0,
            accessibility: 4.5
        },
        reviewCount: 67,
        amenities: ['toilet-paper', 'soap', 'hand-dryer', 'baby-changing', 'ada-compliant'],
        bathroomTypes: ['mens', 'womens', 'accessible'],
        isOpen: true,
        claimed: false,
        owner: null
    },
    {
        id: 'bus_004',
        name: 'Denver Public Library - Central',
        category: 'library',
        address: '10 W 14th Ave Pkwy, Denver, CO 80204',
        phone: '(720) 865-1111',
        coordinates: [-104.9903, 39.7372],
        distance: 0.8,
        hours: {
            monday: '10:00 AM - 8:00 PM',
            tuesday: '10:00 AM - 8:00 PM',
            wednesday: '10:00 AM - 8:00 PM',
            thursday: '10:00 AM - 8:00 PM',
            friday: '10:00 AM - 5:00 PM',
            saturday: '9:00 AM - 5:00 PM',
            sunday: '1:00 PM - 5:00 PM'
        },
        ratings: {
            overall: 4.7,
            cleanliness: 4.9,
            safety: 4.8,
            accessibility: 4.9
        },
        reviewCount: 89,
        amenities: ['toilet-paper', 'soap', 'paper-towels', 'hand-dryer', 'baby-changing', 'ada-compliant'],
        bathroomTypes: ['mens', 'womens', 'neutral', 'accessible'],
        isOpen: true,
        claimed: true,
        owner: 'owner_002'
    },
    {
        id: 'bus_005',
        name: 'Target',
        category: 'retail',
        address: '1000 S Colorado Blvd, Denver, CO 80246',
        phone: '(303) 757-6100',
        coordinates: [-104.9403, 39.7092],
        distance: 2.1,
        hours: {
            monday: '8:00 AM - 10:00 PM',
            tuesday: '8:00 AM - 10:00 PM',
            wednesday: '8:00 AM - 10:00 PM',
            thursday: '8:00 AM - 10:00 PM',
            friday: '8:00 AM - 10:00 PM',
            saturday: '8:00 AM - 10:00 PM',
            sunday: '8:00 AM - 9:00 PM'
        },
        ratings: {
            overall: 4.3,
            cleanliness: 4.1,
            safety: 4.4,
            accessibility: 4.6
        },
        reviewCount: 156,
        amenities: ['toilet-paper', 'soap', 'paper-towels', 'hand-dryer', 'baby-changing', 'ada-compliant'],
        bathroomTypes: ['mens', 'womens', 'accessible'],
        isOpen: true,
        claimed: false,
        owner: null
    }
];

// Sample users data
var sampleUsers = [
    {
        id: 'user_001',
        email: 'user@gtgotg.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        badge: 'Silver',
        isAdmin: false,
        joinDate: '2024-01-15',
        reviewCount: 12
    },
    {
        id: 'admin_001',
        email: 'admin@gtgotg.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        badge: 'Expert',
        isAdmin: true,
        joinDate: '2023-12-01',
        reviewCount: 89
    },
    {
        id: 'owner_001',
        email: 'owner@starbucks.com',
        password: 'owner123',
        firstName: 'Business',
        lastName: 'Owner',
        badge: 'Business',
        isAdmin: false,
        isBusinessOwner: true,
        joinDate: '2024-02-01',
        reviewCount: 5,
        ownedBusinesses: ['bus_002']
    },
    {
        id: 'owner_002',
        email: 'owner@library.gov',
        password: 'library123',
        firstName: 'Library',
        lastName: 'Manager',
        badge: 'Business',
        isAdmin: false,
        isBusinessOwner: true,
        joinDate: '2024-01-20',
        reviewCount: 3,
        ownedBusinesses: ['bus_004']
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing GTGOTG application...');
    
    // Initialize map
    initializeMap();
    
    // Load initial data
    loadInitialData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for saved user session
    checkUserSession();
    
    console.log('✅ GTGOTG application initialized successfully');
});

// Initialize Mapbox map
function initializeMap() {
    try {
        // Check if we have a valid Mapbox token
        if (!mapboxgl.accessToken || mapboxgl.accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
            console.warn('⚠️ No valid Mapbox token provided. Map will show fallback message.');
            document.getElementById('map').innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #f8fafc; color: #64748b; font-size: 1.1rem; text-align: center; padding: 2rem;">
                    <div style="margin-bottom: 1rem; font-size: 2rem;">🗺️</div>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">Map Unavailable</div>
                    <div style="font-size: 0.9rem; max-width: 400px;">
                        To enable the interactive map, please add your Mapbox access token to the configuration.
                        <br><br>
                        Get a free token at: <a href="https://account.mapbox.com/access-tokens/" target="_blank" style="color: #8B5CF6;">mapbox.com</a>
                    </div>
                </div>
            `;
            return;
        }
        
        // Default to Denver, CO if no user location
        var defaultCenter = [-104.9903, 39.7392];
        
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: defaultCenter,
            zoom: 12
        });
        
        map.on('load', function() {
            console.log('🗺️ Map loaded successfully');
            addBusinessMarkersToMap();
        });
        
        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl());
        
        // Add geolocate control
        var geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });
        
        map.addControl(geolocate);
        
        // Try to get user location on load
        geolocate.on('geolocate', function(e) {
            userLocation = [e.coords.longitude, e.coords.latitude];
            console.log('📍 User location obtained:', userLocation);
            updateBusinessDistances();
        });
        
    } catch (error) {
        console.error('❌ Error initializing map:', error);
        // Show fallback message
        document.getElementById('map').innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8fafc; color: #64748b; font-size: 1.1rem;">Map temporarily unavailable. Please refresh the page.</div>';
    }
}

// Add business markers to map
function addBusinessMarkersToMap() {
    if (!map) return;
    
    sampleBusinesses.forEach(function(business) {
        // Create marker element
        var markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.innerHTML = getBathroomSymbol(business.bathroomTypes[0] || 'neutral');
        markerElement.style.cssText = `
            background: #8B5CF6;
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        
        // Create popup
        var popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <div style="padding: 10px;">
                    <h4 style="margin: 0 0 5px 0; color: #1e293b;">${business.name}</h4>
                    <p style="margin: 0 0 5px 0; color: #64748b; font-size: 0.9rem;">${business.address}</p>
                    <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">
                        <span style="color: #f59e0b;">★★★★☆</span>
                        <span style="color: #64748b; font-size: 0.9rem;">${business.ratings.overall}/5 (${business.reviewCount} reviews)</span>
                    </div>
                    <button onclick="openReviewModal('${business.id}')" style="background: #8B5CF6; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">Rate & Review</button>
                </div>
            `);
        
        // Add marker to map
        new mapboxgl.Marker(markerElement)
            .setLngLat(business.coordinates)
            .setPopup(popup)
            .addTo(map);
    });
}

// Load initial data
function loadInitialData() {
    // Load businesses
    currentBusinesses = [...sampleBusinesses];
    allBusinesses = [...sampleBusinesses];
    
    // Render businesses
    renderBusinesses(currentBusinesses);
    
    // Update search results info
    updateSearchResultsInfo(currentBusinesses.length);
    
    console.log('📊 Initial data loaded');
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    console.log('🎧 Event listeners set up');
}

// Handle search input
function handleSearchInput(event) {
    var query = event.target.value.toLowerCase();
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    // Generate suggestions
    var suggestions = generateSearchSuggestions(query);
    showSuggestions(suggestions);
}

// Generate search suggestions
function generateSearchSuggestions(query) {
    var suggestions = [];
    
    // Business name suggestions
    sampleBusinesses.forEach(function(business) {
        if (business.name.toLowerCase().includes(query)) {
            suggestions.push({
                type: 'business',
                main: business.name,
                subtitle: business.address,
                data: business
            });
        }
    });
    
    // Category suggestions
    var categories = [
        { name: 'Gas Stations', value: 'gas-station' },
        { name: 'Coffee Shops', value: 'coffee-shop' },
        { name: 'Restaurants', value: 'restaurant' },
        { name: 'Libraries', value: 'library' },
        { name: 'Retail Stores', value: 'retail' }
    ];
    
    categories.forEach(function(category) {
        if (category.name.toLowerCase().includes(query)) {
            suggestions.push({
                type: 'category',
                main: category.name,
                subtitle: 'Search by category',
                data: category
            });
        }
    });
    
    return suggestions.slice(0, 5);
}

// Show search suggestions
function showSuggestions(suggestions) {
    var suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) return;
    
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(function(suggestion) {
        var suggestionElement = document.createElement('div');
        suggestionElement.className = 'search-suggestion';
        suggestionElement.innerHTML = `
            <div class="suggestion-main">${suggestion.main}</div>
            <div class="suggestion-subtitle">${suggestion.subtitle}</div>
        `;
        
        suggestionElement.addEventListener('click', function() {
            selectSuggestion(suggestion);
        });
        
        suggestionsContainer.appendChild(suggestionElement);
    });
    
    suggestionsContainer.style.display = 'block';
}

// Hide search suggestions
function hideSuggestions() {
    var suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

// Select search suggestion
function selectSuggestion(suggestion) {
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = suggestion.main;
    }
    
    hideSuggestions();
    
    if (suggestion.type === 'business') {
        // Focus on specific business
        currentBusinesses = [suggestion.data];
        renderBusinesses(currentBusinesses);
        
        // Center map on business
        if (map && suggestion.data.coordinates) {
            map.flyTo({
                center: suggestion.data.coordinates,
                zoom: 15
            });
        }
    } else if (suggestion.type === 'category') {
        // Filter by category
        document.getElementById('categoryFilter').value = suggestion.data.value;
        applyFilters();
    }
}

// Perform search
function performSearch() {
    var query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
        currentBusinesses = [...allBusinesses];
        renderBusinesses(currentBusinesses);
        updateSearchResultsInfo(currentBusinesses.length);
        return;
    }
    
    // Filter businesses based on search query
    var filteredBusinesses = allBusinesses.filter(function(business) {
        return business.name.toLowerCase().includes(query) ||
               business.address.toLowerCase().includes(query) ||
               business.category.toLowerCase().includes(query);
    });
    
    currentBusinesses = filteredBusinesses;
    renderBusinesses(currentBusinesses);
    updateSearchResultsInfo(currentBusinesses.length, query);
    
    hideSuggestions();
    
    console.log(`🔍 Search performed for: "${query}", found ${filteredBusinesses.length} results`);
}

// Get current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser.', 'error');
        return;
    }
    
    showNotification('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation = [position.coords.longitude, position.coords.latitude];
            console.log('📍 User location obtained:', userLocation);
            
            // Update map center
            if (map) {
                map.flyTo({
                    center: userLocation,
                    zoom: 14
                });
            }
            
            // Update business distances
            updateBusinessDistances();
            
            // Re-render businesses with updated distances
            renderBusinesses(currentBusinesses);
            
            showNotification('Location updated successfully!', 'success');
        },
        function(error) {
            console.error('Error getting location:', error);
            showNotification('Unable to get your location. Please try again.', 'error');
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
    
    allBusinesses.forEach(function(business) {
        business.distance = calculateDistance(
            userLocation[1], userLocation[0],
            business.coordinates[1], business.coordinates[0]
        );
    });
    
    // Sort by distance
    allBusinesses.sort(function(a, b) {
        return a.distance - b.distance;
    });
    
    console.log('📏 Business distances updated');
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 3959; // Earth's radius in miles
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Apply filters
function applyFilters() {
    var categoryFilter = document.getElementById('categoryFilter').value;
    var distanceFilter = document.getElementById('distanceFilter').value;
    var ratingFilter = document.getElementById('ratingFilter').value;
    
    // Update active filters
    activeFilters.category = categoryFilter;
    activeFilters.distance = distanceFilter;
    activeFilters.rating = ratingFilter;
    
    // Start with all businesses
    var filteredBusinesses = [...allBusinesses];
    
    // Apply category filter
    if (categoryFilter) {
        filteredBusinesses = filteredBusinesses.filter(function(business) {
            return business.category === categoryFilter;
        });
    }
    
    // Apply distance filter
    if (distanceFilter && userLocation) {
        var maxDistance = parseFloat(distanceFilter);
        filteredBusinesses = filteredBusinesses.filter(function(business) {
            return business.distance <= maxDistance;
        });
    }
    
    // Apply rating filter
    if (ratingFilter) {
        var minRating = parseFloat(ratingFilter);
        filteredBusinesses = filteredBusinesses.filter(function(business) {
            return business.ratings.overall >= minRating;
        });
    }
    
    // Apply quick filters
    activeFilters.quickFilters.forEach(function(filter) {
        switch (filter) {
            case 'wheelchair':
                filteredBusinesses = filteredBusinesses.filter(function(business) {
                    return business.bathroomTypes.includes('accessible') || 
                           business.amenities.includes('ada-compliant');
                });
                break;
            case 'baby-changing':
                filteredBusinesses = filteredBusinesses.filter(function(business) {
                    return business.amenities.includes('baby-changing');
                });
                break;
            case 'open-now':
                filteredBusinesses = filteredBusinesses.filter(function(business) {
                    return business.isOpen;
                });
                break;
            case 'high-rated':
                filteredBusinesses = filteredBusinesses.filter(function(business) {
                    return business.ratings.overall >= 4.0;
                });
                break;
        }
    });
    
    currentBusinesses = filteredBusinesses;
    renderBusinesses(currentBusinesses);
    updateSearchResultsInfo(currentBusinesses.length);
    
    console.log('🔧 Filters applied, showing', currentBusinesses.length, 'businesses');
}

// Toggle quick filter
function toggleQuickFilter(button) {
    var filter = button.dataset.filter;
    var isActive = button.classList.contains('active');
    
    if (isActive) {
        button.classList.remove('active');
        activeFilters.quickFilters = activeFilters.quickFilters.filter(function(f) {
            return f !== filter;
        });
    } else {
        button.classList.add('active');
        activeFilters.quickFilters.push(filter);
    }
    
    applyFilters();
}

// Update search results info
function updateSearchResultsInfo(count, query) {
    var infoElement = document.getElementById('searchResultsInfo');
    if (!infoElement) return;
    
    var message = '';
    if (query) {
        message = `Found ${count} result${count !== 1 ? 's' : ''} for "${query}"`;
    } else if (count === allBusinesses.length) {
        message = `Showing all ${count} restroom locations`;
    } else {
        message = `Showing ${count} of ${allBusinesses.length} restroom locations`;
    }
    
    infoElement.textContent = message;
}

// Render businesses
function renderBusinesses(businesses) {
    var grid = document.getElementById('businessGrid');
    if (!grid) return;
    
    if (businesses.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>No restrooms found</h3>
                <p>Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    businesses.forEach(function(business) {
        var card = createBusinessCard(business);
        grid.appendChild(card);
    });
}

// Create business card
function createBusinessCard(business) {
    var card = document.createElement('div');
    card.className = 'business-card';
    
    var bathroomSymbols = business.bathroomTypes.map(function(type) {
        return `<span class="bathroom-symbol" title="${type}">${getBathroomSymbol(type)}</span>`;
    }).join('');
    
    var amenityTags = business.amenities.slice(0, 4).map(function(amenity) {
        return `<span class="amenity-tag">${formatAmenityName(amenity)}</span>`;
    }).join('');
    
    if (business.amenities.length > 4) {
        amenityTags += `<span class="amenity-tag">+${business.amenities.length - 4} more</span>`;
    }
    
    var distanceText = business.distance ? `📍 ${business.distance.toFixed(1)} miles away` : '';
    var statusText = business.isOpen ? '🟢 Open Now' : '🔴 Closed';
    var claimedBadge = business.claimed ? '<span style="background: #10B981; color: white; padding: 0.25rem 0.5rem; border-radius: 10px; font-size: 0.7rem; font-weight: bold;">✓ Verified</span>' : '';
    
    card.innerHTML = `
        <div class="business-header">
            <div>
                <h4 class="business-name">${business.name} ${claimedBadge}</h4>
                <p class="business-category">${formatCategoryName(business.category)}</p>
            </div>
            <div class="bathroom-types">
                ${bathroomSymbols}
            </div>
        </div>
        
        <div class="business-info">
            <p class="business-address">📍 ${business.address}</p>
            ${distanceText ? `<p class="business-distance">${distanceText}</p>` : ''}
            <p class="business-hours">${statusText}</p>
            <p class="business-phone">📞 ${business.phone}</p>
        </div>
        
        <div class="business-ratings">
            <div class="rating-item">
                <span class="rating-label">Overall:</span>
                <div class="rating-value">
                    <span class="stars">${generateStars(business.ratings.overall)}</span>
                    <span class="rating-number">${business.ratings.overall}/5</span>
                </div>
            </div>
            <div class="rating-item">
                <span class="rating-label">Cleanliness:</span>
                <div class="rating-value">
                    <span class="stars">${generateStars(business.ratings.cleanliness)}</span>
                    <span class="rating-number">${business.ratings.cleanliness}/5</span>
                </div>
            </div>
            <div class="rating-item">
                <span class="rating-label">Safety:</span>
                <div class="rating-value">
                    <span class="stars">${generateStars(business.ratings.safety)}</span>
                    <span class="rating-number">${business.ratings.safety}/5</span>
                </div>
            </div>
            <div class="rating-item">
                <span class="rating-label">Accessibility:</span>
                <div class="rating-value">
                    <span class="stars">${generateStars(business.ratings.accessibility)}</span>
                    <span class="rating-number">${business.ratings.accessibility}/5</span>
                </div>
            </div>
            <div class="review-count">${business.reviewCount} review${business.reviewCount !== 1 ? 's' : ''}</div>
        </div>
        
        <div class="business-amenities">
            <div class="amenities-list">
                ${amenityTags}
            </div>
        </div>
        
        <div class="business-actions">
            <button class="btn btn-primary" onclick="openReviewModal('${business.id}')">
                ⭐ Rate & Review
            </button>
            <button class="btn btn-secondary" onclick="getDirections('${business.id}')">
                🧭 Directions
            </button>
            ${!business.claimed ? `<button class="btn btn-admin btn-small" onclick="claimBusiness('${business.id}')">📋 Claim Business</button>` : ''}
        </div>
    `;
    
    return card;
}

// Get bathroom symbol
function getBathroomSymbol(type) {
    switch (type) {
        case 'mens': return '🚹';
        case 'womens': return '🚺';
        case 'neutral': return '🚻';
        case 'accessible': return '♿';
        default: return '🚻';
    }
}

// Format category name
function formatCategoryName(category) {
    var categoryNames = {
        'gas-station': 'Gas Station',
        'restaurant': 'Restaurant',
        'coffee-shop': 'Coffee Shop',
        'rest-area': 'Rest Area',
        'retail': 'Retail Store',
        'hotel': 'Hotel',
        'park': 'Park',
        'hospital': 'Hospital',
        'library': 'Library'
    };
    return categoryNames[category] || category;
}

// Format amenity name
function formatAmenityName(amenity) {
    var amenityNames = {
        'toilet-paper': 'Toilet Paper',
        'soap': 'Soap',
        'paper-towels': 'Paper Towels',
        'hand-dryer': 'Hand Dryer',
        'baby-changing': 'Baby Changing',
        'ada-compliant': 'ADA Compliant'
    };
    return amenityNames[amenity] || amenity;
}

// Generate stars display
function generateStars(rating) {
    var fullStars = Math.floor(rating);
    var hasHalfStar = rating % 1 >= 0.5;
    var emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    var stars = '';
    for (var i = 0; i < fullStars; i++) {
        stars += '★';
    }
    if (hasHalfStar) {
        stars += '☆';
    }
    for (var i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

// Get directions to business
function getDirections(businessId) {
    var business = sampleBusinesses.find(function(b) { return b.id === businessId; });
    if (!business) return;
    
    var destination = encodeURIComponent(business.address);
    var mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    
    window.open(mapsUrl, '_blank');
    
    console.log('🧭 Opening directions to:', business.name);
}

// Claim business
function claimBusiness(businessId) {
    if (!currentUser) {
        showNotification('Please log in to claim a business.', 'warning');
        showModal('loginModal');
        return;
    }
    
    showModal('claimBusinessModal');
    document.getElementById('claimBusinessId').value = businessId;
}

// Handle business claim
function handleBusinessClaim(event) {
    event.preventDefault();
    
    var businessId = document.getElementById('claimBusinessId').value;
    var business = sampleBusinesses.find(function(b) { return b.id === businessId; });
    
    if (!business) return;
    
    // Mark business as claimed
    business.claimed = true;
    business.owner = currentUser.id;
    
    // Update user to business owner
    currentUser.isBusinessOwner = true;
    if (!currentUser.ownedBusinesses) {
        currentUser.ownedBusinesses = [];
    }
    currentUser.ownedBusinesses.push(businessId);
    
    // Re-render businesses
    renderBusinesses(currentBusinesses);
    
    closeModal('claimBusinessModal');
    showNotification(`Successfully claimed ${business.name}!`, 'success');
    
    console.log('📋 Business claimed:', business.name);
}

// Center map on user location
function centerMapOnUser() {
    if (!map) return;
    
    if (userLocation) {
        map.flyTo({
            center: userLocation,
            zoom: 14
        });
    } else {
        getCurrentLocation();
    }
}

// Toggle map view
function toggleMapView() {
    if (!map) return;
    
    var currentStyle = map.getStyle().name;
    var newStyle = currentStyle === 'Mapbox Streets' ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/streets-v11';
    
    map.setStyle(newStyle);
}

// Authentication functions
function handleLogin(event) {
    event.preventDefault();
    
    var formData = new FormData(event.target);
    var email = formData.get('email');
    var password = formData.get('password');
    
    // Find user in sample data
    var user = sampleUsers.find(function(u) {
        return u.email === email && u.password === password;
    });
    
    if (user) {
        currentUser = user;
        updateUserStatus();
        closeModal('loginModal');
        showNotification(`Welcome back, ${user.firstName}!`, 'success');
        
        // Clear form
        event.target.reset();
        
        console.log('✅ User logged in:', user.email);
    } else {
        showNotification('Invalid email or password.', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    var formData = new FormData(event.target);
    var firstName = formData.get('firstName');
    var lastName = formData.get('lastName');
    var email = formData.get('email');
    var password = formData.get('password');
    var confirmPassword = formData.get('confirmPassword');
    
    // Validation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'error');
        return;
    }
    
    // Check if user already exists
    var existingUser = sampleUsers.find(function(u) { return u.email === email; });
    if (existingUser) {
        showNotification('An account with this email already exists.', 'error');
        return;
    }
    
    // Create new user
    var newUser = {
        id: 'user_' + Date.now(),
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        badge: 'Reviewer',
        isAdmin: false,
        joinDate: new Date().toISOString().split('T')[0],
        reviewCount: 0
    };
    
    sampleUsers.push(newUser);
    currentUser = newUser;
    
    updateUserStatus();
    closeModal('registerModal');
    showNotification(`Welcome to GTGOTG, ${firstName}!`, 'success');
    
    // Clear form
    event.target.reset();
    
    console.log('✅ New user registered:', email);
}

// Social login functions
function loginWithGoogle() {
    showNotification('Google login would be integrated here in production.', 'info');
}

function loginWithFacebook() {
    showNotification('Facebook login would be integrated here in production.', 'info');
}

function registerWithGoogle() {
    showNotification('Google registration would be integrated here in production.', 'info');
}

function registerWithFacebook() {
    showNotification('Facebook registration would be integrated here in production.', 'info');
}

function logout() {
    currentUser = null;
    updateUserStatus();
    showNotification('You have been logged out.', 'info');
    
    console.log('👋 User logged out');
}

function updateUserStatus() {
    var userStatus = document.getElementById('userStatus');
    var userName = document.getElementById('userName');
    var userBadge = document.getElementById('userBadge');
    var adminBtn = document.getElementById('adminBtn');
    var loginBtn = document.querySelector('button[onclick="showModal(\'loginModal\')"]');
    var registerBtn = document.querySelector('button[onclick="showModal(\'registerModal\')"]');
    
    if (currentUser) {
        userStatus.style.display = 'block';
        userName.textContent = currentUser.firstName;
        userBadge.textContent = currentUser.badge;
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        
        if (currentUser.isAdmin && adminBtn) {
            adminBtn.style.display = 'inline-flex';
        }
    } else {
        userStatus.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (registerBtn) registerBtn.style.display = 'inline-flex';
        if (adminBtn) adminBtn.style.display = 'none';
    }
}

function checkUserSession() {
    // In a real app, this would check for saved session data
    console.log('🔍 Checking for saved user session...');
}

// Admin functions
function showAdminTab(tabName) {
    // Hide all tabs
    var tabs = document.querySelectorAll('.admin-tab-content');
    tabs.forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    var buttons = document.querySelectorAll('.admin-tab-btn');
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    var selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    var selectedButton = document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Load tab content
    loadAdminTabContent(tabName);
}

function loadAdminTabContent(tabName) {
    switch (tabName) {
        case 'analytics':
            loadAnalytics();
            break;
        case 'businesses':
            loadBusinessManagement();
            break;
        case 'reviews':
            loadReviewManagement();
            break;
        case 'users':
            loadUserManagement();
            break;
    }
}

function loadAnalytics() {
    var reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    var totalReviews = reviews.length;
    var totalBusinesses = sampleBusinesses.length;
    var totalUsers = sampleUsers.length;
    var averageRating = totalReviews > 0 ? 
        reviews.reduce(function(sum, r) { return sum + (r.ratings.overall || 0); }, 0) / totalReviews : 0;
    
    document.getElementById('totalBusinesses').textContent = totalBusinesses;
    document.getElementById('totalReviews').textContent = totalReviews;
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('averageRating').textContent = averageRating.toFixed(1);
}

function loadBusinessManagement() {
    var container = document.getElementById('adminBusinessList');
    container.innerHTML = '';
    
    sampleBusinesses.forEach(function(business) {
        var item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div class="admin-item-info">
                <h6>${business.name}</h6>
                <p>${business.address}</p>
                <p>Category: ${formatCategoryName(business.category)} | Reviews: ${business.reviewCount} | ${business.claimed ? 'Claimed' : 'Unclaimed'}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-small btn-secondary" onclick="editBusiness('${business.id}')">Edit</button>
                <button class="btn btn-small btn-admin" onclick="deleteBusiness('${business.id}')">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function loadReviewManagement() {
    var container = document.getElementById('adminReviewList');
    var reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    
    container.innerHTML = '';
    
    if (reviews.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No reviews yet.</p>';
        return;
    }
    
    reviews.forEach(function(review) {
        var business = sampleBusinesses.find(function(b) { return b.id === review.businessId; });
        var businessName = business ? business.name : 'Unknown Business';
        
        var item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div class="admin-item-info">
                <h6>Review for ${businessName}</h6>
                <p>Rating: ${review.ratings.overall}/10 | ${review.anonymous ? 'Anonymous' : 'User ID: ' + review.userId}</p>
                <p>${review.comment || 'No comment provided'}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-small btn-admin" onclick="deleteReview('${review.timestamp}')">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function loadUserManagement() {
    var container = document.getElementById('adminUserList');
    container.innerHTML = '';
    
    sampleUsers.forEach(function(user) {
        var item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div class="admin-item-info">
                <h6>${user.firstName} ${user.lastName}</h6>
                <p>${user.email}</p>
                <p>Badge: ${user.badge} | Reviews: ${user.reviewCount} | ${user.isAdmin ? 'Admin' : 'User'}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-small btn-secondary" onclick="editUser('${user.id}')">Edit</button>
                ${!user.isAdmin ? `<button class="btn btn-small btn-admin" onclick="deleteUser('${user.id}')">Delete</button>` : ''}
            </div>
        `;
        container.appendChild(item);
    });
}

// Modal functions
function showModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Load admin content if it's the admin modal
        if (modalId === 'adminModal') {
            showAdminTab('analytics');
        }
    }
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
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

// Notification system
function showNotification(message, type) {
    type = type || 'info';
    
    var notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(function() {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    console.log(`📢 Notification (${type}): ${message}`);
}

// Export functions for global use
window.performSearch = performSearch;
window.getCurrentLocation = getCurrentLocation;
window.applyFilters = applyFilters;
window.toggleQuickFilter = toggleQuickFilter;
window.getDirections = getDirections;
window.claimBusiness = claimBusiness;
window.handleBusinessClaim = handleBusinessClaim;
window.centerMapOnUser = centerMapOnUser;
window.toggleMapView = toggleMapView;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.loginWithGoogle = loginWithGoogle;
window.loginWithFacebook = loginWithFacebook;
window.registerWithGoogle = registerWithGoogle;
window.registerWithFacebook = registerWithFacebook;
window.logout = logout;
window.showModal = showModal;
window.closeModal = closeModal;
window.showAdminTab = showAdminTab;
window.showNotification = showNotification;

console.log('✅ GTGOTG - Got To Go On The Go - Loaded successfully!');