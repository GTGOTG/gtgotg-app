// GTGOTG - Got To Go On The Go - Complete Application
// Copyright © 2025 Jessica Esposito / Colorado Quality LLC. All rights reserved.

console.log('🚽 GTGOTG - Loading...');

// Mapbox Configuration
mapboxgl.accessToken = 'pk.eyJ1IjoiY29sb3JhZG9xdWFsaXR5bGxjIiwiYSI6ImNtZW4yOG9scTB4ZzgybG9jNTgwZW8wbDAifQ.Vo3vwfNTszwGPkYp4H054Q';

// Global Variables
let map;
let currentUser = null;
let currentBusinesses = [];
let currentBusinessForReview = null;
let userLocation = null;
let searchMarkers = [];

// Photo upload configuration
const PHOTO_CONFIG = {
    maxFiles: 3,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
};

// Global variables for review system
let selectedPhotos = [];
let selectedBathroomType = null;
let isWheelchairAccessible = false;
let currentRatings = {
    overall: 0,
    cleanliness: 0,
    safety: 0,
    accessibility: 0
};

// Sample business data
const sampleBusinesses = [
    {
        id: 1,
        name: "Shell Gas Station",
        category: "gas-station",
        address: "123 Main St, Denver, CO 80202",
        phone: "(303) 555-0123",
        hours: "24/7",
        coordinates: [-104.9903, 39.7392],
        distance: 0.3,
        ratings: {
            overall: 4.2,
            cleanliness: 4.0,
            safety: 4.5,
            accessibility: 3.8
        },
        reviewCount: 24,
        amenities: ["toilet-paper", "soap", "hand-dryer", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"]
    },
    {
        id: 2,
        name: "Starbucks Coffee",
        category: "coffee-shop",
        address: "456 Broadway, Denver, CO 80203",
        phone: "(303) 555-0456",
        hours: "5:00 AM - 10:00 PM",
        coordinates: [-104.9847, 39.7348],
        distance: 0.7,
        ratings: {
            overall: 4.6,
            cleanliness: 4.8,
            safety: 4.4,
            accessibility: 4.2
        },
        reviewCount: 18,
        amenities: ["toilet-paper", "soap", "paper-towels", "baby-changing"],
        bathroomTypes: ["neutral", "accessible"]
    },
    {
        id: 3,
        name: "McDonald's",
        category: "restaurant",
        address: "789 Colfax Ave, Denver, CO 80204",
        phone: "(303) 555-0789",
        hours: "6:00 AM - 11:00 PM",
        coordinates: [-105.0178, 39.7392],
        distance: 1.2,
        ratings: {
            overall: 3.8,
            cleanliness: 3.5,
            safety: 4.0,
            accessibility: 4.5
        },
        reviewCount: 32,
        amenities: ["toilet-paper", "soap", "hand-dryer", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"]
    },
    {
        id: 4,
        name: "Target",
        category: "retail",
        address: "321 Colorado Blvd, Denver, CO 80206",
        phone: "(303) 555-0321",
        hours: "8:00 AM - 10:00 PM",
        coordinates: [-104.9403, 39.7392],
        distance: 2.1,
        ratings: {
            overall: 4.4,
            cleanliness: 4.6,
            safety: 4.2,
            accessibility: 4.8
        },
        reviewCount: 15,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"]
    },
    {
        id: 5,
        name: "Denver Public Library",
        category: "library",
        address: "10 W 14th Ave Pkwy, Denver, CO 80204",
        phone: "(303) 555-1000",
        hours: "9:00 AM - 8:00 PM",
        coordinates: [-104.9903, 39.7372],
        distance: 0.8,
        ratings: {
            overall: 4.7,
            cleanliness: 4.9,
            safety: 4.5,
            accessibility: 4.9
        },
        reviewCount: 12,
        amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "ada-compliant"],
        bathroomTypes: ["mens", "womens", "accessible"]
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing GTGOTG...');
    
    initializeMap();
    initializeSearch();
    initializeFilters();
    initializeModals();
    initializeAuth();
    loadBusinesses();
    
    // Initialize enhanced review system after a delay
    setTimeout(() => {
        initializeEnhancedReviewSystem();
    }, 1000);
    
    console.log('✅ GTGOTG initialized successfully');
});

// Initialize map
function initializeMap() {
    try {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-104.9903, 39.7392], // Denver, CO
            zoom: 12
        });

        map.on('load', function() {
            console.log('🗺️ Map loaded successfully');
            addBusinessMarkers();
        });

        map.on('error', function(e) {
            console.error('Map error:', e);
        });

    } catch (error) {
        console.error('Failed to initialize map:', error);
        showNotification('Map failed to load. Please refresh the page.', 'error');
    }
}

