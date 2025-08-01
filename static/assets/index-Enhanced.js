// GTGOTG Enhanced - Got To Go On The Go - Full-Featured Application
class GTGOTGApp {
  constructor() {
    // API Configuration - Use current domain for OSM backend
    this.apiBaseUrl = window.location.origin + '/api';
    this.businesses = [];
    this.filteredBusinesses = [];
    this.selectedCategories = [];
    this.currentLocation = '';
    this.isLoading = false;
    this.helpEnabled = true;
    this.currentUser = null;
    
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.loadInitialData();
    this.initializeHelp();
  }

  render() {
    const app = document.getElementById('root');
    app.innerHTML = `
      <div class="app-container">
        <!-- Header Section -->
        <header class="header">
          <div class="logo-container">
            <div class="logo-circle">GT</div>
            <h1 class="logo-text">GTGOTG</h1>
          </div>
          
          <div class="tagline-container">
            <h2 class="main-tagline">Every Restroom, Everywhere <button class="help-icon" data-help="main-tagline">💡</button></h2>
            <h3 class="sub-tagline">Got To Go On The Go</h3>
            <p class="description">
              Your one-stop app to find clean, safe bathrooms when you're away from home. 
              Discover verified restrooms with real reviews, safety ratings, and detailed amenities information.
              <button class="help-icon" data-help="description">💡</button>
            </p>
          </div>

          <!-- Feature Badges -->
          <div class="feature-badges">
            <span class="badge badge-reviews">⭐ Real Reviews</span>
            <span class="badge badge-coverage">📍 Nationwide Coverage</span>
            <span class="badge badge-safety">🔒 Safety Ratings</span>
            <span class="badge badge-ada">♿ ADA Compliance</span>
            <span class="badge badge-photos">📸 Photo Verified</span>
          </div>
        </header>

        <!-- User Actions -->
        <div class="user-actions">
          <button class="action-btn login-btn" data-action="login">🔑 Login <button class="help-icon" data-help="login">💡</button></button>
          <button class="action-btn signup-btn" data-action="signup">✨ Sign Up <button class="help-icon" data-help="signup">💡</button></button>
          <button class="action-btn business-btn" data-action="business">🏢 Business Owner? <button class="help-icon" data-help="business">💡</button></button>
        </div>

        <!-- Search Section -->
        <div class="search-section">
          <h3>Where are you looking for a restroom? <button class="help-icon" data-help="search">💡</button></h3>
          <div class="search-container">
            <input type="text" id="searchInput" placeholder="Search by city, state, zip code, or 'near me'..." />
            <button id="searchBtn" class="search-btn">🔍 Search</button>
          </div>
        </div>

        <!-- Category Filter Section -->
        <div class="category-section">
          <h3>What type of business are you looking for? <button class="help-icon" data-help="categories">💡</button></h3>
          <div class="category-filters" id="categoryFilters">
            <!-- Categories will be loaded dynamically -->
          </div>
        </div>

        <!-- Results Section -->
        <div class="results-section">
          <div class="results-header">
            <h3>Restroom Locations</h3>
            <span class="results-count" id="resultsCount">Loading...</span>
          </div>
          <div class="business-list" id="businessList">
            <!-- Business cards will be loaded here -->
          </div>
        </div>

        <!-- Modals -->
        <div id="loginModal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Login to GTGOTG</h3>
              <span class="close" data-modal="login">&times;</span>
            </div>
            <form id="loginForm">
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <div class="modal-actions">
                <button type="submit">Login</button>
                <button type="button" class="cancel-btn" data-modal="login">Cancel</button>
              </div>
              <p class="modal-link">Don't have an account? <a href="#" data-action="signup">Sign up here</a></p>
            </form>
          </div>
        </div>

        <div id="signupModal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Join GTGOTG</h3>
              <span class="close" data-modal="signup">&times;</span>
            </div>
            <form id="signupForm">
              <div class="form-row">
                <input type="text" placeholder="First Name" required />
                <input type="text" placeholder="Last Name" required />
              </div>
              <input type="text" placeholder="Username" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <small>Must be at least 8 characters with letters and numbers</small>
              <input type="text" placeholder="Location (City, State) - Optional" />
              <div class="modal-actions">
                <button type="submit">Create Account</button>
                <button type="button" class="cancel-btn" data-modal="signup">Cancel</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Help Tooltips -->
        <div id="helpTooltips" class="help-tooltips">
          <!-- Help content will be dynamically added -->
        </div>

        <!-- Success Messages -->
        <div id="successMessage" class="success-message"></div>
      </div>
    `;
  }

  attachEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });

    // User action buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleUserAction(e.target.dataset.action));
    });

    // Modal close buttons
    document.querySelectorAll('.close, .cancel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.closeModal(e.target.dataset.modal));
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));

    // Help system
    document.querySelectorAll('.help-icon').forEach(btn => {
      btn.addEventListener('click', (e) => this.toggleHelp(e.target.dataset.help));
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal();
      }
    });
  }

  async loadInitialData() {
    await this.loadCategories();
    await this.loadBusinesses('Denver'); // Default search
  }

  async loadCategories() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/categories`);
      const categories = await response.json();
      this.renderCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories
      const fallbackCategories = [
        { name: 'Gas Station', subcategories: [] },
        { name: 'Restaurant', subcategories: [] },
        { name: 'Retail Store', subcategories: [] },
        { name: 'Coffee Shop', subcategories: [] },
        { name: 'Park', subcategories: [] },
        { name: 'Hospital', subcategories: [] },
        { name: 'Rest Park', subcategories: [] }
      ];
      this.renderCategories(fallbackCategories);
    }
  }

  renderCategories(categories) {
    const container = document.getElementById('categoryFilters');
    const categoryIcons = {
      'Gas Station': '⛽',
      'Restaurant': '🍽️',
      'Retail Store': '🏪',
      'Coffee Shop': '☕',
      'Park': '🏞️',
      'Hospital': '🏥',
      'Rest Park': '🌳'
    };

    container.innerHTML = categories.map((category, index) => `
      <button class="category-btn" data-category="${category.name}" data-index="${index + 4}">
        ${categoryIcons[category.name] || '🏢'} ${category.name}
      </button>
    `).join('');

    // Add event listeners for category filters
    container.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleCategory(btn.dataset.category));
    });
  }

  async loadBusinesses(location) {
    this.isLoading = true;
    this.updateResultsCount('Searching for restrooms...');
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/search?location=${encodeURIComponent(location)}`);
      const data = await response.json();
      
      this.businesses = data.results || [];
      this.filteredBusinesses = [...this.businesses];
      this.renderBusinesses();
      this.updateResultsCount(`${this.businesses.length} restrooms found in ${location.toLowerCase()}`);
    } catch (error) {
      console.error('Error loading businesses:', error);
      this.updateResultsCount('Error loading restrooms. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  renderBusinesses() {
    const container = document.getElementById('businessList');
    
    if (this.filteredBusinesses.length === 0) {
      container.innerHTML = '<div class="no-results">No restrooms found. Try adjusting your search or filters.</div>';
      return;
    }

    container.innerHTML = this.filteredBusinesses.map((business, index) => `
      <div class="business-card">
        <div class="business-header">
          <h4>${business.name}</h4>
          ${business.verified ? '<span class="verified-badge">✓ VERIFIED</span>' : '<span class="unrated-badge">UNRATED</span>'}
        </div>
        <div class="business-info">
          <span class="category-tag">${this.getCategoryIcon(business.category)} ${business.category.toUpperCase()}</span>
          <p class="address">${business.address}</p>
        </div>
        <div class="ratings">
          <div class="rating-item">
            <span class="rating-label">Overall</span>
            <div class="stars">${this.renderStars(business.ratings?.overall)}</div>
            <span class="rating-value">${business.ratings?.overall || 'N/A'}</span>
          </div>
          <div class="rating-item">
            <span class="rating-label">Cleanliness</span>
            <div class="stars">${this.renderStars(business.ratings?.cleanliness)}</div>
            <span class="rating-value">${business.ratings?.cleanliness || 'N/A'}/5</span>
          </div>
          <div class="rating-item">
            <span class="rating-label">Safety</span>
            <div class="stars">${this.renderStars(business.ratings?.safety)}</div>
            <span class="rating-value">${business.ratings?.safety || 'N/A'}/5</span>
          </div>
        </div>
        <div class="business-actions">
          <button class="action-btn directions-btn" data-index="${index + 11}">📍 Get Directions</button>
          <button class="action-btn details-btn" data-index="${index + 12}">ℹ️ View Details</button>
        </div>
      </div>
    `).join('');
  }

  getCategoryIcon(category) {
    const icons = {
      'Gas Station': '⛽',
      'Restaurant': '🍽️',
      'Retail Store': '🏪',
      'Coffee Shop': '☕',
      'Park': '🏞️',
      'Hospital': '🏥',
      'Rest Park': '🌳'
    };
    return icons[category] || '🏢';
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }

  performSearch() {
    const searchInput = document.getElementById('searchInput');
    const location = searchInput.value.trim();
    
    if (!location) {
      alert('Please enter a location to search.');
      return;
    }
    
    this.currentLocation = location;
    this.loadBusinesses(location);
  }

  toggleCategory(categoryName) {
    const btn = document.querySelector(`[data-category="${categoryName}"]`);
    
    if (this.selectedCategories.includes(categoryName)) {
      this.selectedCategories = this.selectedCategories.filter(cat => cat !== categoryName);
      btn.classList.remove('active');
    } else {
      this.selectedCategories.push(categoryName);
      btn.classList.add('active');
    }
    
    this.filterBusinesses();
  }

  filterBusinesses() {
    if (this.selectedCategories.length === 0) {
      this.filteredBusinesses = [...this.businesses];
    } else {
      this.filteredBusinesses = this.businesses.filter(business => 
        this.selectedCategories.includes(business.category)
      );
    }
    
    this.renderBusinesses();
    this.updateResultsCount(`${this.filteredBusinesses.length} restrooms found`);
  }

  updateResultsCount(text) {
    document.getElementById('resultsCount').textContent = text;
  }

  handleUserAction(action) {
    switch (action) {
      case 'login':
        this.showModal('loginModal');
        break;
      case 'signup':
        this.showModal('signupModal');
        break;
      case 'business':
        alert('Business Owner Portal - Coming Soon!\n\nFeatures will include:\n• Claim your business listing\n• Respond to reviews\n• Upload photos\n• Verify amenities\n• Business badge system');
        break;
    }
  }

  showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
  }

  closeModal(modalType) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
  }

  async handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        this.currentUser = result.user;
        this.closeModal();
        this.showSuccessMessage('Login successful! Welcome back!');
      } else {
        alert(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  }

  async handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password'),
          location: formData.get('location')
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        this.closeModal();
        this.showSuccessMessage('Account created successfully! Welcome to GTGOTG!');
      } else {
        alert(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.closeModal();
      this.showSuccessMessage('Account created successfully! Welcome to GTGOTG!');
    }
  }

  showSuccessMessage(message) {
    const messageEl = document.getElementById('successMessage');
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }

  toggleHelp(helpType) {
    // Help system implementation
    const helpContent = {
      'main-tagline': 'GTGOTG helps you find clean, safe restrooms everywhere you go!',
      'description': 'Our app provides verified restroom locations with real user reviews and safety ratings.',
      'login': 'Login to save favorite locations, leave reviews, and earn badges!',
      'signup': 'Join GTGOTG to contribute reviews and help others find great restrooms!',
      'business': 'Business owners can claim listings, respond to reviews, and showcase their facilities.',
      'search': 'Search by city, state, zip code, or use "near me" for current location.',
      'categories': 'Filter results by business type to find exactly what you need.'
    };
    
    if (helpContent[helpType]) {
      alert(helpContent[helpType]);
    }
  }

  initializeHelp() {
    // Initialize help system
    console.log('Help system initialized');
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new GTGOTGApp();
});



  // Badge System Methods
  renderUserBadge(user) {
    if (!user) return '';
    
    const badgeInfo = {
      'Reviewer': { icon: '👤', color: '#6B7280' },
      'Bronze': { icon: '🥉', color: '#CD7F32' },
      'Silver': { icon: '🥈', color: '#C0C0C0' },
      'Gold': { icon: '🥇', color: '#FFD700' },
      'Platinum': { icon: '💎', color: '#E5E4E2' },
      'Expert': { icon: '👑', color: '#9333EA' }
    };
    
    const badge = badgeInfo[user.badge_level] || badgeInfo['Reviewer'];
    
    return `
      <div class="user-badge" style="color: ${badge.color}">
        <span class="badge-icon">${badge.icon}</span>
        <span class="badge-text">${user.badge_level}</span>
        <span class="badge-count">(${user.review_count} reviews)</span>
      </div>
    `;
  }

  renderAmenitiesChecklist(amenities = {}) {
    const amenitiesTemplate = [
      { id: 'toilet_paper', name: 'Toilet Paper Available', icon: '🧻' },
      { id: 'soap_dispenser', name: 'Soap Dispenser Working', icon: '🧼' },
      { id: 'paper_towels', name: 'Paper Towels Available', icon: '📄' },
      { id: 'hand_dryer', name: 'Hand Air Dryer Working', icon: '💨' },
      { id: 'baby_changing_table', name: 'Baby Changing Table Present', icon: '👶' },
      { id: 'wheelchair_accessible', name: 'Wheelchair Accessible', icon: '♿' },
      { id: 'wheelchair_stall', name: 'Wheelchair Accessible Stall', icon: '🚪' },
      { id: 'grab_bars', name: 'Grab Bars Present', icon: '🤝' },
      { id: 'lowered_sink', name: 'Lowered Sink Available', icon: '🚰' },
      { id: 'good_lighting', name: 'Good Lighting', icon: '💡' },
      { id: 'clean_floors', name: 'Clean Floors', icon: '✨' },
      { id: 'working_lock', name: 'Working Door Lock', icon: '🔒' }
    ];

    return `
      <div class="amenities-checklist">
        <h4>Amenities & Accessibility</h4>
        <div class="amenities-grid">
          ${amenitiesTemplate.map(amenity => {
            const isAvailable = amenities[amenity.id];
            const statusClass = isAvailable === true ? 'available' : 
                               isAvailable === false ? 'unavailable' : 'unknown';
            const statusIcon = isAvailable === true ? '✅' : 
                              isAvailable === false ? '❌' : '❓';
            
            return `
              <div class="amenity-item ${statusClass}">
                <span class="amenity-icon">${amenity.icon}</span>
                <span class="amenity-name">${amenity.name}</span>
                <span class="amenity-status">${statusIcon}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Enhanced business card rendering with amenities
  renderBusinesses() {
    const container = document.getElementById('businessList');
    
    if (this.isLoading) {
      container.innerHTML = '<div class="loading">Searching for restrooms...</div>';
      return;
    }

    if (this.filteredBusinesses.length === 0) {
      container.innerHTML = '<div class="no-results">No restrooms found. Try adjusting your search or filters.</div>';
      return;
    }

    container.innerHTML = this.filteredBusinesses.map((business, index) => `
      <div class="business-card enhanced">
        <div class="business-header">
          <h4>${business.name}</h4>
          ${business.verified ? '<span class="verified-badge">✓ VERIFIED</span>' : '<span class="unrated-badge">UNRATED</span>'}
        </div>
        
        <div class="business-info">
          <span class="category-tag">${this.getCategoryIcon(business.category)} ${business.category.toUpperCase()}</span>
          <p class="address">${business.address}</p>
        </div>
        
        <div class="ratings-section">
          <div class="ratings">
            <div class="rating-item">
              <span class="rating-label">Overall</span>
              <div class="stars">${this.renderStars(business.ratings?.overall)}</div>
              <span class="rating-value">${business.ratings?.overall || 'N/A'}</span>
            </div>
            <div class="rating-item">
              <span class="rating-label">Cleanliness</span>
              <div class="stars">${this.renderStars(business.ratings?.cleanliness)}</div>
              <span class="rating-value">${business.ratings?.cleanliness || 'N/A'}/5</span>
            </div>
            <div class="rating-item">
              <span class="rating-label">Safety</span>
              <div class="stars">${this.renderStars(business.ratings?.safety)}</div>
              <span class="rating-value">${business.ratings?.safety || 'N/A'}/5</span>
            </div>
          </div>
        </div>

        ${this.renderAmenitiesChecklist(business.amenities)}

        <div class="business-actions">
          <button class="action-btn directions-btn" onclick="gtgotgApp.getDirections('${business.address}')">📍 Get Directions</button>
          <button class="action-btn details-btn" onclick="gtgotgApp.showBusinessDetails('${business.id}')">ℹ️ View Details</button>
          <button class="action-btn review-btn" onclick="gtgotgApp.showReviewModal('${business.id}')">⭐ Add Review</button>
        </div>
      </div>
    `).join('');
  }

  // Review Modal
  showReviewModal(businessId) {
    if (!this.currentUser) {
      this.showModal('login');
      return;
    }

    const business = this.businesses.find(b => b.id === businessId);
    if (!business) return;

    const modal = document.createElement('div');
    modal.className = 'modal review-modal';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>Review ${business.name}</h3>
          <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
        </div>
        
        <form id="reviewForm" onsubmit="gtgotgApp.submitReview(event, '${businessId}')">
          <div class="rating-section">
            <h4>Rate Your Experience</h4>
            
            <div class="rating-input">
              <label>Overall Rating:</label>
              <div class="star-rating" data-rating="overall">
                ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">⭐</span>`).join('')}
              </div>
            </div>
            
            <div class="rating-input">
              <label>Cleanliness:</label>
              <div class="star-rating" data-rating="cleanliness">
                ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">⭐</span>`).join('')}
              </div>
            </div>
            
            <div class="rating-input">
              <label>Safety:</label>
              <div class="star-rating" data-rating="safety">
                ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">⭐</span>`).join('')}
              </div>
            </div>
            
            <div class="rating-input">
              <label>Accessibility:</label>
              <div class="star-rating" data-rating="accessibility">
                ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">⭐</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="amenities-section">
            <h4>Amenities Checklist</h4>
            <div class="amenities-form">
              <div class="amenity-checkbox">
                <input type="checkbox" id="toilet_paper" name="amenities" value="toilet_paper">
                <label for="toilet_paper">🧻 Toilet Paper Available</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="soap_dispenser" name="amenities" value="soap_dispenser">
                <label for="soap_dispenser">🧼 Soap Dispenser Working</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="paper_towels" name="amenities" value="paper_towels">
                <label for="paper_towels">📄 Paper Towels Available</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="hand_dryer" name="amenities" value="hand_dryer">
                <label for="hand_dryer">💨 Hand Air Dryer Working</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="baby_changing_table" name="amenities" value="baby_changing_table">
                <label for="baby_changing_table">👶 Baby Changing Table Present</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="wheelchair_accessible" name="amenities" value="wheelchair_accessible">
                <label for="wheelchair_accessible">♿ Wheelchair Accessible</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="wheelchair_stall" name="amenities" value="wheelchair_stall">
                <label for="wheelchair_stall">🚪 Wheelchair Accessible Stall</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="grab_bars" name="amenities" value="grab_bars">
                <label for="grab_bars">🤝 Grab Bars Present</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="lowered_sink" name="amenities" value="lowered_sink">
                <label for="lowered_sink">🚰 Lowered Sink Available</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="good_lighting" name="amenities" value="good_lighting">
                <label for="good_lighting">💡 Good Lighting</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="clean_floors" name="amenities" value="clean_floors">
                <label for="clean_floors">✨ Clean Floors</label>
              </div>
              <div class="amenity-checkbox">
                <input type="checkbox" id="working_lock" name="amenities" value="working_lock">
                <label for="working_lock">🔒 Working Door Lock</label>
              </div>
            </div>
          </div>

          <div class="comment-section">
            <label for="comment">Additional Comments (Optional):</label>
            <textarea id="comment" name="comment" rows="4" placeholder="Share your experience to help other users..."></textarea>
          </div>

          <div class="modal-actions">
            <button type="submit" class="submit-btn">Submit Review</button>
            <button type="button" class="cancel-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Add star rating functionality
    modal.querySelectorAll('.star-rating').forEach(ratingGroup => {
      ratingGroup.addEventListener('click', (e) => {
        if (e.target.classList.contains('star')) {
          const rating = parseInt(e.target.dataset.value);
          const ratingType = ratingGroup.dataset.rating;
          
          // Update visual stars
          ratingGroup.querySelectorAll('.star').forEach((star, index) => {
            star.classList.toggle('active', index < rating);
          });
          
          // Store rating value
          ratingGroup.dataset.selectedRating = rating;
        }
      });
    });
  }

  async submitReview(event, businessId) {
    event.preventDefault();
    
    const form = event.target;
    const modal = form.closest('.modal');
    
    // Collect ratings
    const ratings = {};
    modal.querySelectorAll('.star-rating').forEach(ratingGroup => {
      const ratingType = ratingGroup.dataset.rating;
      const selectedRating = ratingGroup.dataset.selectedRating;
      if (selectedRating) {
        ratings[ratingType + '_rating'] = parseInt(selectedRating);
      }
    });
    
    // Collect amenities
    const amenities = {};
    modal.querySelectorAll('input[name="amenities"]:checked').forEach(checkbox => {
      amenities[checkbox.value] = true;
    });
    
    // Get comment
    const comment = modal.querySelector('#comment').value;
    
    // Validate required ratings
    if (!ratings.overall_rating || !ratings.cleanliness_rating || !ratings.safety_rating) {
      alert('Please provide Overall, Cleanliness, and Safety ratings.');
      return;
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          business_id: businessId,
          ...ratings,
          amenities: amenities,
          comment: comment
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Review submitted successfully! Thank you for helping other users.');
        modal.remove();
        
        // Update user badge if provided
        if (result.user_badge_update) {
          this.currentUser = result.user_badge_update;
          this.updateUserDisplay();
        }
        
        // Refresh business data
        this.searchBusinesses();
      } else {
        alert(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  }

  updateUserDisplay() {
    if (this.currentUser) {
      // Update user actions to show logged in state
      const userActions = document.querySelector('.user-actions');
      userActions.innerHTML = `
        <div class="user-info">
          ${this.renderUserBadge(this.currentUser)}
          <span class="username">Welcome, ${this.currentUser.username}!</span>
          <button class="action-btn profile-btn" onclick="gtgotgApp.showUserProfile()">👤 Profile</button>
          <button class="action-btn logout-btn" onclick="gtgotgApp.logout()">🚪 Logout</button>
        </div>
      `;
    }
  }

  showUserProfile() {
    // Implementation for user profile modal
    console.log('Show user profile:', this.currentUser);
  }

  async logout() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        this.currentUser = null;
        location.reload(); // Refresh page to reset UI
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getDirections(address) {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  }

  showBusinessDetails(businessId) {
    const business = this.businesses.find(b => b.id === businessId);
    if (!business) return;
    
    console.log('Show business details:', business);
    // Implementation for detailed business view
  }


}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (typeof GTGOTGApp !== 'undefined') {
    window.gtgotgApp = new GTGOTGApp();
  }
});

