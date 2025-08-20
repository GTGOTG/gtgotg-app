// GTGOTG - "Got To Go On The Go" Complete Application with Real Business Data
// Copyright © 2025 Jessica Esposito / Colorado Quality LLC. All rights reserved.

console.log('🚽 GTGOTG - Got To Go On The Go - Loading...');

// Global Variables
let map;
let userLocation = null;
let currentUser = null;
let currentBusinesses = [];
let currentBusinessForReview = null;
let businessMarkers = [];
let activeFilters = {
    category: '',
    distance: '',
    rating: '',
    quickFilters: []
};

// Real business search configuration
const BUSINESS_SEARCH_CONFIG = {
    overpassUrl: 'https://overpass-api.de/api/interpreter',
    searchRadius: 5000, // 5km radius
    maxResults: 50
};

// Business category mapping for Overpass API
const BUSINESS_CATEGORIES = {
    'restaurant': ['restaurant', 'fast_food', 'cafe'],
    'gas-station': ['fuel'],
    'coffee-shop': ['cafe'],
    'retail': ['supermarket', 'convenience', 'department_store'],
    'hotel': ['hotel', 'motel'],
    'park': ['park'],
    'hospital': ['hospital', 'clinic'],
    'library': ['library']
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing GTGOTG application...');
    
    initializeMap();
    initializeSearch();
    initializeFilters();
    checkUserLogin();
    
    // Load initial businesses for current view
    loadBusinessesForCurrentView();
    
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
        
        // Add map event listeners
        map.on('moveend', function() {
            loadBusinessesForCurrentView();
        });
        
        map.on('zoomend', function() {
            loadBusinessesForCurrentView();
        });
        
        console.log('✅ Map initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing map:', error);
        showNotification('Map failed to load. Please refresh the page.', 'error');
    }
}

// Load businesses for current map view
async function loadBusinessesForCurrentView() {
    if (!map) return;
    
    const bounds = map.getBounds();
    const center = map.getCenter();
    
    console.log('🔍 Loading businesses for current map view...');
    
    try {
        const businesses = await searchRealBusinesses(center.lat, center.lng, BUSINESS_SEARCH_CONFIG.searchRadius);
        currentBusinesses = businesses;
        renderBusinesses(businesses);
        addBusinessMarkersToMap(businesses);
        updateSearchResultsInfo('', businesses.length);
    } catch (error) {
        console.error('❌ Error loading businesses:', error);
        // Fallback to sample data if API fails
        loadSampleBusinesses();
    }
}