// Add business markers to map
function addBusinessMarkers() {
    if (!map) return;
    
    sampleBusinesses.forEach(business => {
        const marker = new mapboxgl.Marker({
            color: '#8B5CF6'
        })
        .setLngLat(business.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`
            <div style="padding: 10px;">
                <h4 style="margin: 0 0 5px 0; color: #8B5CF6;">${business.name}</h4>
                <p style="margin: 0 0 5px 0; font-size: 0.9rem;">${business.address}</p>
                <p style="margin: 0; font-size: 0.8rem; color: #666;">
                    ⭐ ${business.ratings.overall.toFixed(1)} • ${business.reviewCount} reviews
                </p>
            </div>
        `))
        .addTo(map);
    });
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Handle search input
function handleSearchInput(event) {
    const query = event.target.value.trim();
    if (query.length > 2) {
        showSearchSuggestions(query);
    } else {
        hideSearchSuggestions();
    }
}

// Show search suggestions
function showSearchSuggestions(query) {
    const suggestions = document.getElementById('searchSuggestions');
    if (!suggestions) return;
    
    // Filter businesses based on query
    const matches = sampleBusinesses.filter(business => 
        business.name.toLowerCase().includes(query.toLowerCase()) ||
        business.address.toLowerCase().includes(query.toLowerCase()) ||
        business.category.toLowerCase().includes(query.toLowerCase())
    );
    
    if (matches.length > 0) {
        suggestions.innerHTML = matches.slice(0, 5).map(business => `
            <div class="search-suggestion" onclick="selectSuggestion('${business.name}', '${business.address}')">
                <div class="suggestion-main">${business.name}</div>
                <div class="suggestion-subtitle">${business.address}</div>
            </div>
        `).join('');
        suggestions.style.display = 'block';
    } else {
        hideSearchSuggestions();
    }
}

// Hide search suggestions
function hideSearchSuggestions() {
    const suggestions = document.getElementById('searchSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
}

// Select location suggestion
function selectLocationSuggestion(placeName, center) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = placeName;
    }
    hideSearchSuggestions();
    
    // Center map and find nearby businesses
    if (map) {
        map.flyTo({
            center: center,
            zoom: 12
        });
    }
    
    const nearbyBusinesses = findNearbyBusinesses(center);
    currentBusinesses = nearbyBusinesses;
    renderBusinesses(nearbyBusinesses);
    updateSearchResults(nearbyBusinesses.length, placeName);
    
    showNotification(`Found ${nearbyBusinesses.length} restrooms near ${placeName}`, 'success');
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    console.log('🔍 Performing search for:', query);
    
    if (!query) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    // Use Mapbox Geocoding API for real location search
    geocodeLocation(query).then(results => {
        if (results.length > 0) {
            const location = results[0];
            
            // Center map on searched location
            if (map) {
                map.flyTo({
                    center: location.center,
                    zoom: 12
                });
            }
            
            // Find nearby businesses (simulate for demo)
            const nearbyBusinesses = findNearbyBusinesses(location.center);
            currentBusinesses = nearbyBusinesses;
            renderBusinesses(nearbyBusinesses);
            updateSearchResults(nearbyBusinesses.length, query);
            hideSearchSuggestions();
            
            showNotification(`Found ${nearbyBusinesses.length} restrooms near ${location.place_name}`, 'success');
        } else {
            showNotification('Location not found. Please try a different search.', 'warning');
        }
    }).catch(error => {
        console.error('Geocoding error:', error);
        showNotification('Search failed. Please try again.', 'error');
    });
}

