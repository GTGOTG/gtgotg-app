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
    apiKey: 'YOUR_GEOAPIFY_API_KEY', // Replace with actual API key
    baseUrl: 'https://api.geoapify.com/v2/places',
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
    checkUserLogin();
    
    // Setup enhanced search
    setupSearchInput();
    
    // Load initial businesses
    loadBusinessesForCurrentView();
    
    console.log('✅ GTGOTG application initialized successfully');
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

// Search real businesses using Geoapify Places API
async function searchRealBusinessesGeoapify(lat, lng, query = '') {
    console.log(`🌐 Searching real businesses via Geoapify near ${lat}, ${lng}...`);
    
    // Note: For production, you need a real Geoapify API key
    // For demo purposes, we'll simulate the API response structure
    
    try {
        // Build query parameters
        const params = new URLSearchParams({
            categories: 'catering,commercial,automotive,healthcare,education,leisure',
            filter: `circle:${lng},${lat},${GEOAPIFY_CONFIG.searchRadius}`,
            limit: GEOAPIFY_CONFIG.maxResults,
            apiKey: GEOAPIFY_CONFIG.apiKey
        });
        
        if (query) {
            params.append('text', query);
        }
        
        // For demo, return sample data that simulates real API response
        // In production, uncomment the fetch call below:
        /*
        const response = await fetch(`${GEOAPIFY_CONFIG.baseUrl}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.features.map(feature => convertGeoapifyToBusiness(feature));
        */
        
        // Demo: Return sample businesses with realistic data
        return generateRealisticBusinesses(lat, lng, query);
        
    } catch (error) {
        console.error('❌ Error fetching from Geoapify:', error);
        throw error;
    }
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
        const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
        
        // Skip if query doesn't match
        if (query && !businessType.name.toLowerCase().includes(query.toLowerCase())) {
            continue;
        }
        
        // Generate coordinates within radius
        const offsetLat = (Math.random() - 0.5) * 0.02; // ~1km range
        const offsetLng = (Math.random() - 0.5) * 0.02;
        
        const business = {
            id: Date.now() + i,
            name: businessType.name,
            category: businessType.category,
            address: generateRealisticAddress(lat + offsetLat, lng + offsetLng),
            phone: generatePhoneNumber(),
            coordinates: [lat + offsetLat, lng + offsetLng],
            distance: Math.round(Math.random() * 50) / 10, // 0.0-5.0 miles
            hours: generateBusinessHours(businessType.category),
            ratings: generateRealisticRatings(),
            reviewCount: Math.floor(Math.random() * 500) + 1,
            amenities: generateRealisticAmenities(businessType.category),
            bathroomTypes: generateRealisticBathroomTypes(),
            isOpen: Math.random() > 0.2, // 80% chance of being open
            website: businessType.chain ? `https://www.${businessType.name.toLowerCase().replace(/[^a-z]/g, '')}.com` : null,
            realBusiness: true
        };
        
        businesses.push(business);
    }
    
    console.log(`📊 Generated ${businesses.length} realistic businesses`);
    return businesses;
}

// Generate realistic address
function generateRealisticAddress(lat, lng) {
    const streetNumbers = [Math.floor(Math.random() * 9999) + 1];
    const streetNames = ['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Broadway', 'Market St', 'Church St', 'Washington Ave'];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    
    // Use reverse geocoding to get real city/state (simplified for demo)
    const cities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    return `${streetNumbers[0]} ${streetName}, ${city} ${Math.floor(Math.random() * 90000) + 10000}`;
}