// Search real businesses using Overpass API
async function searchRealBusinesses(lat, lng, radius) {
    console.log(`🌐 Searching real businesses near ${lat}, ${lng} within ${radius}m...`);
    
    // Build Overpass query for various business types
    const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"^(restaurant|fast_food|cafe|fuel|hospital|library)$"](around:${radius},${lat},${lng});
          node["shop"~"^(supermarket|convenience|department_store)$"](around:${radius},${lat},${lng});
          node["tourism"~"^(hotel|motel)$"](around:${radius},${lat},${lng});
          node["leisure"="park"](around:${radius},${lat},${lng});
        );
        out geom;
    `;
    
    try {
        const response = await fetch(BUSINESS_SEARCH_CONFIG.overpassUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(query)}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`📊 Found ${data.elements.length} real businesses`);
        
        return data.elements.map(element => convertOverpassToBusiness(element)).filter(Boolean);
        
    } catch (error) {
        console.error('❌ Error fetching real business data:', error);
        throw error;
    }
}

// Convert Overpass API data to business format
function convertOverpassToBusiness(element) {
    if (!element.tags || !element.tags.name) return null;
    
    const tags = element.tags;
    const category = determineBusinessCategory(tags);
    
    return {
        id: element.id,
        name: tags.name,
        category: category,
        address: formatAddress(tags),
        phone: tags.phone || tags['contact:phone'] || '(555) 000-0000',
        coordinates: [element.lat, element.lon],
        distance: 0, // Will be calculated based on user location
        hours: tags.opening_hours || tags['opening_hours:covid19'] || 'Hours vary',
        ratings: generateRandomRatings(), // In real app, this would come from your database
        reviewCount: Math.floor(Math.random() * 200) + 1,
        amenities: generateRandomAmenities(),
        bathroomTypes: generateRandomBathroomTypes(),
        isOpen: isBusinessOpen(tags.opening_hours),
        website: tags.website || tags['contact:website'] || null,
        realBusiness: true
    };
}

// Determine business category from OSM tags
function determineBusinessCategory(tags) {
    if (tags.amenity) {
        switch (tags.amenity) {
            case 'restaurant':
            case 'fast_food': return 'restaurant';
            case 'cafe': return 'coffee-shop';
            case 'fuel': return 'gas-station';
            case 'hospital': return 'hospital';
            case 'library': return 'library';
        }
    }
    
    if (tags.shop) {
        switch (tags.shop) {
            case 'supermarket':
            case 'convenience':
            case 'department_store': return 'retail';
        }
    }
    
    if (tags.tourism) {
        switch (tags.tourism) {
            case 'hotel':
            case 'motel': return 'hotel';
        }
    }
    
    if (tags.leisure === 'park') return 'park';
    
    return 'other';
}

// Format address from OSM tags
function formatAddress(tags) {
    const parts = [];
    
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    
    return parts.length > 0 ? parts.join(' ') : 'Address not available';
}

// Generate random ratings for demo (in real app, this would come from your database)
function generateRandomRatings() {
    return {
        overall: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6.0-10.0
        cleanliness: Math.round((Math.random() * 4 + 6) * 10) / 10,
        safety: Math.round((Math.random() * 4 + 6) * 10) / 10,
        accessibility: Math.round((Math.random() * 4 + 6) * 10) / 10
    };
}

// Generate random amenities for demo
function generateRandomAmenities() {
    const allAmenities = ['toilet-paper', 'soap', 'paper-towels', 'hand-dryer', 'baby-changing', 'ada-compliant'];
    const count = Math.floor(Math.random() * 4) + 2; // 2-5 amenities
    return allAmenities.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Generate random bathroom types
function generateRandomBathroomTypes() {
    const types = ['mens', 'womens'];
    if (Math.random() > 0.3) types.push('accessible');
    if (Math.random() > 0.7) types.push('neutral');
    return types;
}

// Check if business is open (simplified)
function isBusinessOpen(openingHours) {
    if (!openingHours) return true; // Assume open if no hours specified
    if (openingHours.includes('24/7') || openingHours.includes('24 hours')) return true;
    return Math.random() > 0.2; // 80% chance of being open for demo
}

// Search businesses by name or location
async function searchBusinessesByQuery(query) {
    console.log(`🔍 Searching for: "${query}"`);
    
    if (!query || query.length < 2) {
        loadBusinessesForCurrentView();
        return;
    }
    
    try {
        // First try to geocode the query to get coordinates
        const geocodeResult = await geocodeQuery(query);
        
        if (geocodeResult) {
            // Move map to the geocoded location
            map.setView([geocodeResult.lat, geocodeResult.lng], 14);
            
            // Search for businesses around that location
            const businesses = await searchRealBusinesses(geocodeResult.lat, geocodeResult.lng, BUSINESS_SEARCH_CONFIG.searchRadius);
            currentBusinesses = businesses;
            renderBusinesses(businesses);
            addBusinessMarkersToMap(businesses);
            updateSearchResultsInfo(query, businesses.length);
        } else {
            // If geocoding fails, search current businesses by name
            const filteredBusinesses = currentBusinesses.filter(business => 
                business.name.toLowerCase().includes(query.toLowerCase()) ||
                business.address.toLowerCase().includes(query.toLowerCase())
            );
            
            renderBusinesses(filteredBusinesses);
            updateSearchResultsInfo(query, filteredBusinesses.length);
        }
        
    } catch (error) {
        console.error('❌ Error searching businesses:', error);
        showNotification('Search failed. Please try again.', 'error');
    }
}

// Geocode query using Nominatim (OpenStreetMap's geocoding service)
async function geocodeQuery(query) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=us`;
    
    try {
        const response = await fetch(nominatimUrl);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        }
        
        return null;
    } catch (error) {
        console.error('❌ Geocoding error:', error);
        return null;
    }
}

