// GTGOTG - Got To Go On The Go - Complete Application
// Copyright © 2025 Jessica Esposito / Colorado Quality LLC. All rights reserved.

console.log('🚀 GTGOTG - Got To Go On The Go - Loading...');

// Mapbox Configuration
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ3Rnb3RnIiwiYSI6ImNtNXNkZjBkZjBhcWsya3M4ZGZkZGZkZGYifQ.example'; // Replace with your actual token
mapboxgl.accessToken = MAPBOX_TOKEN;

// Global Variables
let map;
let userLocation = null;
let currentUser = null;
let currentBusinesses = [];
let currentBusinessForReview = null;
let searchMarkers = [];
let userMarker = null;
let currentSearchQuery = '';
let currentSearchBounds = null;

// Sample businesses for fallback
const sampleBusinesses = [
    {
        id: 'sample-1',
        name: 'Downtown Coffee House',
        category: 'coffee-shop',
        address: '123 Main St, Denver, CO 80202',
        phone: '(303) 555-0123',
        coordinates: [-104.9903, 39.7392],
        distance: 0.3,
        hours: 'Mon-Fri: 6AM-8PM, Sat-Sun: 7AM-7PM',
        bathroomTypes: ['mens', 'womens', 'accessible'],
        amenities: ['toilet-paper', 'soap', 'paper-towels', 'hand-dryer'],
        ratings: { overall: 8.5, cleanliness: 9, safety: 8, accessibility: 9 },
        reviewCount: 47,
        isSample: true
    },
    {
        id: 'sample-2',
        name: 'Highway Rest Stop',
        category: 'rest-area',
        address: 'I-25 Mile Marker 210, Colorado Springs, CO',
        phone: '(719) 555-0456',
        coordinates: [-104.8214, 38.8339],
        distance: 1.2,
        hours: '24/7',
        bathroomTypes: ['mens', 'womens', 'accessible'],
        amenities: ['toilet-paper', 'soap', 'hand-dryer', 'baby-changing', 'ada-compliant'],
        ratings: { overall: 7.2, cleanliness: 7, safety: 8, accessibility: 9 },
        reviewCount: 23,
        isSample: true
    }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing GTGOTG application...');
    
    initializeMap();
    initializeSearch();
    initializeFilters();
    initializeAuth();
    loadInitialData();
    
    console.log('✅ GTGOTG application initialized successfully');
});

// Initialize Mapbox map
function initializeMap() {
    console.log('🗺️ Initializing Mapbox map...');
    
    try {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-98.5795, 39.8283], // Center of USA
            zoom: 4,
            attributionControl: false
        });

        map.addControl(new mapboxgl.AttributionControl({
            compact: true
        }));

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocate control
        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });

        map.addControl(geolocate, 'top-right');

        map.on('load', function() {
            console.log('✅ Map loaded successfully');
            
            // Get user location and search for nearby businesses
            geolocate.trigger();
            
            // Search for businesses when map moves
            map.on('moveend', debounce(searchBusinessesInView, 1000));
        });

        // Handle geolocate events
        geolocate.on('geolocate', function(e) {
            userLocation = [e.coords.longitude, e.coords.latitude];
            console.log('📍 User location found:', userLocation);
            searchNearbyBusinesses();
        });

        geolocate.on('error', function(e) {
            console.log('❌ Geolocation error:', e);
            // Default to Denver if geolocation fails
            userLocation = [-104.9903, 39.7392];
            map.setCenter(userLocation);
            map.setZoom(12);
            searchNearbyBusinesses();
        });

    } catch (error) {
        console.error('❌ Error initializing map:', error);
        showNotification('Map failed to load. Please refresh the page.', 'error');
    }
}

// Search for businesses in current map view
async function searchBusinessesInView() {
    if (!map) return;
    
    const bounds = map.getBounds();
    const center = map.getCenter();
    
    console.log('🔍 Searching businesses in current view...');
    
    try {
        await searchBusinessesInBounds(bounds, center);
    } catch (error) {
        console.error('❌ Error searching businesses in view:', error);
    }
}

