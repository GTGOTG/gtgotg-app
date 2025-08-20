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
        phone: "(555) 456-78