// Load sample businesses as fallback
function loadSampleBusinesses() {
    const sampleBusinesses = [
        {
            id: 1,
            name: "McDonald's",
            category: "restaurant",
            address: "123 Main St, New York, NY 10001",
            phone: "(555) 123-4567",
            coordinates: [40.7128, -74.0060],
            distance: 0.3,
            hours: "6:00 AM - 11:00 PM",
            ratings: { overall: 7.2, cleanliness: 6.8, safety: 7.5, accessibility: 8.2 },
            reviewCount: 124,
            amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing"],
            bathroomTypes: ["mens", "womens", "accessible"],
            isOpen: true
        },
        {
            id: 2,
            name: "Shell Gas Station",
            category: "gas-station",
            address: "456 Highway Blvd, New York, NY 10002",
            phone: "(555) 234-5678",
            coordinates: [40.7589, -73.9851],
            distance: 1.2,
            hours: "24 Hours",
            ratings: { overall: 6.4, cleanliness: 5.8, safety: 6.9, accessibility: 7.1 },
            reviewCount: 89,
            amenities: ["toilet-paper", "soap", "hand-dryer", "ada-compliant"],
            bathroomTypes: ["neutral", "accessible"],
            isOpen: true
        },
        {
            id: 3,
            name: "Starbucks Coffee",
            category: "coffee-shop",
            address: "789 Oak Avenue, New York, NY 10003",
            phone: "(555) 345-6789",
            coordinates: [40.7505, -73.9934],
            distance: 0.8,
            hours: "5:00 AM - 10:00 PM",
            ratings: { overall: 8.7, cleanliness: 9.1, safety: 8.4, accessibility: 8.9 },
            reviewCount: 203,
            amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
            bathroomTypes: ["mens", "womens", "accessible"],
            isOpen: true
        },
        {
            id: 4,
            name: "Walmart Supercenter",
            category: "retail",
            address: "321 Commerce Drive, New York, NY 10004",
            phone: "(555) 456-7890",
            coordinates: [40.7282, -74.0776],
            distance: 2.1,
            hours: "6:00 AM - 11:00 PM",
            ratings: { overall: 7.8, cleanliness: 7.5, safety: 8.1, accessibility: 9.2 },
            reviewCount: 156,
            amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
            bathroomTypes: ["mens", "womens", "accessible"],
            isOpen: true
        },
        {
            id: 5,
            name: "Target",
            category: "retail",
            address: "654 Shopping Plaza, New York, NY 10005",
            phone: "(555) 567-8901",
            coordinates: [40.7614, -73.9776],
            distance: 1.7,
            hours: "8:00 AM - 10:00 PM",
            ratings: { overall: 8.3, cleanliness: 8.7, safety: 8.0, accessibility: 9.1 },
            reviewCount: 178,
            amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer", "baby-changing", "ada-compliant"],
            bathroomTypes: ["mens", "womens", "accessible"],
            isOpen: true
        },
        {
            id: 6,
            name: "Subway",
            category: "restaurant",
            address: "987 Food Court Way, New York, NY 10006",
            phone: "(555) 678-9012",
            coordinates: [40.7505, -74.0014],
            distance: 0.6,
            hours: "7:00 AM - 10:00 PM",
            ratings: { overall: 6.9, cleanliness: 6.5, safety: 7.2, accessibility: 7.8 },
            reviewCount: 67,
            amenities: ["toilet-paper", "soap", "hand-dryer"],
            bathroomTypes: ["neutral"],
            isOpen: true
        },
        {
            id: 7,
            name: "Dunkin' Donuts",
            category: "coffee-shop",
            address: "147 Morning Street, New York, NY 10007",
            phone: "(555) 789-0123",
            coordinates: [40.7392, -74.0020],
            distance: 1.1,
            hours: "5:00 AM - 9:00 PM",
            ratings: { overall: 7.6, cleanliness: 7.8, safety: 7.4, accessibility: 7.9 },
            reviewCount: 92,
            amenities: ["toilet-paper", "soap", "paper-towels", "hand-dryer"],
            bathroomTypes: ["mens", "womens"],
            isOpen: true
        },
        {
            id: 8,
            name: "CVS Pharmacy",
            category: "retail",
            address: "258 Health Plaza, New York, NY 10008",
            phone: "(555) 890-1234",
            coordinates: [40.7451, -73.9903],
            distance: 1.4,
            hours: "8:00 AM - 10:00 PM",
            ratings: { overall: 7.1, cleanliness: 7.3, safety: 6.9, accessibility: 8.5 },
            reviewCount: 45,
            amenities: ["toilet-paper", "soap", "hand-dryer", "ada-compliant"],
            bathroomTypes: ["neutral", "accessible"],
            isOpen: true
        }
    ];
    
    currentBusinesses = sampleBusinesses;
    renderBusinesses(sampleBusinesses);
    addBusinessMarkersToMap(sampleBusinesses);
}

// Add business markers to map
function addBusinessMarkersToMap(businesses) {
    if (!map) return;
    
    // Clear existing markers
    businessMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    businessMarkers = [];
    
    // Add new markers
    businesses.forEach(business => {
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
        businessMarkers.push(marker);
    });
    
    console.log(`📍 Added ${businesses.length} business markers to map`);
}

// Generate star display for 10-point ratings
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
        if (searchInput && searchSuggestions && 
            !searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
}

// Handle search input with real-time suggestions
async function handleSearchInput(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    // Show suggestions from current businesses
    const suggestions = currentBusinesses.filter(business => 
        business.name.toLowerCase().includes(query) ||
        business.address.toLowerCase().includes(query) ||
        business.category.toLowerCase().includes(query)
    ).slice(0, 5);
    
    // Also try to get location suggestions
    try {
        const locationSuggestions = await getLocationSuggestions(query);
        showSuggestions([...suggestions, ...locationSuggestions]);
    } catch (error) {
        showSuggestions(suggestions);
    }
}

