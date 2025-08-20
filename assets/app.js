// GTGOTG - "Got To Go On The Go" Complete Application with Real Business Data via Geoapify
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

// Geoapify API Configuration
const GEOAPIFY_API_KEY = '596ca8b1ff84488c9edbc26997613168';
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1';

// Business category mapping for Geoapify
const BUSINESS_CATEGORIES = {
    'restaurant': 'catering.restaurant,catering.fast_food',
    'gas-station': 'automotive.fuel',
    'coffee-shop': 'catering.cafe',
    'retail': 'commercial.supermarket,commercial.convenience,commercial.department_store',
    'hotel': 'accommodation.hotel',
    'park': 'leisure.park',
    'hospital': 'healthcare.hospital',
    'library': 'education.library'
};

// Sample businesses for fallback when API is not available
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
        isOpen: true,
        website: "https://www.mcdonalds.com"
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
        isOpen: true,
        website: "https://www.shell.com"
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
        isOpen: true,
        website: "https://www.starbucks.com"
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
        isOpen: true,
        website: "https://www.walmart.com"
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
        isOpen: true,
        website: "https://www.target.com"
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
        isOpen: true,
        website: "https://www.subway.com"
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
        isOpen: true,
        website: "https://www.dunkindonuts.com"
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
        isOpen: true,
        website: "https://www.cvs.com"
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing GTGOTG application...');
    
    initializeMap();
    initializeSearch();
    initializeFilters();
    checkUserLogin();
    
    // Load initial businesses
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
    
    const center = map.getCenter();
    
    console.log('🔍 Loading businesses for current map view...');
    
    try {
        // Try to get real businesses from Geoapify
        const businesses = await searchRealBusinessesGeoapify(center.lat, center.lng);
        
        if (businesses && businesses.length > 0) {
            currentBusinesses = businesses;
            renderBusinesses(businesses);
            addBusinessMarkersToMap(businesses);
            updateSearchResultsInfo('', businesses.length);
        } else {
            // Fallback to sample data
            console.log('📋 Using sample business data');
            loadSampleBusinesses();
        }
    } catch (error) {
        console.error('❌ Error loading businesses:', error);
        // Fallback to sample data
        loadSampleBusinesses();
    }
}

// Search for real businesses using Geoapify Places API
async function searchRealBusinessesGeoapify(query, lat = null, lon = null) {
    console.log(`🔍 Searching Geoapify for: ${query}`);
    
    try {
        // First, try to geocode the search query to get coordinates
        let searchLat = lat || 40.7128; // Default to NYC
        let searchLon = lon || -74.0060;
        
        // If query looks like an address/location, geocode it first
        if (query.match(/\d{5}/) || query.includes(',') || query.toLowerCase().includes('street') || query.toLowerCase().includes('avenue')) {
            const geocodeUrl = `${GEOAPIFY_BASE_URL}/geocode/search?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}`;
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();
            
            if (geocodeData.features && geocodeData.features.length > 0) {
                const coords = geocodeData.features[0].geometry.coordinates;
                searchLon = coords[0];
                searchLat = coords[1];
                console.log(`📍 Geocoded "${query}" to: ${searchLat}, ${searchLon}`);
            }
        }
        
        // Search for places around the coordinates
        const placesUrl = `${GEOAPIFY_BASE_URL}/places?categories=commercial,catering,accommodation,healthcare,education,entertainment,service&filter=circle:${searchLon},${searchLat},10000&text=${encodeURIComponent(query)}&limit=50&apiKey=${GEOAPIFY_API_KEY}`;
        
        const response = await fetch(placesUrl);
        const data = await response.json();
        
        console.log('🌐 Geoapify response:', data);
        
        if (data.features && data.features.length > 0) {
            const businesses = data.features.map(feature => convertGeoapifyToBusiness(feature));
            console.log(`✅ Found ${businesses.length} real businesses`);
            return businesses;
        }
        
        // If no results from API, fall back to sample data
        console.log('⚠️ No results from Geoapify, using sample data');
        return searchSampleBusinesses(query);
        
    } catch (error) {
        console.error('Error searching Geoapify:', error);
        // Fall back to sample data on error
        return searchSampleBusinesses(query);
    }
}

// Search sample businesses as fallback
function searchSampleBusinesses(query) {
    return sampleBusinesses.filter(business => 
        business.name.toLowerCase().includes(query.toLowerCase()) ||
        business.address.toLowerCase().includes(query.toLowerCase()) ||
        business.category.toLowerCase().includes(query.toLowerCase())
    );
}

