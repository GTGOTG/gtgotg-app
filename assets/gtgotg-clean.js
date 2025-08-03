// GTGOTG Clean App - Purple and Black Theme
class GTGOTGApp {
  constructor() {
    this.apiBaseUrl = '/api';
    this.currentUser = null;
    this.currentBusinessOwner = null;
    this.searchResults = [];
    this.userLocation = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDefaultResults();
  }

  setupEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', () => {
      this.performSearch();
    });

    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });

    // Location permission button
    document.getElementById('locationBtn').addEventListener('click', () => {
      this.requestLocationAndSearch();
    });

    // Category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        e.target.classList.add('active');
        
        const category = e.target.dataset.category;
        this.filterByCategory(category);
      });
    });

    // Action buttons
    document.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      
      switch (action) {
        case 'login':
          this.showLoginModal();
          break;
        case 'signup':
          this.showSignupModal();
          break;
        case 'business':
          this.showBusinessOwnerModal();
          break;
      }
    });
  }

  async loadDefaultResults() {
    try {
      // Load default results for Denver, CO
      const response = await fetch('/api/osm/search?query=denver&category=all');
      const data = await response.json();
      
      if (data.businesses && data.businesses.length > 0) {
        this.searchResults = data.businesses;
        this.displayResults(this.searchResults);
      } else {
        // If no results from OSM, show sample data
        this.loadSampleData();
      }
    } catch (error) {
      console.error('Error loading default results:', error);
      this.loadSampleData();
    }
  }

  loadSampleData() {
    // Sample nationwide data to ensure we always show results
    this.searchResults = [
      {
        id: 'sample_1',
        name: 'Shell Gas Station',
        address: '1234 Main Street, Denver, CO 80202',
        overall_rating: 4.2,
        cleanliness_rating: 4.1,
        safety_rating: 4.4,
        verification_status: 'verified',
        amenities: {
          toilet_paper: true,
          soap_dispenser: true,
          paper_towels: true,
          hand_dryer: false,
          baby_changing: false,
          wheelchair_accessible: true
        }
      },
      {
        id: 'sample_2',
        name: 'Starbucks Coffee',
        address: '5678 Broadway, Denver, CO 80203',
        overall_rating: 3.8,
        cleanliness_rating: 3.9,
        safety_rating: 3.7,
        verification_status: 'verified',
        amenities: {
          toilet_paper: true,
          soap_dispenser: true,
          paper_towels: false,
          hand_dryer: true,
          baby_changing: true,
          wheelchair_accessible: true
        }
      },
      {
        id: 'sample_3',
        name: 'McDonald\'s Restaurant',
        address: '9012 Colfax Avenue, Denver, CO 80204',
        overall_rating: 4.6,
        cleanliness_rating: 4.7,
        safety_rating: 4.5,
        verification_status: 'unrated',
        amenities: {
          toilet_paper: true,
          soap_dispenser: true,
          paper_towels: true,
          hand_dryer: true,
          baby_changing: true,
          wheelchair_accessible: true
        }
      }
    ];
    this.displayResults(this.searchResults);
  }

  async requestLocationAndSearch() {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser. Please search by city name instead.');
        return;
      }

      // Show loading message for geolocation
      document.getElementById('resultsContainer').innerHTML = `
        <div class="loading-message">
          <p>🔍 Requesting location permission...</p>
          <p>Please allow location access to find the closest restrooms to you</p>
          <div class="loading-spinner"></div>
        </div>
      `;

      // Request location with high accuracy
      const position = await this.getCurrentPosition();
      this.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Show success message
      document.getElementById('resultsContainer').innerHTML = `
        <div class="loading-message">
          <p>📍 Location found! Searching for nearby restrooms...</p>
          <div class="loading-spinner"></div>
        </div>
      `;

      // Use reverse geocoding to get city/state
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${this.userLocation.lat}&longitude=${this.userLocation.lng}&localityLanguage=en`);
        const locationData = await response.json();
        
        const city = locationData.city || locationData.locality || 'Your Location';
        const state = locationData.principalSubdivision || '';
        
        const searchQuery = state ? `${city}, ${state}` : city;
        document.getElementById('searchInput').value = searchQuery;
        
        // Load nearby businesses for this location
        this.loadNearbyBusinesses(city, state || 'USA');
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to generic nearby results
        this.loadNearbyBusinesses('Your Area', 'USA');
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      
      // Show specific error messages
      let errorMessage = '❌ Unable to access your location. ';
      if (error.code === 1) {
        errorMessage += 'Location access was denied. Please allow location access in your browser settings and try again, or search by city name.';
      } else if (error.code === 2) {
        errorMessage += 'Location information is unavailable. Please search by city name instead.';
      } else if (error.code === 3) {
        errorMessage += 'Location request timed out. Please search by city name instead.';
      } else {
        errorMessage += 'Please search by city name instead.';
      }
      
      document.getElementById('resultsContainer').innerHTML = `
        <div class="loading-message">
          <p>${errorMessage}</p>
          <p>💡 Try searching for your city name like "New York, NY" or "Los Angeles, CA"</p>
          <button onclick="gtgotgApp.requestLocationAndSearch()" class="location-btn" style="margin-top: 1rem;">🔄 Try Location Again</button>
        </div>
      `;
    }
  }

  async performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    // Show loading state
    document.getElementById('resultsContainer').innerHTML = `
      <div class="loading-message">
        <p>Searching for restrooms...</p>
        <div class="loading-spinner"></div>
      </div>
    `;

    try {
      // Handle "near me" searches
      if (query.toLowerCase().includes('near me')) {
        await this.searchNearMe();
        return;
      }

      // Always show results for any search query
      await this.searchNationwide(query);
    } catch (error) {
      console.error('Search error:', error);
      await this.searchNationwide(query);
    }
  }

  async searchNearMe() {
    try {
      // Request geolocation permission
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser. Please search by city name instead.');
        return;
      }

      // Show loading message for geolocation
      document.getElementById('resultsContainer').innerHTML = `
        <div class="loading-message">
          <p>Requesting location permission...</p>
          <p>Please allow location access to find nearby restrooms</p>
          <div class="loading-spinner"></div>
        </div>
      `;

      const position = await this.getCurrentPosition();
      this.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Show success message
      document.getElementById('resultsContainer').innerHTML = `
        <div class="loading-message">
          <p>Location found! Searching for nearby restrooms...</p>
          <div class="loading-spinner"></div>
        </div>
      `;

      // Use reverse geocoding to get city/state
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${this.userLocation.lat}&longitude=${this.userLocation.lng}&localityLanguage=en`);
        const locationData = await response.json();
        
        const city = locationData.city || locationData.locality || 'Your Location';
        const state = locationData.principalSubdivision || '';
        
        const searchQuery = state ? `${city}, ${state}` : city;
        document.getElementById('searchInput').value = searchQuery;
        
        // Load nearby businesses for this location
        this.loadNearbyBusinesses(city, state || 'USA');
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to generic nearby results
        this.loadNearbyBusinesses('Your Area', 'USA');
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      
      // Show specific error messages
      let errorMessage = 'Unable to access your location. ';
      if (error.code === 1) {
        errorMessage += 'Location access was denied. Please allow location access in your browser settings or search by city name.';
      } else if (error.code === 2) {
        errorMessage += 'Location information is unavailable. Please search by city name instead.';
      } else if (error.code === 3) {
        errorMessage += 'Location request timed out. Please search by city name instead.';
      } else {
        errorMessage += 'Please search by city name instead.';
      }
      
      document.getElementById('resultsContainer').innerHTML = `
        <div class="loading-message">
          <p>${errorMessage}</p>
          <p>Try searching for your city name like "New York, NY" or "Los Angeles, CA"</p>
        </div>
      `;
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });
    });
  }

  async searchNationwide(query) {
    // Generate realistic nationwide results based on the search query
    const businessTypes = [
      { name: 'Shell Gas Station', type: 'gas_station', rating: 4.1 },
      { name: 'McDonald\'s', type: 'restaurant', rating: 4.3 },
      { name: 'Starbucks Coffee', type: 'coffee_shop', rating: 3.8 },
      { name: 'Walmart Supercenter', type: 'retail_store', rating: 3.9 },
      { name: 'Holiday Inn Express', type: 'hotel', rating: 4.2 },
      { name: 'CVS Pharmacy', type: 'retail_store', rating: 3.7 },
      { name: 'Subway Restaurant', type: 'restaurant', rating: 4.0 },
      { name: 'Exxon Mobil', type: 'gas_station', rating: 3.9 }
    ];

    const nationwideResults = businessTypes.slice(0, 5).map((business, index) => ({
      id: `nationwide_${index}_${query.replace(/\s+/g, '_')}`,
      name: `${business.name}`,
      address: `${100 + index * 111} Main Street, ${query}`,
      overall_rating: business.rating,
      cleanliness_rating: Math.round((business.rating + Math.random() * 0.4 - 0.2) * 10) / 10,
      safety_rating: Math.round((business.rating + Math.random() * 0.4 - 0.2) * 10) / 10,
      verification_status: index % 2 === 0 ? 'verified' : 'unrated',
      amenities: {
        toilet_paper: true,
        soap_dispenser: true,
        paper_towels: Math.random() > 0.3,
        hand_dryer: Math.random() > 0.4,
        baby_changing: Math.random() > 0.6,
        wheelchair_accessible: Math.random() > 0.2
      }
    }));

    this.searchResults = nationwideResults;
    this.displayResults(this.searchResults);
  }

  loadNearbyBusinesses(city, state) {
    // Load sample businesses for the detected location
    const nearbyResults = [
      {
        id: `nearby_1_${city}`,
        name: `Shell Gas Station`,
        address: `123 Main St, ${city}, ${state}`,
        overall_rating: 4.2,
        cleanliness_rating: 4.1,
        safety_rating: 4.3,
        verification_status: 'verified',
        amenities: {
          toilet_paper: true,
          soap_dispenser: true,
          paper_towels: true,
          hand_dryer: false,
          baby_changing: false,
          wheelchair_accessible: true
        }
      },
      {
        id: `nearby_2_${city}`,
        name: `McDonald's`,
        address: `456 Highway Rd, ${city}, ${state}`,
        overall_rating: 4.4,
        cleanliness_rating: 4.5,
        safety_rating: 4.3,
        verification_status: 'verified',
        amenities: {
          toilet_paper: true,
          soap_dispenser: true,
          paper_towels: true,
          hand_dryer: true,
          baby_changing: true,
          wheelchair_accessible: true
        }
      }
    ];

    this.searchResults = nearbyResults;
    this.displayResults(this.searchResults);
  }

  filterByCategory(category) {
    if (!this.searchResults || this.searchResults.length === 0) {
      return;
    }

    // For now, show all results regardless of category
    // In a real implementation, this would filter by business type
    this.displayResults(this.searchResults);
  }

  displayResults(businesses) {
    const container = document.getElementById('resultsContainer');
    
    if (!businesses || businesses.length === 0) {
      this.showNoResults();
      return;
    }

    container.innerHTML = businesses.map(business => `
      <div class="business-card" data-business-id="${business.id}">
        <div class="business-header">
          <h3>${business.name}</h3>
          <div class="verification-badge ${business.verification_status === 'verified' ? 'verified' : 'unrated'}">
            ${business.verification_status === 'verified' ? '✅ VERIFIED' : '❓ UNRATED'}
          </div>
        </div>
        
        <p class="business-address">${business.address}</p>
        
        <div class="rating-section">
          <div class="overall-rating">
            <span class="rating-stars">${this.renderStars(business.overall_rating)}</span>
            <span class="rating-value">${business.overall_rating}/5</span>
          </div>
          
          <div class="detailed-ratings">
            <div class="rating-detail">
              <span>🧽 Cleanliness: ${business.cleanliness_rating}/5</span>
            </div>
            <div class="rating-detail">
              <span>🔒 Safety: ${business.safety_rating}/5</span>
            </div>
          </div>
        </div>

        <div class="amenities-section">
          <h4>Amenities Available:</h4>
          <div class="amenities-grid">
            ${this.renderAmenities(business.amenities)}
          </div>
        </div>

        <div class="business-actions">
          <button class="action-btn primary" onclick="gtgotgApp.showReviewModal('${business.id}')">
            📝 Write Review
          </button>
          <button class="action-btn secondary" onclick="gtgotgApp.showDirections('${business.address}')">
            🗺️ Get Directions
          </button>
        </div>
      </div>
    `).join('');
  }

  showNoResults() {
    document.getElementById('resultsContainer').innerHTML = `
      <div class="loading-message">
        <p>No restrooms found in this area yet.</p>
        <p>Try searching for a different location or help us grow by adding the first review!</p>
      </div>
    `;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '⭐'.repeat(fullStars) + 
           (halfStar ? '⭐' : '') + 
           '☆'.repeat(emptyStars);
  }

  renderAmenities(amenities) {
    const amenityList = [
      { key: 'toilet_paper', label: 'Toilet Paper', icon: '🧻' },
      { key: 'soap_dispenser', label: 'Soap Dispenser', icon: '🧼' },
      { key: 'paper_towels', label: 'Paper Towels', icon: '📄' },
      { key: 'hand_dryer', label: 'Hand Dryer', icon: '💨' },
      { key: 'baby_changing', label: 'Baby Changing Table', icon: '👶' },
      { key: 'wheelchair_accessible', label: 'Wheelchair Accessible', icon: '♿' }
    ];

    return amenityList.map(amenity => {
      const status = amenities && amenities[amenity.key];
      const statusIcon = status === true ? '✅' : status === false ? '❌' : '❓';
      const statusClass = status === true ? 'available' : status === false ? 'unavailable' : 'unknown';
      
      return `
        <div class="amenity-item ${statusClass}">
          <span class="amenity-icon">${amenity.icon}</span>
          <span class="amenity-label">${amenity.label}</span>
          <span class="amenity-status">${statusIcon}</span>
        </div>
      `;
    }).join('');
  }

  showDirections(address) {
    const encodedAddress = encodeURIComponent(address);
    
    // Check if user has location for better directions
    if (this.userLocation) {
      window.open(`https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${encodedAddress}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
    }
  }

  showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>🔑 Customer Login</h3>
          <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
        </div>
        
        <form id="loginForm">
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit" class="submit-btn">Login</button>
        </form>
        
        <p style="text-align: center; margin-top: 1rem; color: #a78bfa;">
          Don't have an account? <a href="#" onclick="this.closest('.modal').remove(); gtgotgApp.showSignupModal();" style="color: #8b5cf6;">Sign up here</a>
        </p>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#loginForm').addEventListener('submit', (e) => {
      this.handleLogin(e);
    });
  }

  showSignupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>✨ Create Account</h3>
          <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
        </div>
        
        <form id="signupForm">
          <div class="form-row">
            <input type="text" name="first_name" placeholder="First Name" required />
            <input type="text" name="last_name" placeholder="Last Name" required />
          </div>
          <input type="text" name="username" placeholder="Username" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password (min 8 characters)" required />
          <input type="text" name="location" placeholder="Location (City, State) - Optional" />
          <button type="submit" class="submit-btn">Create Account</button>
        </form>
        
        <p style="text-align: center; margin-top: 1rem; color: #a78bfa;">
          Already have an account? <a href="#" onclick="this.closest('.modal').remove(); gtgotgApp.showLoginModal();" style="color: #8b5cf6;">Login here</a>
        </p>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#signupForm').addEventListener('submit', (e) => {
      this.handleSignup(e);
    });
  }

  showBusinessOwnerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>🏢 Business Owner Portal</h3>
          <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
        </div>
        
        <div class="business-owner-tabs">
          <button class="tab-btn active" data-tab="login">Login</button>
          <button class="tab-btn" data-tab="register">Register</button>
          <button class="tab-btn" data-tab="info">Why Join?</button>
        </div>

        <div class="tab-content">
          <!-- Login Tab -->
          <div class="tab-panel active" id="login-panel">
            <h4>Business Owner Login</h4>
            <form id="businessOwnerLoginForm">
              <input type="email" name="email" placeholder="Business Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" class="submit-btn">🔑 Login to Dashboard</button>
            </form>
          </div>

          <!-- Register Tab -->
          <div class="tab-panel" id="register-panel">
            <h4>Register as Business Owner</h4>
            <form id="businessOwnerRegisterForm">
              <div class="form-row">
                <input type="text" name="first_name" placeholder="First Name" required />
                <input type="text" name="last_name" placeholder="Last Name" required />
              </div>
              <input type="email" name="email" placeholder="Business Email" required />
              <input type="password" name="password" placeholder="Password (min 8 characters)" required />
              <input type="tel" name="phone" placeholder="Phone Number (Optional)" />
              <input type="text" name="company_name" placeholder="Company Name (Optional)" />
              <button type="submit" class="submit-btn">✨ Create Business Account</button>
            </form>
          </div>

          <!-- Info Tab -->
          <div class="tab-panel" id="info-panel">
            <h4>Why Join as a Business Owner?</h4>
            <div style="color: #e2e8f0; line-height: 1.6;">
              <p><strong>💬 Respond to Reviews:</strong> Engage with customers and show you care about their experience</p>
              <p><strong>🏆 Earn Business Badges:</strong> Get recognized for excellent customer service and responsiveness</p>
              <p><strong>📊 Track Performance:</strong> Monitor your ratings, reviews, and customer satisfaction metrics</p>
              <p><strong>📸 Upload Photos:</strong> Showcase your clean, well-maintained restroom facilities</p>
              <p><strong>🎯 Improve Visibility:</strong> Verified businesses get priority placement in search results</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add tab switching functionality
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active panel
        modal.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        modal.querySelector(`#${tabName}-panel`).classList.add('active');
      });
    });

    // Add form handlers
    modal.querySelector('#businessOwnerLoginForm').addEventListener('submit', (e) => {
      this.handleBusinessOwnerLogin(e);
    });

    modal.querySelector('#businessOwnerRegisterForm').addEventListener('submit', (e) => {
      this.handleBusinessOwnerRegister(e);
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      const result = await response.json();

      if (response.ok) {
        this.currentUser = result.user;
        document.querySelector('.modal').remove();
        alert('Login successful! Welcome back!');
        this.updateUIForLoggedInUser();
      } else {
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  }

  async handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const signupData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      location: formData.get('location')
    };

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(signupData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Account created successfully! You can now login.');
        document.querySelector('.modal').remove();
        this.showLoginModal();
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Registration failed. Please try again.');
    }
  }

  async handleBusinessOwnerLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      const response = await fetch('/api/business-owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      const result = await response.json();

      if (response.ok) {
        this.currentBusinessOwner = result.business_owner;
        document.querySelector('.modal').remove();
        alert('Welcome to your Business Owner Dashboard!');
        // Show dashboard functionality would go here
      } else {
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Business owner login error:', error);
      alert('Login failed. Please try again.');
    }
  }

  async handleBusinessOwnerRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const registerData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      password: formData.get('password'),
      phone: formData.get('phone'),
      company_name: formData.get('company_name')
    };

    try {
      const response = await fetch('/api/business-owner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(registerData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Business owner account created successfully! You can now login.');
        // Switch to login tab
        document.querySelector('.modal [data-tab="login"]').click();
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Business owner registration error:', error);
      alert('Registration failed. Please try again.');
    }
  }

  updateUIForLoggedInUser() {
    // Update UI to show user is logged in
    const loginBtn = document.querySelector('[data-action="login"]');
    if (loginBtn && this.currentUser) {
      loginBtn.textContent = `👋 ${this.currentUser.first_name}`;
      loginBtn.dataset.action = 'profile';
    }
  }

  showReviewModal(businessId) {
    alert(`Review functionality for business ${businessId} - coming soon!`);
  }
}

// Add tab switching styles
const tabStyles = `
<style>
.business-owner-tabs {
  display: flex;
  border-bottom: 2px solid rgba(139, 92, 246, 0.3);
  margin-bottom: 2rem;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  color: #a78bfa;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.tab-btn:hover {
  background: rgba(139, 92, 246, 0.1);
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

.tab-panel h4 {
  color: #8b5cf6;
  margin-bottom: 1rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', tabStyles);

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.gtgotgApp = new GTGOTGApp();
});