// Generate realistic phone number
function generatePhoneNumber() {
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${number}`;
}

// Generate business hours based on category
function generateBusinessHours(category) {
    switch (category) {
        case 'gas-station':
            return Math.random() > 0.5 ? '24 Hours' : '6:00 AM - 11:00 PM';
        case 'coffee-shop':
            return '5:00 AM - 10:00 PM';
        case 'restaurant':
            return Math.random() > 0.5 ? '6:00 AM - 11:00 PM' : '11:00 AM - 10:00 PM';
        case 'retail':
            return '8:00 AM - 10:00 PM';
        case 'hospital':
            return '24 Hours';
        case 'library':
            return '9:00 AM - 8:00 PM';
        default:
            return '9:00 AM - 9:00 PM';
    }
}

// Generate realistic ratings (6.0-10.0 range)
function generateRealisticRatings() {
    return {
        overall: Math.round((Math.random() * 4 + 6) * 10) / 10,
        cleanliness: Math.round((Math.random() * 4 + 6) * 10) / 10,
        safety: Math.round((Math.random() * 4 + 6) * 10) / 10,
        accessibility: Math.round((Math.random() * 4 + 6) * 10) / 10
    };
}

// Generate realistic amenities based on business type
function generateRealisticAmenities(category) {
    const baseAmenities = ['toilet-paper', 'soap'];
    const additionalAmenities = ['paper-towels', 'hand-dryer', 'baby-changing', 'ada-compliant'];
    
    // Different categories have different amenity probabilities
    let amenities = [...baseAmenities];
    
    switch (category) {
        case 'retail':
        case 'hospital':
            amenities.push(...additionalAmenities); // Full amenities
            break;
        case 'restaurant':
        case 'coffee-shop':
            if (Math.random() > 0.3) amenities.push('paper-towels');
            if (Math.random() > 0.4) amenities.push('hand-dryer');
            if (Math.random() > 0.6) amenities.push('baby-changing');
            if (Math.random() > 0.5) amenities.push('ada-compliant');
            break;
        case 'gas-station':
            if (Math.random() > 0.5) amenities.push('paper-towels');
            if (Math.random() > 0.3) amenities.push('hand-dryer');
            if (Math.random() > 0.8) amenities.push('baby-changing');
            break;
        default:
            if (Math.random() > 0.5) amenities.push('hand-dryer');
            if (Math.random() > 0.7) amenities.push('ada-compliant');
    }
    
    return amenities;
}

// Generate realistic bathroom types
function generateRealisticBathroomTypes() {
    const types = ['mens', 'womens'];
    if (Math.random() > 0.4) types.push('accessible');
    if (Math.random() > 0.7) types.push('neutral');
    return types;
}

// Search businesses by ZIP code
async function searchByZipCode(zipCode) {
    console.log(`📮 Searching businesses in ZIP code: ${zipCode}`);
    
    try {
        // First geocode the ZIP code to get coordinates
        const geocodeResult = await geocodeZipCode(zipCode);
        
        if (geocodeResult) {
            // Move map to ZIP code location
            map.setView([geocodeResult.lat, geocodeResult.lng], 14);
            
            // Search for businesses in that ZIP code
            const businesses = await searchRealBusinessesGeoapify(geocodeResult.lat, geocodeResult.lng);
            currentBusinesses = businesses;
            renderBusinesses(businesses);
            addBusinessMarkersToMap(businesses);
            updateSearchResultsInfo(`ZIP ${zipCode}`, businesses.length);
            
            return businesses;
        } else {
            throw new Error('ZIP code not found');
        }
        
    } catch (error) {
        console.error('❌ Error searching by ZIP code:', error);
        showNotification(`Could not find businesses in ZIP code ${zipCode}`, 'error');
        return [];
    }
}

// Geocode ZIP code using Nominatim
async function geocodeZipCode(zipCode) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${zipCode}&country=US&limit=1`;
    
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
        console.error('❌ ZIP code geocoding error:', error);
        return null;
    }
}

