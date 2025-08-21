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

// Geoapify API Configuration (Free tier: 3,000 requests/day)
const GEOAPIFY_CONFIG = {
    apiKey: '596ca8b1ff84488c9edbc26997613168',
    baseUrl: 'https://api.geoapify.com/v2/places',
    geocodeUrl: 'https://api.geoapify.com/v1/geocode',
    searchRadius: 5000, // 5km radius
    maxResults: 50
};

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
    loadNearbyBusinesses();
});

// Setup search input functionality
function setupSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        if (query.length < 2) {
            hideSuggestions();
            return;
        }
        
        // Debounce search
        searchTimeout = setTimeout(() => {
            showSearchSuggestions(query);
        }, 300);
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
    
    // Handle enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

// Show search suggestions
function showSearchSuggestions(query) {
    const suggestions = generateSearchSuggestions(query);
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (!suggestionsContainer || suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsContainer.innerHTML = suggestions.map(suggestion => `
        <div class="search-suggestion" onclick="selectSuggestion('${suggestion.value}')">
            <div class="suggestion-main">${suggestion.main}</div>
            <div class="suggestion-subtitle">${suggestion.subtitle}</div>
        </div>
    `).join('');
    
    suggestionsContainer.style.display = 'block';
}

// Generate search suggestions
function generateSearchSuggestions(query) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();
    
    // Business name suggestions
    const businessNames = ['McDonald\'s', 'Starbucks', 'Shell', 'Walmart', 'Target', 'Subway', 'Dunkin\'', 'CVS'];
    businessNames.forEach(name => {
        if (name.toLowerCase().includes(lowerQuery)) {
            suggestions.push({
                main: name,
                subtitle: 'Find locations nationwide',
                value: name
            });
        }
    });
    
    // ZIP code suggestions
    if (/^\d{1,5}$/.test(query)) {
        suggestions.push({
            main: `ZIP Code ${query}`,
            subtitle: 'Search businesses in this area',
            value: query
        });
    }
    
    // City suggestions
    const cities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
    cities.forEach(city => {
        if (city.toLowerCase().includes(lowerQuery)) {
            suggestions.push({
                main: city,
                subtitle: 'Search businesses in this city',
                value: city
            });
        }
    });
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
}

// Select a suggestion
function selectSuggestion(value) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = value;
        hideSuggestions();
        performSearch();
    }
}

// Hide search suggestions
function hideSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

// Load nearby businesses
function loadNearbyBusinesses() {
    // Check if user is logged in
    checkUserLogin();
    
    // Setup enhanced search
    setupSearchInput();
    
    // Load initial businesses
    loadBusinessesForCurrentView();
    
    console.log('✅ GTGOTG application initialized successfully');
}

// Check if user is logged in
function checkUserLogin() {
    try {
        const userData = localStorage.getItem('gtgotg_user');
        if (userData) {
            currentUser = JSON.parse(userData);
            console.log('✅ User logged in:', currentUser.email);
        } else {
            currentUser = null;
            console.log('ℹ️ No user logged in');
        }
        
        // Update UI based on login status
        if (typeof updateUserStatus === 'function') {
            updateUserStatus();
        }
    } catch (error) {
        console.error('❌ Error checking user login:', error);
        currentUser = null;
    }
}

// Load businesses for current map view
async function loadBusinessesForMapView() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    // Only load if zoomed in enough
    if (zoom < 10) return;
    
    try {
        const businesses = await searchBusinessesInArea(center.lat, center.lng, 5000);
        if (businesses.length > 0) {
            currentBusinesses = [...currentBusinesses, ...businesses];
            // Remove duplicates
            currentBusinesses = currentBusinesses.filter((business, index, self) => 
                index === self.findIndex(b => b.id === business.id)
            );
            renderBusinesses(currentBusinesses);
            addBusinessMarkersToMap(businesses);
        }
    } catch (error) {
        console.error('Error loading businesses for map view:', error);
    }
}

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