// Geocode location using Mapbox API
async function geocodeLocation(query) {
    try {
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=US&types=place,postcode,address`
        );
        
        if (!response.ok) {
            throw new Error('Geocoding request failed');
        }
        
        const data = await response.json();
        return data.features || [];
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
}

// Find nearby businesses (simulate based on location)
function findNearbyBusinesses(center) {
    // For demo purposes, return sample businesses with updated distances
    const allBusinesses = [];
    const businessTypes = [
        'gas station',
        'restaurant', 
        'coffee shop',
        'grocery store',
        'shopping mall',
        'hotel',
        'hospital',
        'library',
        'park',
        'fast food',
        'convenience store',
        'truck stop',
        'rest area',
        'pharmacy',
        'department store',
        'bank',
        'airport',
        'train station',
        'bus station',
        'visitor center'
    ];
    
    try {
        // Search for each business type
        for (const businessType of businessTypes) {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(businessType)}.json?` +
                `proximity=${lng},${lat}&` +
                `bbox=${lng-0.2},${lat-0.2},${lng+0.2},${lat+0.2}&` +
                `limit=10&` +
                `access_token=${MAPBOX_TOKEN}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.features) {
                data.features.forEach(feature => {
                    const business = createBusinessFromMapboxFeature(feature, businessType, lat, lng);
                    if (business) {
                        allBusinesses.push(business);
                    }
                });
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`✅ Found ${allBusinesses.length} real businesses`);
        
    } catch (error) {
        console.error('Error searching businesses:', error);
        showNotification('Error searching for businesses. Please try again.', 'error');
        return [];
    }
    const suggestions = document.getElementById('searchSuggestions');
    // Remove duplicates and sort by distance
    const uniqueBusinesses = removeDuplicateBusinesses(allBusinesses);
    return uniqueBusinesses.sort((a, b) => a.distance - b.distance);
}

// Create business object from Mapbox feature
function createBusinessFromMapboxFeature(feature, businessType, searchLat, searchLng) {
    if (!feature.geometry || !feature.geometry.coordinates) return null;
    
    const [lng, lat] = feature.geometry.coordinates;
    const distance = calculateDistance(searchLat, searchLng, lat, lng);
    
    // Skip if too far (more than 25 miles)
    if (distance > 25) return null;
    
    const business = {
        id: `mapbox_${feature.id || Math.random().toString(36).substr(2, 9)}`,
        name: feature.text || feature.place_name?.split(',')[0] || `${businessType}`,
        category: mapBusinessTypeToCategory(businessType),
        address: feature.place_name || 'Address not available',
        coordinates: [lng, lat],
        distance: distance,
        phone: generateRealisticPhone(),
        hours: generateRealisticHours(),
        ratings: generateRealisticRatings(),
        reviewCount: Math.floor(Math.random() * 200) + 5,
        amenities: generateRealisticAmenities(businessType),
        bathroomTypes: generateBathroomTypes(),
        isOpen: Math.random() > 0.1 // 90% chance of being open
    };
    
    return business;
}

// Map business type to category
function mapBusinessTypeToCategory(businessType) {
    const categoryMap = {
        'gas station': 'gas-station',
        'restaurant': 'restaurant', 
        'coffee shop': 'coffee-shop',
        'grocery store': 'retail',
        'shopping mall': 'retail',
        'hotel': 'hotel',
        'hospital': 'hospital',
        'library': 'library',
        'park': 'park',
        'fast food': 'restaurant',
        'convenience store': 'retail',
        'truck stop': 'gas-station',
        'rest area': 'park',
        'pharmacy': 'retail',
        'department store': 'retail',
        'bank': 'retail',
        'airport': 'hotel',
        'train station': 'hotel',
        'bus station': 'hotel',
        'visitor center': 'park'
    };
    
    return categoryMap[businessType] || 'retail';
}

// Remove duplicate businesses (same name and similar location)
function removeDuplicateBusinesses(businesses) {
    const unique = [];
    const seen = new Set();
    
    for (const business of businesses) {
        const key = `${business.name.toLowerCase()}_${Math.round(business.coordinates[0] * 1000)}_${Math.round(business.coordinates[1] * 1000)}`;
        
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(business);
        }
    }
    
    return unique;
}

// Generate realistic phone number
function generateRealisticPhone() {
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${number}`;
}

// Generate realistic hours
function generateRealisticHours() {
    const hourOptions = [
        '24 hours',
        '6:00 AM - 11:00 PM',
        '7:00 AM - 10:00 PM',
        '8:00 AM - 9:00 PM',
        '9:00 AM - 8:00 PM',
        '10:00 AM - 6:00 PM'
    ];
    return hourOptions[Math.floor(Math.random() * hourOptions.length)];
}

// Generate realistic ratings
function generateRealisticRatings() {
    const base = 6 + Math.random() * 4; // 6.0 to 10.0
    return {
        overall: Math.round(base * 10) / 10,
        cleanliness: Math.round((base + (Math.random() - 0.5)) * 10) / 10,
        safety: Math.round((base + (Math.random() - 0.5)) * 10) / 10,
        accessibility: Math.round((base + (Math.random() - 0.5)) * 10) / 10
    };
}

// Generate realistic amenities based on business type
function generateRealisticAmenities(businessType) {
    const baseAmenities = ['toilet-paper', 'soap'];
    const possibleAmenities = ['paper-towels', 'hand-dryer', 'baby-changing', 'ada-compliant'];
    
    // Gas stations and truck stops more likely to have all amenities
    if (businessType.includes('gas') || businessType.includes('truck')) {
        return [...baseAmenities, ...possibleAmenities.filter(() => Math.random() > 0.3)];
    }
    
    // Restaurants and coffee shops likely to have basic amenities
    if (businessType.includes('restaurant') || businessType.includes('coffee')) {
        return [...baseAmenities, ...possibleAmenities.filter(() => Math.random() > 0.5)];
    }
    
    // Other businesses have random amenities
    return [...baseAmenities, ...possibleAmenities.filter(() => Math.random() > 0.6)];
}

// Generate bathroom types
function generateBathroomTypes() {
    const types = ['mens', 'womens'];
    
    // 30% chance of having neutral bathroom
    if (Math.random() > 0.7) {
        types.push('neutral');
    }
    
    // 40% chance of being wheelchair accessible
    if (Math.random() > 0.6) {
        types.push('accessible');
    }
    
    return types;
    
    try {
        // Get geocoding suggestions
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=US&types=place,postcode,address&limit=5`
        );
        
        if (response.ok) {
            const data = await response.json();
            const features = data.features || [];
            
            if (features.length > 0) {
                suggestions.innerHTML = features.map(feature => `
                    <div class="search-suggestion" onclick="selectLocationSuggestion('${feature.place_name}', [${feature.center}])">
                        <div class="suggestion-main">${feature.text}</div>
                        <div class="suggestion-subtitle">${feature.place_name}</div>
                    </div>
                `).join('');
                suggestions.style.display = 'block';
            } else {
                hideSearchSuggestions();
            }
        }
    } catch (error) {
        console.error('Suggestion error:', error);
        hideSearchSuggestions();
    }
}

// Update search results info
function updateSearchResults(count, query) {
    const resultsInfo = document.getElementById('searchResultsInfo');
    if (resultsInfo) {
        if (query) {
            resultsInfo.textContent = `Found ${count} result${count !== 1 ? 's' : ''} for "${query}"`;
        } else {
            resultsInfo.textContent = 'Showing all restrooms in your area';
        }
    }
}

// Initialize filters
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
    const categoryFilter = document.getElementById('categoryFilter');
    const distanceFilter = document.getElementById('distanceFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    const category = categoryFilter ? categoryFilter.value : '';
    const maxDistance = distanceFilter ? parseFloat(distanceFilter.value) : null;
    const minRating = ratingFilter ? parseFloat(ratingFilter.value) : null;
    
    let filtered = [...sampleBusinesses];
    
    // Apply category filter
    if (category) {
        filtered = filtered.filter(business => business.category === category);
    }
    
    // Apply distance filter
    if (maxDistance) {
        filtered = filtered.filter(business => business.distance <= maxDistance);
    }
    
    // Apply rating filter
    if (minRating) {
        filtered = filtered.filter(business => business.ratings.overall >= minRating);
    }
    
    currentBusinesses = filtered;
    renderBusinesses(filtered);
    updateSearchResults(filtered.length, '');
    
    console.log('🔧 Applied filters, showing', filtered.length, 'businesses');
}

// Toggle quick filter
function toggleQuickFilter(button) {
    button.classList.toggle('active');
    
    const filter = button.dataset.filter;
    let filtered = [...sampleBusinesses];
    
    // Get all active quick filters
    const activeFilters = Array.from(document.querySelectorAll('.filter-btn.active'))
        .map(btn => btn.dataset.filter);
    
    // Apply quick filters
    activeFilters.forEach(filterType => {
        switch(filterType) {
            case 'wheelchair':
                filtered = filtered.filter(business => 
                    business.bathroomTypes.includes('accessible'));
                break;
            case 'baby-changing':
                filtered = filtered.filter(business => 
                    business.amenities.includes('baby-changing'));
                break;
            case 'open-now':
                filtered = filtered.filter(business => 
                    business.hours === '24/7' || business.hours.includes('AM'));
                break;
            case 'high-rated':
                filtered = filtered.filter(business => 
                    business.ratings.overall >= 4.0);
                break;
        }
    });
    
    currentBusinesses = filtered;
    renderBusinesses(filtered);
    updateSearchResults(filtered.length, '');
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
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            if (map) {
                map.flyTo({
                    center: [userLocation.lng, userLocation.lat],
                    zoom: 14
                });
                
                // Add user location marker
                new mapboxgl.Marker({ color: '#10B981' })
                    .setLngLat([userLocation.lng, userLocation.lat])
                    .setPopup(new mapboxgl.Popup().setHTML('<div style="padding: 10px;"><strong>Your Location</strong></div>'))
                    .addTo(map);
            }
            
            showNotification('Location found!', 'success');
            
            // Update distances and re-render
            updateDistances();
            renderBusinesses(currentBusinesses.length > 0 ? currentBusinesses : sampleBusinesses);
        },
        function(error) {
            console.error('Geolocation error:', error);
            showNotification('Unable to get your location', 'error');
        }
    );
}

// Update distances based on user location
function updateDistances() {
    if (!userLocation) return;
    
    sampleBusinesses.forEach(business => {
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            business.coordinates[1], business.coordinates[0]
        );
        business.distance = distance;
    });
    
    // Sort by distance
    sampleBusinesses.sort((a, b) => a.distance - b.distance);
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
    return R * c;
}

// Load and render businesses
function loadBusinesses() {
    currentBusinesses = sampleBusinesses;
    renderBusinesses(sampleBusinesses);
    updateSearchResults(sampleBusinesses.length, '');
}

// Render businesses
function renderBusinesses(businesses) {
    const grid = document.getElementById('businessGrid');
    if (!grid) return;
    
    if (businesses.length === 0) {
        grid.innerHTML = '<div class="no-results">No restrooms found matching your criteria.</div>';
        return;
    }
    
    grid.innerHTML = businesses.map(business => createBusinessCard(business)).join('');
}

// Create business card HTML
function createBusinessCard(business) {
    const stars = '★'.repeat(Math.floor(business.ratings.overall)) + 
                 '☆'.repeat(5 - Math.floor(business.ratings.overall));
    
    const bathroomSymbols = business.bathroomTypes.map(type => {
        switch(type) {
            case 'mens': return '🚹';
            case 'womens': return '🚺';
            case 'neutral': return '🚻';
            case 'accessible': return '♿';
            default: return '';
        }
    }).join(' ');
    
    return `
        <div class="business-card">
            <div class="business-header">
                <div>
                    <h4 class="business-name">${business.name}</h4>
                    <p class="business-category">${formatCategory(business.category)}</p>
                </div>
                <div class="bathroom-types">
                    ${bathroomSymbols.split(' ').map(symbol => 
                        `<span class="bathroom-symbol">${symbol}</span>`
                    ).join('')}
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
                    <span class="rating-label">Overall</span>
                    <div class="rating-value">
                        <span class="stars">${stars}</span>
                        <span class="rating-number">${business.ratings.overall.toFixed(1)}</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Cleanliness</span>
                    <div class="rating-value">
                        <span class="rating-number">${business.ratings.cleanliness.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Safety</span>
                    <div class="rating-value">
                        <span class="rating-number">${business.ratings.safety.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Accessibility</span>
                    <div class="rating-value">
                        <span class="rating-number">${business.ratings.accessibility.toFixed(1)}/10</span>
                    </div>
                </div>
                <div class="review-count">${business.reviewCount} reviews</div>
            </div>
            
            <div class="business-amenities">
                <div class="amenities-list">
                    ${business.amenities.map(amenity => 
                        `<span class="amenity-tag">${formatAmenity(amenity)}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div class="business-actions">
                <button class="btn btn-primary btn-small" onclick="openReviewModal(${business.id})">
                    ⭐ Rate & Review
                </button>
                <button class="btn btn-secondary btn-small" onclick="getDirections(${business.coordinates[1]}, ${business.coordinates[0]})">
                    🧭 Directions
                </button>
            </div>
        </div>
    `;
}

// Format category for display
function formatCategory(category) {
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

// Format amenity for display
function formatAmenity(amenity) {
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

// Get directions
function getDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

// Initialize modals
function initializeModals() {
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize authentication
function initializeAuth() {
    // Check for existing user session
    const savedUser = localStorage.getItem('gtgotg_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserStatus();
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Simple authentication (in real app, this would be server-side)
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('gtgotg_current_user', JSON.stringify(user));
        updateUserStatus();
        closeModal('loginModal');
        showNotification(`Welcome back, ${user.firstName}!`, 'success');
        event.target.reset();
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

// Handle registration
function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        id: Date.now(),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        badge: 'Reviewer',
        joinDate: new Date().toISOString()
    };
    
    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    if (users.find(u => u.email === userData.email)) {
        showNotification('An account with this email already exists', 'error');
        return;
    }
    
    // Save user
    users.push(userData);
    localStorage.setItem('gtgotg_users', JSON.stringify(users));
    
    // Log in the user
    currentUser = userData;
    localStorage.setItem('gtgotg_current_user', JSON.stringify(userData));
    
    updateUserStatus();
    closeModal('registerModal');
    showNotification(`Welcome to GTGOTG, ${userData.firstName}!`, 'success');
    event.target.reset();
}

// Update user status display
function updateUserStatus() {
    const userStatus = document.getElementById('userStatus');
    const userName = document.getElementById('userName');
    const userBadge = document.getElementById('userBadge');
    const adminBtn = document.getElementById('adminBtn');
    const loginBtn = document.querySelector('button[onclick="showModal(\'loginModal\')"]');
    const signUpBtn = document.querySelector('button[onclick="showModal(\'registerModal\')"]');
    
    if (currentUser) {
        if (userStatus) userStatus.style.display = 'block';
        if (userName) userName.textContent = currentUser.firstName;
        if (userBadge) userBadge.textContent = currentUser.badge;
        if (loginBtn) loginBtn.style.display = 'none';
        if (signUpBtn) signUpBtn.style.display = 'none';
        
        // Show admin button for admin users
        if (adminBtn && currentUser.email === 'admin@gtgotg.com') {
            adminBtn.style.display = 'inline-block';
        }
    } else {
        if (userStatus) userStatus.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signUpBtn) signUpBtn.style.display = 'inline-block';
        if (adminBtn) adminBtn.style.display = 'none';
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('gtgotg_current_user');
    updateUserStatus();
    showNotification('Logged out successfully', 'info');
}

// Show notification
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Center map on user location
function centerMapOnUser() {
    if (userLocation && map) {
        map.flyTo({
            center: [userLocation.lng, userLocation.lat],
            zoom: 14
        });
    } else {
        getCurrentLocation();
    }
}

// Toggle map view
function toggleMapView() {
    if (!map) return;
    
    const currentStyle = map.getStyle().name;
    if (currentStyle === 'Mapbox Streets') {
        map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
    } else {
        map.setStyle('mapbox://styles/mapbox/streets-v12');
    }
}

// Enhanced Review System Functions

// Initialize enhanced review system
function initializeEnhancedReviewSystem() {
    console.log('🔧 Initializing enhanced review system...');
    
    // Initialize photo upload functionality
    initializePhotoUpload();
    
    // Initialize bathroom symbol selection
    initializeBathroomSymbols();
    
    // Initialize enhanced star ratings
    initializeEnhancedRatings();
    
    // Initialize form validation
    initializeFormValidation();
    
    console.log('✅ Enhanced review system initialized');
}

// Initialize photo upload functionality
function initializePhotoUpload() {
    const photoUpload = document.getElementById('photoUpload');
    const uploadDropzone = document.querySelector('.upload-dropzone');
    
    if (!photoUpload || !uploadDropzone) {
        console.log('Photo upload elements not found');
        return;
    }
    
    // File input change handler
    photoUpload.addEventListener('change', handleFileSelection);
    
    // Drag and drop handlers
    uploadDropzone.addEventListener('dragover', handleDragOver);
    uploadDropzone.addEventListener('dragleave', handleDragLeave);
    uploadDropzone.addEventListener('drop', handleFileDrop);
    
    // Click handler for dropzone
    uploadDropzone.addEventListener('click', () => {
        photoUpload.click();
    });
    
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

// Initialize form validation
function initializeFormValidation() {
    const reviewForm = document.getElementById('reviewForm');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmission);
    }
    
    console.log('✅ Form validation initialized');
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
    
    // Validate photos if any
    if (selectedPhotos.length > 0) {
        for (const photo of selectedPhotos) {
            if (photo.size > PHOTO_CONFIG.maxFileSize) {
                showNotification(`Photo "${photo.name}" is too large.`, 'warning');
                return false;
            }
        }
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
            // For now, we'll just store the photo data locally
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
        const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].badge = newBadge;
            localStorage.setItem('gtgotg_users', JSON.stringify(users));
        }
    }
}

// Enhanced openReviewModal function
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
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load tab content
    loadAdminTabContent(tabName);
}

function loadAdminTabContent(tabName) {
    switch(tabName) {
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
    
    document.getElementById('totalBusinesses').textContent = sampleBusinesses.length;
    document.getElementById('totalReviews').textContent = reviews.length;
    document.getElementById('totalUsers').textContent = users.length;
    
    const avgRating = sampleBusinesses.reduce((sum, b) => sum + b.ratings.overall, 0) / sampleBusinesses.length;
    document.getElementById('averageRating').textContent = avgRating.toFixed(1);
}

function loadBusinessManagement() {
    const container = document.getElementById('adminBusinessList');
    container.innerHTML = sampleBusinesses.map(business => `
        <div class="admin-item">
            <div class="admin-item-info">
                <h6>${business.name}</h6>
                <p>${business.address} • ${business.reviewCount} reviews</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-small btn-secondary">Edit</button>
                <button class="btn btn-small btn-admin">Delete</button>
            </div>
        </div>
    `).join('');
}

function loadReviewManagement() {
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    const container = document.getElementById('adminReviewList');
    
    container.innerHTML = reviews.map(review => {
        const business = sampleBusinesses.find(b => b.id === review.businessId);
        return `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h6>Review for ${business ? business.name : 'Unknown Business'}</h6>
                    <p>Rating: ${review.ratings.overall}/10 • ${new Date(review.timestamp).toLocaleDateString()}</p>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-small btn-secondary">View</button>
                    <button class="btn btn-small btn-admin">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function loadUserManagement() {
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    const container = document.getElementById('adminUserList');
    
    container.innerHTML = users.map(user => `
        <div class="admin-item">
            <div class="admin-item-info">
                <h6>${user.firstName} ${user.lastName}</h6>
                <p>${user.email} • ${user.badge} • Joined ${new Date(user.joinDate).toLocaleDateString()}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-small btn-secondary">Edit</button>
                <button class="btn btn-small btn-admin">Ban</button>
            </div>
        </div>
    `).join('');
}

// Initialize default test users
function initializeTestUsers() {
    const existingUsers = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    
    if (existingUsers.length === 0) {
        const testUsers = [
            {
                id: 1,
                firstName: 'Test',
                lastName: 'User',
                email: 'user@gtgotg.com',
                password: 'password123',
                badge: 'Reviewer',
                joinDate: new Date().toISOString()
            },
            {
                id: 2,
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@gtgotg.com',
                password: 'admin123',
                badge: 'Expert',
                joinDate: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('gtgotg_users', JSON.stringify(testUsers));
        console.log('✅ Test users initialized');
    }
}

// Initialize test users on load
initializeTestUsers();

console.log('✅ GTGOTG - Loaded successfully!');