// Get location suggestions from Nominatim
async function getLocationSuggestions(query) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3&countrycodes=us`;
    
    try {
        const response = await fetch(nominatimUrl);
        const data = await response.json();
        
        return data.map(item => ({
            name: item.display_name.split(',')[0],
            address: item.display_name,
            coordinates: [parseFloat(item.lat), parseFloat(item.lon)],
            isLocation: true
        }));
    } catch (error) {
        console.error('❌ Error getting location suggestions:', error);
        return [];
    }
}

// Show search suggestions
function showSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) return;
    
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsContainer.innerHTML = suggestions.map(item => {
        if (item.isLocation) {
            return `
                <div class="search-suggestion" onclick="selectLocationSuggestion(${item.coordinates[0]}, ${item.coordinates[1]}, '${item.name}')">
                    <div class="suggestion-main">📍 ${item.name}</div>
                    <div class="suggestion-subtitle">${item.address}</div>
                </div>
            `;
        } else {
            return `
                <div class="search-suggestion" onclick="selectBusinessSuggestion('${item.name}')">
                    <div class="suggestion-main">${item.name}</div>
                    <div class="suggestion-subtitle">${item.address} • ${item.distance} mi</div>
                </div>
            `;
        }
    }).join('');
    
    suggestionsContainer.style.display = 'block';
}

// Hide search suggestions
function hideSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

// Select a business suggestion
function selectBusinessSuggestion(businessName) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = businessName;
    }
    hideSuggestions();
    performSearch();
}

// Select a location suggestion
async function selectLocationSuggestion(lat, lng, name) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = name;
    }
    hideSuggestions();
    
    // Move map to location and search for businesses
    map.setView([lat, lng], 14);
    
    try {
        const businesses = await searchRealBusinesses(lat, lng, BUSINESS_SEARCH_CONFIG.searchRadius);
        currentBusinesses = businesses;
        renderBusinesses(businesses);
        addBusinessMarkersToMap(businesses);
        updateSearchResultsInfo(name, businesses.length);
    } catch (error) {
        console.error('❌ Error loading businesses for location:', error);
        loadSampleBusinesses();
    }
}

// Perform search
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    console.log(`🔍 Performing search for: "${query}"`);
    
    if (!query) {
        loadBusinessesForCurrentView();
        return;
    }
    
    await searchBusinessesByQuery(query);
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
    addBusinessMarkersToMap(filteredBusinesses);
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
        grid.innerHTML = '<div class="no-results">No restrooms found matching your criteria. Try adjusting your filters or searching a different area.</div>';
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
        async function(position) {
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
            
            // Load businesses for new location
            try {
                const businesses = await searchRealBusinesses(userLocation.lat, userLocation.lng, BUSINESS_SEARCH_CONFIG.searchRadius);
                currentBusinesses = businesses;
                renderBusinesses(businesses);
                addBusinessMarkersToMap(businesses);
                updateBusinessDistances();
            } catch (error) {
                console.error('❌ Error loading businesses for location:', error);
                loadSampleBusinesses();
                updateBusinessDistances();
            }
            
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
    
    currentBusinesses.forEach(business => {
        business.distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            business.coordinates[0], business.coordinates[1]
        );
    });
    
    // Sort by distance
    currentBusinesses.sort((a, b) => a.distance - b.distance);
    
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
    return parseFloat((R * c).toFixed(1));
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
    const business = currentBusinesses.find(b => b.id === businessId);
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
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load tab content
    if (tabName === 'analytics') {
        loadAnalytics();
    }
}

function loadAnalytics() {
    const reviews = JSON.parse(localStorage.getItem('gtgotg_reviews') || '[]');
    const users = JSON.parse(localStorage.getItem('gtgotg_users') || '[]');
    
    const totalBusinessesEl = document.getElementById('totalBusinesses');
    const totalReviewsEl = document.getElementById('totalReviews');
    const totalUsersEl = document.getElementById('totalUsers');
    const averageRatingEl = document.getElementById('averageRating');
    
    if (totalBusinessesEl) totalBusinessesEl.textContent = currentBusinesses.length;
    if (totalReviewsEl) totalReviewsEl.textContent = reviews.length;
    if (totalUsersEl) totalUsersEl.textContent = users.length;
    
    if (averageRatingEl && currentBusinesses.length > 0) {
        const avgRating = currentBusinesses.reduce((sum, b) => sum + b.ratings.overall, 0) / currentBusinesses.length;
        averageRatingEl.textContent = avgRating.toFixed(1);
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
window.selectBusinessSuggestion = selectBusinessSuggestion;
window.selectLocationSuggestion = selectLocationSuggestion;

console.log('✅ GTGOTG - Got To Go On The Go - Loaded successfully!');