// Search for real businesses using Geoapify API
async function searchRealBusinessesGeoapify(lat, lng, radius = 5000, category = '') {
    try {
        const apiKey = '596ca8b1ff84488c9edbc26997613168';
        
        // Map our categories to Geoapify categories
        const categoryMap = {
            'gas-station': 'commercial.fuel',
            'restaurant': 'catering.restaurant',
            'coffee-shop': 'catering.cafe',
            'retail': 'commercial.supermarket',
            'hotel': 'accommodation.hotel',
            'park': 'leisure.park',
            'hospital': 'healthcare.hospital',
            'library': 'education.library'
        };
        
        const geoapifyCategory = categoryMap[category] || 'commercial.supermarket';
        
        // Calculate bounding box around the center point (approximate)
        const latOffset = 0.05; // roughly 5km
        const lngOffset = 0.05;
        const bbox = `${lng - lngOffset},${lat - latOffset},${lng + lngOffset},${lat + latOffset}`;
        
        // Build the API URL using rect filter like your working example
        const url = `https://api.geoapify.com/v2/places?categories=${geoapifyCategory}&filter=rect%3A${encodeURIComponent(bbox)}&limit=20&apiKey=${apiKey}`;
        
        console.log('🔍 Searching Geoapify with URL:', url);
        
        const requestOptions = {
            method: 'GET',
        };
        
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Geoapify API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Geoapify API Response:', data);
        
        if (!data.features || data.features.length === 0) {
            console.log('No businesses found from Geoapify');
            return [];
        }

        // Handle both Places API and Geocoding API responses
        const features = data.features || [];
        
        if (features.length === 0) {
            console.log('No results from Geoapify, using sample data');
            return generateSampleBusinesses(lat, lng);
        }
        
        // Convert Geoapify data to our business format  
        return features.map((feature, index) => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates;
            
            return {
                id: `geoapify_${index}`,
                name: props.name || props.address_line1 || props.formatted || `Business ${index + 1}`,
                category: mapGeoapifyCategory(props.categories?.[0] || 'commercial'),
                address: props.formatted || props.address_line1 || 'Address not available',
                distance: calculateDistance(lat, lng, coords[1], coords[0]),
                coordinates: [coords[1], coords[0]], // Convert from [lon, lat] to [lat, lon]
                ratings: {
                    overall: Math.round((Math.random() * 4 + 6) * 10) / 10,
                    cleanliness: Math.round((Math.random() * 4 + 6) * 10) / 10,
                    safety: Math.round((Math.random() * 4 + 6) * 10) / 10,
                    accessibility: Math.round((Math.random() * 4 + 6) * 10) / 10
                },
                isOpen: true,
                bathroomTypes: ['mens', 'womens'],
                amenities: ['toilet-paper', 'soap'],
                reviewCount: Math.floor(Math.random() * 50) + 1,
                hours: props.opening_hours?.text || 'Hours not available',
                phone: props.contact?.phone || props.phone || 'Phone not available'
            };
        });
        
    } catch (error) {
        console.error('❌ Error fetching from Geoapify:', error);
        
        // Fallback to sample data
        console.log('🔄 Falling back to sample data');
        return generateSampleBusinesses(lat, lng);
    }
}

// Generate sample businesses for fallback
function generateSampleBusinesses(lat, lng) {
    const businessTypes = [
        { name: "McDonald's", category: "restaurant" },
        { name: "Starbucks", category: "coffee-shop" },
        { name: "Shell", category: "gas-station" },
        { name: "Walmart", category: "retail" },
        { name: "CVS Pharmacy", category: "retail" }
    ];
    
    return businessTypes.map((type, index) => ({
        id: `sample_${index}`,
        name: type.name,
        category: type.category,
        address: `${100 + index * 10} Sample St, Sample City, SC 12345`,
        distance: Math.round(Math.random() * 50) / 10,
        coordinates: [lat + (Math.random() - 0.5) * 0.01, lng + (Math.random() - 0.5) * 0.01],
        ratings: {
            overall: Math.round((Math.random() * 4 + 6) * 10) / 10,
            cleanliness: Math.round((Math.random() * 4 + 6) * 10) / 10,
            safety: Math.round((Math.random() * 4 + 6) * 10) / 10,
            accessibility: Math.round((Math.random() * 4 + 6) * 10) / 10
        },
        isOpen: true,
        bathroomTypes: ['mens', 'womens'],
        amenities: ['toilet-paper', 'soap'],
        reviewCount: Math.floor(Math.random() * 50) + 1,
        hours: '9:00 AM - 9:00 PM',
        phone: '(555) 123-4567'
    }));
}