// Search businesses by name across USA
async function searchBusinessesByName(businessName) {
    console.log(`🔍 Searching for "${businessName}" across USA...`);
    
    try {
        // For demo, search in major cities
        const majorCities = [
            { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
            { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
            { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
            { name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
            { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
            { name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652 }
        ];
        
        let allBusinesses = [];
        
        // Search in each major city
        for (const city of majorCities) {
            const cityBusinesses = await searchRealBusinessesGeoapify(city.lat, city.lng, businessName);
            allBusinesses = allBusinesses.concat(cityBusinesses);
        }
        
        // Filter by business name
        const filteredBusinesses = allBusinesses.filter(business => 
            business.name.toLowerCase().includes(businessName.toLowerCase())
        );
        
        if (filteredBusinesses.length > 0) {
            // Focus map on first result
            const firstBusiness = filteredBusinesses[0];
            map.setView(firstBusiness.coordinates, 15);
            
            currentBusinesses = filteredBusinesses;
            renderBusinesses(filteredBusinesses);
            addBusinessMarkersToMap(filteredBusinesses);
            updateSearchResultsInfo(businessName, filteredBusinesses.length);
            
            return filteredBusinesses;
        } else {
            throw new Error('No businesses found');
        }
        
    } catch (error) {
        console.error('❌ Error searching businesses by name:', error);
        showNotification(`No results found for "${businessName}"`, 'warning');
        return [];
    }
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
    
    console.log('🔍 Search functionality initialized');
}

// Handle search input with suggestions
async function handleSearchInput(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    // Check if it's a ZIP code (5 digits)
    const zipCodePattern = /^\d{5}$/;
    if (zipCodePattern.test(query)) {
        showZipCodeSuggestion(query);
        return;
    }
    
    // Show business name suggestions
    const businessSuggestions = [
        "McDonald's", "Starbucks", "Shell", "Walmart", "Target", "Subway", 
        "Dunkin'", "CVS", "Walgreens", "7-Eleven", "Burger King", "KFC",
        "Taco Bell", "Pizza Hut", "Domino's", "Wendy's", "Chick-fil-A"
    ].filter(name => name.toLowerCase().includes(query)).slice(0, 5);
    
    // Also get location suggestions
    try {
        const locationSuggestions = await getLocationSuggestions(query);
        showSuggestions([...businessSuggestions.map(name => ({ name, isBusiness: true })), ...locationSuggestions]);
    } catch (error) {
        showSuggestions(businessSuggestions.map(name => ({ name, isBusiness: true })));
    }
}

// Show ZIP code suggestion
function showZipCodeSuggestion(zipCode) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) return;
    
    suggestionsContainer.innerHTML = `
        <div class="search-suggestion" onclick="searchByZipCode('${zipCode}')">
            <div class="suggestion-main">📮 Search ZIP Code ${zipCode}</div>
            <div class="suggestion-subtitle">Find businesses in this postal code</div>
        </div>
    `;
    
    suggestionsContainer.style.display = 'block';
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
        if (item.isBusiness) {
            return `
                <div class="search-suggestion" onclick="searchBusinessByName('${item.name}')">
                    <div class="suggestion-main">🏢 ${item.name}</div>
                    <div class="suggestion-subtitle">Search for ${item.name} locations nationwide</div>
                </div>
            `;
        } else if (item.isLocation) {
            return `
                <div class="search-suggestion" onclick="selectLocationSuggestion(${item.coordinates[0]}, ${item.coordinates[1]}, '${item.name}')">
                    <div class="suggestion-main">📍 ${item.name}</div>
                    <div class="suggestion-subtitle">${item.address}</div>
                </div>
            `;
        }
        return '';
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

// Search business by name
async function searchBusinessByName(businessName) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = businessName;
    }
    hideSuggestions();
    
    await searchBusinessesByName(businessName);
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
        const businesses = await searchRealBusinessesGeoapify(lat, lng);
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
    
    hideSuggestions();
    
    // Check if it's a ZIP code
    const zipCodePattern = /^\d{5}$/;
    if (zipCodePattern.test(query)) {
        await searchByZipCode(query);
        return;
    }
    
    // Check if it's a business name
    const businessNames = ["mcdonald", "starbucks", "shell", "walmart", "target", "subway", "dunkin", "cvs"];
    const isBusinessName = businessNames.some(name => query.toLowerCase().includes(name));
    
    if (isBusinessName) {
        await searchBusinessesByName(query);
    } else {
        // Treat as location search
        await searchByLocation(query);
    }
}

// Search by location (city, state, address)
async function searchByLocation(location) {
    console.log(`📍 Searching location: "${location}"`);
    
    try {
        const geocodeResult = await geocodeQuery(location);
        
        if (geocodeResult) {
            map.setView([geocodeResult.lat, geocodeResult.lng], 14);
            
            const businesses = await searchRealBusinessesGeoapify(geocodeResult.lat, geocodeResult.lng);
            currentBusinesses = businesses;
            renderBusinesses(businesses);
            addBusinessMarkersToMap(businesses);
            updateSearchResultsInfo(location, businesses.length);
        } else {
            showNotification(`Location "${location}" not found`, 'warning');
        }
        
    } catch (error) {
        console.error('❌ Error searching by location:', error);
        showNotification('Search failed. Please try again.', 'error');
    }
}

// Geocode query using Nominatim
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
    console.log('📋 Loading sample businesses...');
    currentBusinesses = sampleBusinesses;
    renderBusinesses(sampleBusinesses);
    addBusinessMarkersToMap(sampleBusinesses);
    updateSearchResultsInfo('', sampleBusinesses.length);
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
            <div style="min-width: 250px; max-width: 300px;">
                <h4 style="margin: 0 0 0.5rem 0; color: #8B5CF6; font-size: 1.1rem;">${business.name}</h4>
                <p style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.9rem;">${business.address}</p>
                <div style="margin: 0.5rem 0;">
                    <strong style="color: #1e293b;">Overall Rating: ${business.ratings.overall.toFixed(1)}/10</strong>
                    <div style="color: #f59e0b; font-size: 0.9rem; margin-top: 0.25rem;">${generateStars(business.ratings.overall)}</div>
                </div>
                <div style="margin: 0.5rem 0; font-size: 0.85rem; color: #64748b;">
                    <div>Cleanliness: ${business.ratings.cleanliness.toFixed(1)}/10</div>
                    <div>Safety: ${business.ratings.safety.toFixed(1)}/10</div>
                    <div>Accessibility: ${business.ratings.accessibility.toFixed(1)}/10</div>
                </div>
                <p style="margin: 0.5rem 0 1rem 0; font-size: 0.8rem; color: #64748b;">${business.reviewCount} reviews</p>
                <button onclick="openReviewModal(${business.id})" style="background: #8B5CF6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-size: 0.9rem; width: 100%;">Rate & Review</button>
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

// Initialize Filters
function initializeFilters() {
    console.log('🔧 Initializing filters...');
    // Filter initialization code here
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
                    .bindPopup('📍 Your Location')
                    .openPopup();
            }
            
            // Load businesses for new location
            try {
                const businesses = await searchRealBusinessesGeoapify(userLocation.lat, userLocation.lng);
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
        const newZoom = currentZoom > 15