// Convert Geoapify feature to business object
function convertGeoapifyToBusiness(feature) {
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    
    return {
        id: props.place_id || `geoapify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: props.name || props.address_line1 || 'Business',
        category: mapGeoapifyCategory(props.categories || []),
        address: formatGeoapifyAddress(props),
        phone: props.datasource?.raw?.phone || props.contact?.phone || '(555) 000-0000',
        hours: formatGeoapifyHours(props.opening_hours),
        lat: coords[1],
        lng: coords[0],
        ratings: {
            overall: generateRandomRating(),
            cleanliness: generateRandomRating(),
            safety: generateRandomRating(),
            accessibility: generateRandomRating()
        },
        reviewCount: Math.floor(Math.random() * 100) + 1,
        amenities: generateRandomAmenities(),
        bathroomTypes: generateBathroomTypes(props.categories || [])
    };
}

// Format Geoapify address
function formatGeoapifyAddress(props) {
    const parts = [];
    if (props.housenumber) parts.push(props.housenumber);
    if (props.street) parts.push(props.street);
    if (props.city) parts.push(props.city);
    if (props.state) parts.push(props.state);
    if (props.postcode) parts.push(props.postcode);
    
    return parts.length > 0 ? parts.join(', ') : (props.formatted || 'Address not available');
}

// Format Geoapify hours
function formatGeoapifyHours(hours) {
    if (!hours) return 'Hours not available';
    if (typeof hours === 'string') return hours;
    if (hours.open_now !== undefined) {
        return hours.open_now ? 'Open now' : 'Closed now';
    }
    return 'Hours not available';
}

// Generate random rating between 6-10
function generateRandomRating() {
    return Math.round((Math.random() * 4 + 6) * 10) / 10; // 6.0 to 10.0
}

// Generate random amenities
function generateRandomAmenities() {
    const allAmenities = ['toilet-paper', 'soap', 'paper-towels', 'hand-dryer', 'baby-changing', 'ada-compliant'];
    const count = Math.floor(Math.random() * 4) + 2; // 2-5 amenities
    return allAmenities.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Generate bathroom types based on business category
function generateBathroomTypes(categories) {
    const types = ['mens', 'womens'];
    
    // Add neutral for certain business types
    if (categories.some(cat => cat.includes('coffee') || cat.includes('restaurant') || cat.includes('retail'))) {
        if (Math.random() > 0.3) types.push('neutral');
    }
    
    // Add accessible for larger businesses
    if (categories.some(cat => cat.includes('commercial') || cat.includes('shopping'))) {
        if (Math.random() > 0.2) types.push('accessible');
    }
    
    return types;
}

// Map Geoapify categories to our categories
function mapGeoapifyCategory(categories) {
    if (!categories || !Array.isArray(categories)) return 'retail';
    
    // Map common Geoapify categories to our system
    for (const category of categories) {
        if (category.includes('food') || category.includes('restaurant') || category.includes('eating')) return 'restaurant';
        if (category.includes('coffee') || category.includes('cafe')) return 'coffee-shop';
        if (category.includes('fuel') || category.includes('gas') || category.includes('petrol')) return 'gas-station';
        if (category.includes('shopping') || category.includes('retail') || category.includes('store')) return 'retail';
        if (category.includes('accommodation') || category.includes('hotel') || category.includes('lodging')) return 'hotel';
        if (category.includes('healthcare') || category.includes('hospital') || category.includes('medical')) return 'hospital';
        if (category.includes('education') || category.includes('library')) return 'library';
        if (category.includes('park') || category.includes('recreation')) return 'park';
    }
    
    return 'retail'; // Default category
}

// Enhanced search with ZIP code support
async function performEnhancedSearch(query) {
    console.log(`🔍 Enhanced search for: "${query}"`);
    
    try {
        // Check if query is a ZIP code (5 digits)
        const zipMatch = query.match(/\b\d{5}\b/);
        if (zipMatch) {
            const zipCode = zipMatch[0];
            console.log(`📮 ZIP code detected: ${zipCode}`);
            
            // First geocode the ZIP code to get coordinates
            const geocodeUrl = `${GEOAPIFY_BASE_URL}/geocode/search?text=${zipCode}&type=postcode&apiKey=${GEOAPIFY_API_KEY}`;
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();
            
            if (geocodeData.features && geocodeData.features.length > 0) {
                const coords = geocodeData.features[0].geometry.coordinates;
                const lat = coords[1];
                const lng = coords[0];
                
                // Center map on ZIP code
                map.setView([lat, lng], 13);
                
                // Search for businesses in this ZIP code
                return await searchBusinessesInArea(lat, lng, 5000); // 5km radius
            }
        }
        
        // Regular business/location search
        return await searchRealBusinessesGeoapify(query);
        
    } catch (error) {
        console.error('Enhanced search error:', error);
        return searchSampleBusinesses(query);
    }
}

// Search businesses in a specific area
async function searchBusinessesInArea(lat, lng, radius = 5000) {
    try {
        const placesUrl = `${GEOAPIFY_BASE_URL}/places?categories=commercial,catering,accommodation,healthcare,education,entertainment,service&filter=circle:${lng},${lat},${radius}&limit=50&apiKey=${GEOAPIFY_API_KEY}`;
        
        const response = await fetch(placesUrl);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            return data.features.map(feature => convertGeoapifyToBusiness(feature));
        }
        
        return [];
        
    } catch (error) {
        console.error('Error searching businesses in area:', error);
        return [];
    }
}

// Enhanced performSearch function
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    console.log(`🔍 Performing search for: "${query}"`);
    
    // Show loading state
    const resultsInfo = document.getElementById('searchResultsInfo');
    resultsInfo.textContent = 'Searching...';
    
    try {
        // Use enhanced search with real API
        const businesses = await performEnhancedSearch(query);
        
        if (businesses.length > 0) {
            currentBusinesses = businesses;
            renderBusinesses(businesses);
            addBusinessMarkersToMap(businesses);
            resultsInfo.textContent = `Found ${businesses.length} restroom locations for "${query}"`;
            
            // Center map on first result if available
            if (businesses[0]) {
                map.setView([businesses[0].lat, businesses[0].lng], 12);
            }
        } else {
            currentBusinesses = [];
            renderBusinesses([]);
            clearMapMarkers();
            resultsInfo.textContent = `No restroom locations found for "${query}". Try a different search term.`;
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search error. Please try again.', 'error');
        resultsInfo.textContent = 'Search error. Please try again.';
    }
}

// Enhanced getCurrentLocation with real business search
async function getCurrentLocation() {
    console.log('📍 Getting current location...');
    
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser', 'error');
        return;
    }
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
    };
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            console.log(`📍 Location found: ${lat}, ${lng}`);
            
            // Center map on user location
            map.setView([lat, lng], 14);
            
            // Add user location marker
            if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
            }
            
            userLocationMarker = L.marker([lat, lng], {
                icon: L.div