// Map Geoapify categories to our categories
function mapGeoapifyCategory(geoapifyCategory) {
    const categoryMap = {
        'commercial.food_and_drink.restaurant': 'restaurant',
        'commercial.food_and_drink.cafe': 'coffee-shop',
        'commercial.food_and_drink.fast_food': 'restaurant',
        'commercial.shopping': 'retail',
        'commercial.shopping.supermarket': 'retail',
        'accommodation.hotel': 'hotel',
        'healthcare.hospital': 'hospital',
        'public_transport.gas_station': 'gas-station',
        'commercial': 'retail',
        'accommodation': 'hotel',
        'healthcare': 'hospital',
        'entertainment': 'retail',
        'tourism': 'retail'
    };
    
    return categoryMap[geoapifyCategory] || categoryMap[geoapifyCategory?.split('.')[0]] || 'retail';
}

// Convert Geoapify feature to business object
function convertGeoapifyToBusiness(feature) {
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    
    return {
        id: props.place_id || Date.now() + Math.random(),
        name: props.name || props.formatted || 'Unknown Business',
        category: mapGeoapifyCategory(props.categories),
        address: props.formatted || props.address_line1 || 'Address not available',
        phone: props.contact?.phone || generatePhoneNumber(),
        coordinates: [coords[1], coords[0]], // Geoapify uses [lng, lat], we need [lat, lng]
        distance: 0, // Will be calculated later
        hours: props.opening_hours || generateBusinessHours(mapGeoapifyCategory(props.categories)),
        ratings: generateRealisticRatings(),
        reviewCount: Math.floor(Math.random() * 500) + 1,
        amenities: generateRealisticAmenities(mapGeoapifyCategory(props.categories)),
        bathroomTypes: generateRealisticBathroomTypes(),
        isOpen: true, // Could be enhanced with real opening hours
        website: props.contact?.website || null,
        realBusiness: true
    };
}

// Generate realistic businesses for demo (simulates real API data)
function generateRealisticBusinesses(lat, lng, query = '') {
    const businessTypes = [
        { name: "McDonald's", category: "restaurant", chain: true },
        { name: "Burger King", category: "restaurant", chain: true },
        { name: "Subway", category: "restaurant", chain: true },
        { name: "Starbucks", category: "coffee-shop", chain: true },
        { name: "Dunkin'", category: "coffee-shop", chain: true },
        { name: "Shell", category: "gas-station", chain: true },
        { name: "Exxon", category: "gas-station", chain: true },
        { name: "BP", category: "gas-station", chain: true },
        { name: "Walmart", category: "retail", chain: true },
        { name: "Target", category: "retail", chain: true },
        { name: "CVS Pharmacy", category: "retail", chain: true },
        { name: "Walgreens", category: "retail", chain: true },
        { name: "7-Eleven", category: "retail", chain: true },
        { name: "Holiday Inn", category: "hotel", chain: true },
        { name: "Hampton Inn", category: "hotel", chain: true },
        { name: "Local Diner", category: "restaurant", chain: false },
        { name: "Corner Market", category: "retail", chain: false },
        { name: "City Library", category: "library", chain: false },
        { name: "Community Hospital", category: "hospital", chain: false },
        { name: "Central Park", category: "park", chain: false }
    ];
    
    const businesses = [];
    
    // Generate businesses around the location
    for (let i = 0; i < 20; i++) {
        const business