// Search for businesses in specific bounds
async function searchBusinessesInBounds(bounds, center) {
    const categories = [
        'gas_station',
        'restaurant',
        'cafe',
        'convenience_store',
        'shopping_mall',
        'hotel',
        'hospital',
        'library',
        'park'
    ];
    
    let allBusinesses = [];
    
    for (const category of categories) {
        try {
            const businesses = await searchMapboxPOI(center, category, 10);
            allBusinesses = allBusinesses.concat(businesses);
        } catch (error) {
            console.error(`Error searching ${category}:`, error);
        }
    }
    
    // Remove duplicates and add sample data
    const uniqueBusinesses = removeDuplicateBusinesses(allBusinesses);
    currentBusinesses = [...uniqueBusinesses, ...sampleBusinesses];
    
    updateMapMarkers();
    renderBusinesses(currentBusinesses);
    updateSearchResultsInfo();
}

// Search Mapbox POI (Points of Interest)
async function searchMapboxPOI(center, category, limit = 10) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${category}.json?` +
        `proximity=${center.lng},${center.lat}&` +
        `limit=${limit}&` +
        `access_token=${MAPBOX_TOKEN}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        return data.features.map(feature => ({
            id: `mapbox-${feature.id}`,
            name: feature.text || feature.place_name,
            category: mapCategoryFromMapbox(category),
            address: feature.place_name,
            coordinates: feature.center,
            distance: calculateDistance(center, { lng: feature.center[0], lat: feature.center[1] }),
            phone: feature.properties.phone || 'Not available',
            hours: 'Hours vary',
            bathroomTypes: ['mens', 'womens'],
            amenities: getDefaultAmenities(category),
            ratings: generateDefaultRatings(),
            reviewCount: 0,
            isMapboxPOI: true
        }));
    } catch (error) {
        console.error('Error fetching Mapbox POI:', error);
        return [];
    }
}

// Map Mapbox categories to our categories
function mapCategoryFromMapbox(mapboxCategory) {
    const categoryMap = {
        'gas_station': 'gas-station',
        'restaurant': 'restaurant',
        'cafe': 'coffee-shop',
        'convenience_store': 'retail',
        'shopping_mall': 'retail',
        'hotel': 'hotel',
        'hospital': 'hospital',
        'library': 'library',
        'park': 'park'
    };
    
    return categoryMap[mapboxCategory] || 'other';
}

// Get default amenities based on category
function getDefaultAmenities(category) {
    const amenityMap = {
        'gas_station': ['toilet-paper', 'soap'],
        'restaurant': ['toilet-paper', 'soap', 'paper-towels'],
        'cafe': ['toilet-paper', 'soap', 'paper-towels'],
        'hotel': ['toilet-paper', 'soap', 'paper-towels', 'hand-dryer'],
        'hospital': ['toilet-paper', 'soap', 'paper-towels', 'hand-dryer', 'ada-compliant'],
        'library': ['toilet-paper', 'soap', 'paper-towels', 'ada-compliant']
    };
    
    return amenityMap[category] || ['toilet-paper', 'soap'];
}

// Generate default ratings for new businesses
function generateDefaultRatings() {
    return {
        overall: Math.round((Math.random() * 3 + 6) * 10) / 10, // 6-9 range
        cleanliness: Math.round((Math.random() * 3 + 6) * 10) / 10,
        safety: Math.round((Math.random() * 3 + 7) * 10) / 10,
        accessibility: Math.round((Math.random() * 3 + 6) * 10) / 10
    };
}

