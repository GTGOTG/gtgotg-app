# GTGOTG App - Project TODO

## Phase 1: Data & Backend Setup
- [x] Import 313,590 location dataset into database
- [x] Create database schema for locations, reviews, and ratings
- [x] Build tRPC API for viewport-based location queries
- [x] Add category filtering (Rest Area, Gas Station, Restaurant, Bar, Public Building, Park)
- [x] Implement state-based data loading endpoints

## Phase 2: Map & Frontend Core
- [x] Integrate Leaflet map with OpenStreetMap tiles (free)
- [x] Implement marker clustering for performance
- [x] Add viewport-based location loading
- [x] Create category filter UI with color-coded markers
- [x] Build location detail popup/modal

## Phase 3: User Features
- [ ] User authentication (Manus OAuth)
- [ ] Add restroom review system (Cleanliness, ADA Compliance, Safety)
- [ ] Implement restroom type selection (Male, Female, Unisex/Family)
- [ ] Add ADA compliance indicator (wheelchair symbol)
- [ ] Create user rating system with confidence scores

## Phase 4: Gamification & Engagement
- [ ] Implement user badge system (Reviewer, Bronze, Silver, Gold, Platinum, Expert)
- [ ] Add badge awards for every 5 different bathrooms rated
- [ ] Create business owner verification system
- [ ] Implement owner reply feature for reviews
- [ ] Add business owner badge system for responsiveness

## Phase 5: Content Moderation
- [ ] Implement profanity filter for reviews (replace with asterisks)
- [ ] Add review flagging system
- [ ] Create moderation dashboard

## Phase 6: Mobile Optimization
- [ ] Add offline support with state caching
- [ ] Implement progressive loading for nearby states
- [ ] Add "Near Me" quick search
- [ ] Create mobile-optimized UI with touch gestures

## Phase 7: Search & Discovery
- [ ] Add text search for location names
- [ ] Implement "Search along route" feature
- [ ] Add filters by amenities (water, picnic tables, RV station, etc.)
- [ ] Create "Recently reviewed" feed

## Phase 8: UI/UX Polish
- [x] Add colorful, unique design (not generic)
- [x] Implement clickable lightbulb icons for tips (toggleable)
- [x] Add loading skeletons for better perceived performance
- [ ] Create empty states for no results
- [ ] Add toast notifications for user actions

## Phase 9: SEO & Discoverability
- [ ] Implement SEO meta tags for location pages
- [ ] Add structured data markup for search engines
- [ ] Create sitemap for all locations
- [ ] Add social sharing features

## Phase 10: Deployment
- [ ] Set up custom domain (gtgotg.com)
- [ ] Configure production environment
- [ ] Set up analytics
- [ ] Create deployment documentation

## New Feature Requests (User Priority)
- [x] Change theme to purple color scheme (matching logo gradient)
- [x] Add GTGOTG logo to the app
- [x] Implement customer login system
- [x] Implement business owner registration system (separate from customer)
- [ ] Add business ownership verification before allowing review replies
- [x] Add "Near Me" button for geolocation-based search (5-mile radius)
- [x] Add comprehensive search bar supporting:
  - [x] Streets
  - [x] ZIP codes
  - [x] Counties
  - [x] States
  - [x] Addresses
  - [x] Highways
  - [x] Rest stops
  - [x] Business names
- [ ] Allow verified businesses to respond to customer reviews (backend ready, UI pending)
- [x] Add photo upload functionality to reviews
- [x] Implement 1-10 star rating system with yellow stars
- [x] Create admin area
- [x] Add free email functionality for admin
- [x] Make UI more user-friendly