// Remove duplicate businesses
function removeDuplicateBusinesses(businesses) {
    const seen = new Set();
    return businesses.filter(business => {
        const key = `${business.name}-${business.address}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

// Search for nearby businesses
async function searchNearbyBusinesses() {
    if (!userLocation) return;
    
    console.log('🔍 Searching for nearby businesses...');
    
    const center = { lng: userLocation[0], lat: userLocation[1] };
    await searchBusinessesInBounds(null, center);
}

// Perform search based on user input
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    console.log(`🔍 Performing search for: "${query}"`);
    currentSearchQuery = query;
    
    try {
        // First, geocode the search query to get location
        const location = await geocodeSearch(query);
        
        if (location) {
            // Move map to the location
            map.flyTo({
                center: location.coordinates,
                zoom: 12,
                duration: 2000
            });
            
            // Search for businesses in that area
            await searchBusinessesInBounds(null, {
                lng: location.coordinates[0],
                lat: location.coordinates[1]
            });
        } else {
            // If no location found, search current map view
            await searchBusinessesInView();
        }
        
    } catch (error) {
        console.error('❌ Search error:', error);
        showNotification('Search failed. Please try again.', 'error');
    }
}

// Geocode search query
async function geocodeSearch(query) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `country=US&` +
        `types=place,postcode,address&` +
        `access_token=${MAPBOX_TOKEN}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            return {
                name: feature.place_name,
                coordinates: feature.center
            };
        }
        
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (searchInput) {
        // Add search suggestions
        searchInput.addEventListener('input', debounce(handleSearchInput, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });
    }
    
    console.log('🔍 Search functionality initialized');
}

// Handle search input for suggestions
async function handleSearchInput(event) {
    const query = event.target.value.trim();
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (query.length < 2) {
        searchSuggestions.style.display = 'none';
        return;
    }
    
    try {
        const suggestions = await getSearchSuggestions(query);
        displaySearchSuggestions(suggestions);
    } catch (error) {
        console.error('Error getting search suggestions:', error);
    }
}

// Get search suggestions from Mapbox
async function getSearchSuggestions(query) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `country=US&` +
        `types=place,postcode,address,poi&` +
        `limit=5&` +
        `access_token=${MAPBOX_TOKEN}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        return data.features.map(feature => ({
            name: feature.text,
            fullName: feature.place_name,
            coordinates: feature.center,
            type: feature.place_type[0]
        }));
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

// Display search suggestions
function displaySearchSuggestions(suggestions) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (suggestions.length === 0) {
        searchSuggestions.style.display = 'none';
        return;
    }
    
    searchSuggestions.innerHTML = suggestions.map(suggestion => `
        <div class="search-suggestion" onclick="selectSearchSuggestion('${suggestion.fullName}', [${suggestion.coordinates}])">
            <div class="suggestion-main">${suggestion.name}</div>
            <div class="suggestion-subtitle">${suggestion.fullName}</div>
        </div>
    `).join('');
    
    searchSuggestions.style.display = 'block';
}

// Select search suggestion
async function selectSearchSuggestion(placeName, coordinates) {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    searchInput.value = placeName;
    searchSuggestions.style.display = 'none';
    
    // Move map to selected location
    map.flyTo({
        center: coordinates,
        zoom: 12,
        duration: 2000
    });
    
    // Search for businesses in that area
    await searchBusinessesInBounds(null, {
        lng: coordinates[0],
        lat: coordinates[1]
    });
}

// Get current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser', 'error');
        return;
    }
    
    showNotification('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation = [position.coords.longitude, position.coords.latitude];
            
            map.flyTo({
                center: userLocation,
                zoom: 12,
                duration: 2000
            });
            
            searchNearbyBusinesses();
            showNotification('Location found! Searching for nearby restrooms...', 'success');
        },
        function(error) {
            console.error('Geolocation error:', error);
            showNotification('Could not get your location. Please search manually.', 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

// Update map markers
function updateMapMarkers() {
    // Clear existing markers
    searchMarkers.forEach(marker => marker.remove());
    searchMarkers = [];
    
    // Add markers for current businesses
    currentBusinesses.forEach(business => {
        const marker = createBusinessMarker(business);
        searchMarkers.push(marker);
    });
    
    console.log(`📍 Updated map with ${searchMarkers.length} markers`);
}

// Create business marker
function createBusinessMarker(business) {
    // Create custom marker element
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = getMarkerIcon(business.category);
    
    // Different colors for sample vs real businesses
    if (business.isSample) {
        markerElement.style.backgroundColor = '#8B5CF6';
    } else {
        markerElement.style.backgroundColor = '#10B981';
    }
    
    // Create popup
    const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
    }).setHTML(createMarkerPopup(business));
    
    // Create marker
    const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(business.coordinates)
        .setPopup(popup)
        .addTo(map);
    
    return marker;
}

// Get marker icon based on category
function getMarkerIcon(category) {
    const icons = {
        'gas-station': '⛽',
        'restaurant': '🍽️',
        'coffee-shop': '☕',
        'rest-area': '🛣️',
        'retail': '🛍️',
        'hotel': '🏨',
        'park': '🌳',
        'hospital': '🏥',
        'library': '📚'
    };
    
    return icons[category] || '📍';
}

// Create marker popup content
function createMarkerPopup(business) {
    const rating = business.ratings.overall || 0;
    const stars = generateStarDisplay(rating);
    
    return `
        <div class="marker-popup">
            <h4>${business.name}</h4>
            <p class="popup-category">${formatCategory(business.category)}</p>
            <p class="popup-address">${business.address}</p>
            <div class="popup-rating">
                <span class="popup-stars">${stars}</span>
                <span class="popup-rating-number">${rating.toFixed(1)}/10</span>
            </div>
            <div class="popup-actions">
                <button class="btn btn-small btn-primary" onclick="openReviewModal('${business.id}')">Rate</button>
                <button class="btn btn-small btn-secondary" onclick="getDirections([${business.coordinates}])">Directions</button>
            </div>
        </div>
    `;
}

// Initialize filters
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const distanceFilter = document.getElementById('distanceFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (distanceFilter) {
        distanceFilter.addEventListener('change', applyFilters);
    }
    if (ratingFilter) {
        ratingFilter.addEventListener('change', applyFilters);
    }
    
    console.log('🔧 Filters initialized');
}

// Apply filters to business list
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const distanceFilter = parseFloat(document.getElementById('distanceFilter').value);
    const ratingFilter = parseFloat(document.getElementById('ratingFilter').value);
    
    let filteredBusinesses = [...currentBusinesses];
    
    // Apply category filter
    if (categoryFilter) {
        filteredBusinesses = filteredBusinesses.filter(business => 
            business.category === categoryFilter
        );
    }
    
    // Apply distance filter
    if (distanceFilter && userLocation) {
        filteredBusinesses = filteredBusinesses.filter(business => 
            business.distance <= distanceFilter
        );
    }
    
    // Apply rating filter
    if (ratingFilter) {
        filteredBusinesses = filteredBusinesses.filter(business => 
            business.ratings.overall >= ratingFilter
        );
    }
    
    renderBusinesses(filteredBusinesses);
    updateSearchResultsInfo(filteredBusinesses.length);
    
    console.log(`🔍 Applied filters, showing ${filteredBusinesses.length} businesses`);
}

// Toggle quick filter
function toggleQuickFilter(button) {
    button.classList.toggle('active');
    applyQuickFilters();
}

// Apply quick filters
function applyQuickFilters() {
    const activeFilters = Array.from(document.querySelectorAll('.filter-btn.active'))
        .map(btn => btn.dataset.filter);
    
    let filteredBusinesses = [...currentBusinesses];
    
    activeFilters.forEach(filter => {
        switch (filter) {
            case 'wheelchair':
                filteredBusinesses = filteredBusinesses.filter(business => 
                    business.bathroomTypes.includes('accessible')
                );
                break;
            case 'baby-changing':
                filteredBusinesses = filteredBusinesses.filter(business => 
                    business.amenities.includes('baby-changing')
                );
                break;
            case 'open-now':
                // For demo purposes, assume all are open
                break;
            case 'high-rated':
                filteredBusinesses = filteredBusinesses.filter(business => 
                    business.ratings.overall >= 8
                );
                break;
        }
    });
    
    renderBusinesses(filteredBusinesses);
    updateSearchResultsInfo(filteredBusinesses.length);
}

// Render businesses in the grid
function renderBusinesses(businesses) {
    const businessGrid = document.getElementById('businessGrid');
    
    if (!businessGrid) return;
    
    if (businesses.length === 0) {
        businessGrid.innerHTML = `
            <div class="no-results">
                <h4>No restrooms found</h4>
                <p>Try adjusting your search criteria or location.</p>
            </div>
        `;
        return;
    }
    
    businessGrid.innerHTML = businesses.map(business => createBusinessCard(business)).join('');
    
    console.log(`📋 Rendered ${businesses.length} businesses`);
}

// Create business card HTML
function createBusinessCard(business) {
    const rating = business.ratings.overall || 0;
    const stars = generateStarDisplay(rating);
    const bathroomSymbols = business.bathroomTypes.map(type => getBathroomSymbol(type)).join('');
    const amenityTags = business.amenities.slice(0, 4).map(amenity => 
        `<span class="amenity-tag">${formatAmenity(amenity)}</span>`
    ).join('');
    
    const sourceIndicator = business.isSample ? 
        '<span class="source-indicator sample">Sample</span>' : 
        '<span class="source-indicator real">Real Business</span>';
    
    return `
        <div class="business-card" data-business-id="${business.id}">
            <div class="business-header">
                <div>
                    <h4 class="business-name">${business.name}</h4>
                    <p class="business-category">${formatCategory(business.category)}</p>
                    ${sourceIndicator}
                </div>
                <div class="bathroom-types">
                    ${bathroomSymbols}
                </div>
            </div>
            
            <div class="business-info">
                <p class="business-address">📍 ${business.address}</p>
                <p class="business-distance">📏 ${business.distance.toFixed(1)} miles away</p>
                <p class="business-hours">🕐 ${business.hours}</p>
                <p class="business-phone">📞 ${business.phone}</p>
            </div>
            
            <div class="business-ratings">
                <div class="rating-item">
                    <span class="rating-label">Overall:</span>
                    <div class="rating-value">
                        <span class="stars">${stars}</span>
                        <span class="rating-number">${rating.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Cleanliness:</span>
                    <div class="rating-value">
                        <span class="stars">${generateStarDisplay(business.ratings.cleanliness)}</span>
                        <span class="rating-number">${business.ratings.cleanliness.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Safety:</span>
                    <div class="rating-value">
                        <span class="stars">${generateStarDisplay(business.ratings.safety)}</span>
                        <span class="rating-number">${business.ratings.safety.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Accessibility:</span>
                    <div class="rating-value">
                        <span class="stars">${generateStarDisplay(business.ratings.accessibility)}</span>
                        <span class="rating-number">${business.ratings.accessibility.toFixed(1)}/10</span>
                    </div>
                </div>
                <p class="review-count">${business.reviewCount} reviews</p>
            </div>
            
            <div class="business-amenities">
                ${amenityTags}
            </div>
            
            <div class="business-actions">
                <button class="btn btn-primary" onclick="openReviewModal('${business.id}')">Rate & Review</button>
                <button class="btn btn-secondary" onclick="getDirections([${business.coordinates}])">Get Directions</button>
                <button class="btn btn-secondary" onclick="claimBusiness('${business.id}')">Claim Business</button>
            </div>
        </div>
    `;
}

// Update search results info
function updateSearchResultsInfo(count = null) {
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const displayCount = count !== null ? count : currentBusinesses.length;
    
    let message = `Showing ${displayCount} restrooms`;
    
    if (currentSearchQuery) {
        message += ` for "${currentSearchQuery}"`;
    } else if (userLocation) {
        message += ' in your area';
    } else {
        message += ' nationwide';
    }
    
    searchResultsInfo.textContent = message;
}

// Get directions to business
function getDirections(coordinates) {
    if (!userLocation) {
        showNotification('Please enable location access to get directions', 'warning');
        return;
    }
    
    const directionsUrl = `https://www.google.com/maps/dir/${userLocation[1]},${userLocation[0]}/${coordinates[1]},${coordinates[0]}`;
    window.open(directionsUrl, '_blank');
}

// Center map on user location
function centerMapOnUser() {
    if (!userLocation) {
        getCurrentLocation();
        return;
    }
    
    map.flyTo({
        center: userLocation,
        zoom: 12,
        duration: 1500
    });
}

// Toggle map view
function toggleMapView() {
    const currentStyle = map.getStyle().name;
    
    if (currentStyle.includes('satellite')) {
        map.setStyle('mapbox://styles/mapbox/streets-v12');
    } else {
        map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function calculateDistance(point1, point2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function generateStarDisplay(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    if (hasHalfStar) {
        stars += '☆';
    }
    
    return stars;
}

function getBathroomSymbol(type) {
    const symbols = {
        'mens': '🚹',
        'womens': '🚺',
        'neutral': '🚻',
        'accessible': '♿'
    };
    
    return `<span class="bathroom-symbol" title="${type}">${symbols[type] || '🚻'}</span>`;
}

function formatCategory(category) {
    const categoryNames = {
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

function formatAmenity(amenity) {
    const amenityNames = {
        'toilet-paper': 'Toilet Paper',
        'soap': 'Soap',
        'paper-towels': 'Paper Towels',
        'hand-dryer': 'Hand Dryer',
        'baby-changing': 'Baby Changing',
        'ada-compliant': 'ADA Compliant'
    };
    
    return amenityNames[amenity] || amenity;
}

// Authentication Functions
function initializeAuth() {
    // Check for existing user session
    const savedUser = localStorage.getItem('gtgotg_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserStatus();
    }
    
    console.log('🔐 Authentication initialized');
}

function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Simple authentication for demo
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('gtgotg_current_user', JSON.stringify(user));
        updateUserStatus();
        closeModal('loginModal');
        showNotification(`Welcome back, ${user.firstName}!`, 'success');
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: password,
        badge: 'Reviewer',
        joinDate: new Date().toISOString(),
        reviewCount: 0
    };
    
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === newUser.email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    users.push(newUser);
    localStorage.setItem('gtgotg_users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('gtgotg_current_user', JSON.stringify(newUser));
    
    updateUserStatus();
    closeModal('registerModal');
    showNotification(`Welcome to GTGOTG, ${newUser.firstName}!`, 'success');
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
    
    if (currentUser) {
        userStatus.style.display = 'block';
        userName.textContent = currentUser.firstName;
        userBadge.textContent = currentUser.badge;
        
        // Show admin button for admin users
        if (currentUser.email === 'admin@gtgotg.com') {
            adminBtn.style.display = 'inline-flex';
        }
    } else {
        userStatus.style.display = 'none';
        adminBtn.style.display = 'none';
    }
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

// Load initial data
function loadInitialData() {
    // Initialize with sample data
    currentBusinesses = [...sampleBusinesses];
    
    // Calculate distances if user location is available
    if (userLocation) {
        currentBusinesses.forEach(business => {
            business.distance = calculateDistance(
                { lng: userLocation[0], lat: userLocation[1] },
                { lng: business.coordinates[0], lat: business.coordinates[1] }
            );
        });
    }
    
    renderBusinesses(currentBusinesses);
    updateSearchResultsInfo();
    
    console.log('📊 Initial data loaded');
}

// Business management functions
function claimBusiness(businessId) {
    if (!currentUser) {
        showNotification('Please login to claim a business', 'warning');
        showModal('loginModal');
        return;
    }
    
    const business = currentBusinesses.find(b => b.id === businessId);
    if (!business) return;
    
    // Set up claim modal
    document.getElementById('claimBusinessId').value = businessId;
    document.getElementById('claimBusinessName').value = business.name;
    
    showModal('claimBusinessModal');
}

function handleBusinessClaim(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const claimData = {
        businessId: formData.get('businessId'),
        ownerName: formData.get('ownerName'),
        ownerTitle: formData.get('ownerTitle'),
        businessPhone: formData.get('businessPhone'),
        verificationMethod: formData.get('verificationMethod'),
        additionalInfo: formData.get('additionalInfo'),
        userId: currentUser.id,
        timestamp: new Date().toISOString()
    };
    
    // Store claim request
    const claims = JSON.parse(localStorage.getItem('gtgotg_business_claims') || '[]');
    claims.push(claimData);
    localStorage.setItem('gtgotg_business_claims', JSON.stringify(claims));
    
    closeModal('claimBusinessModal');
    showNotification('Business claim submitted! We will review and contact you within 2-3 business days.', 'success');
}

function handleAddBusiness(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    const newBusiness = {
        id: 'user-' + Date.now(),
        name: formData.get('businessName'),
        category: formData.get('category'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        website: formData.get('website') || '',
        coordinates: [-104.9903, 39.7392], // Default coordinates, would geocode in real app
        distance: 0,
        hours: formData.get('hours') || 'Hours vary',
        bathroomTypes: Array.from(formData.getAll('bathroomTypes')),
        amenities: Array.from(formData.getAll('amenities')),
        ratings: { overall: 0, cleanliness: 0, safety: 0, accessibility: 0 },
        reviewCount: 0,
        description: formData.get('description') || '',
        addedBy: currentUser ? currentUser.id : 'anonymous',
        addedDate: new Date().toISOString(),
        isUserAdded: true
    };
    
    // Add to current businesses
    currentBusinesses.unshift(newBusiness);
    
    // Store in localStorage
    const userBusinesses = JSON.parse(localStorage.getItem('gtgotg_user_businesses') || '[]');
    userBusinesses.push(newBusiness);
    localStorage.setItem('gtgotg_user_businesses', JSON.stringify(userBusinesses));
    
    // Re-render
    renderBusinesses(currentBusinesses);
    updateMapMarkers();
    
    closeModal('addBusinessModal');
    showNotification('Business added successfully! Thank you for contributing to the community.', 'success');
}

// Admin Functions
function showAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
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
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    
    document.getElementById('totalBusinesses').textContent = currentBusinesses.length;
    document.getElementById('totalReviews').textContent = reviews.length;
    document.getElementById('totalUsers').textContent = users.length;
    
    const avgRating = reviews.length > 0 ? 
        reviews.reduce((sum, r) => sum + r.ratings.overall, 0) / reviews.length : 0;
    document.getElementById('averageRating').textContent = avgRating.toFixed(1);
}

// Social login functions (demo)
function loginWithGoogle() {
    showNotification('Google login would be implemented with OAuth', 'info');
}

function loginWithFacebook() {
    showNotification('Facebook login would be implemented with OAuth', 'info');
}

function registerWithGoogle() {
    showNotification('Google registration would be implemented with OAuth', 'info');
}

function registerWithFacebook() {
    showNotification('Facebook registration would be implemented with OAuth', 'info');
}

// Global function exports
window.performSearch = performSearch;
window.getCurrentLocation = getCurrentLocation;
window.centerMapOnUser = centerMapOnUser;
window.toggleMapView = toggleMapView;
window.applyFilters = applyFilters;
window.toggleQuickFilter = toggleQuickFilter;
window.showModal = showModal;
window.closeModal = closeModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.claimBusiness = claimBusiness;
window.handleBusinessClaim = handleBusinessClaim;
window.handleAddBusiness = handleAddBusiness;
window.showAdminTab = showAdminTab;
window.getDirections = getDirections;
window.selectSearchSuggestion = selectSearchSuggestion;
window.loginWithGoogle = loginWithGoogle;
window.loginWithFacebook = loginWithFacebook;
window.registerWithGoogle = registerWithGoogle;
window.registerWithFacebook = registerWithFacebook;

console.log('✅ GTGOTG - Got To Go On The Go - Loaded successfully!');