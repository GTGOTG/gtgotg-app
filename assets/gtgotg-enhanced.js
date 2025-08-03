// GTGOTG Enhanced App with Business Owner Portal
class GTGOTGApp {
  constructor() {
    this.apiBaseUrl = '/api';
    this.currentUser = null;
    this.currentBusinessOwner = null;
    this.searchResults = [];
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

    // Category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterByCategory(e.target.textContent.trim());
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
        case 'help':
          this.showHelpModal();
          break;
      }
    });
  }

  async loadDefaultResults() {
    try {
      const response = await fetch('/api/osm/search?query=denver&category=all');
      const data = await response.json();
      
      if (data.businesses) {
        this.searchResults = data.businesses;
        this.displayResults(this.searchResults);
      }
    } catch (error) {
      console.error('Error loading default results:', error);
    }
  }

  async performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    try {
      const response = await fetch(`/api/osm/search?query=${encodeURIComponent(query)}&category=all`);
      const data = await response.json();
      
      if (data.businesses) {
        this.searchResults = data.businesses;
        this.displayResults(this.searchResults);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  displayResults(businesses) {
    const container = document.getElementById('resultsContainer');
    
    if (!businesses || businesses.length === 0) {
      container.innerHTML = '<p>No restrooms found. Try a different search term.</p>';
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
              <span>🧽 Cleanliness:</span>
              <span>${business.cleanliness_rating}/5</span>
            </div>
            <div class="rating-detail">
              <span>🔒 Safety:</span>
              <span>${business.safety_rating}/5</span>
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
      { key: 'toilet_paper', label: '🧻 Toilet Paper', icon: '🧻' },
      { key: 'soap_dispenser', label: '🧼 Soap', icon: '🧼' },
      { key: 'paper_towels', label: '📄 Paper Towels', icon: '📄' },
      { key: 'hand_dryer', label: '💨 Hand Dryer', icon: '💨' },
      { key: 'baby_changing', label: '👶 Baby Changing', icon: '👶' },
      { key: 'wheelchair_accessible', label: '♿ Accessible', icon: '♿' }
    ];

    return amenityList.map(amenity => {
      const status = amenities && amenities[amenity.key];
      const statusIcon = status === true ? '✅' : status === false ? '❌' : '❓';
      const statusClass = status === true ? 'available' : status === false ? 'unavailable' : 'unknown';
      
      return `
        <div class="amenity-item ${statusClass}">
          <span class="amenity-icon">${amenity.icon}</span>
          <span class="amenity-status">${statusIcon}</span>
        </div>
      `;
    }).join('');
  }

  showBusinessOwnerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal business-owner-modal';
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
            <div class="benefits-list">
              <div class="benefit-item">
                <span class="benefit-icon">💬</span>
                <div>
                  <h5>Respond to Reviews</h5>
                  <p>Engage with customers and show you care about their experience</p>
                </div>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">🏆</span>
                <div>
                  <h5>Earn Business Badges</h5>
                  <p>Get recognized for excellent customer service and responsiveness</p>
                </div>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">📊</span>
                <div>
                  <h5>Track Performance</h5>
                  <p>Monitor your ratings, reviews, and customer satisfaction metrics</p>
                </div>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">📸</span>
                <div>
                  <h5>Upload Photos</h5>
                  <p>Showcase your clean, well-maintained restroom facilities</p>
                </div>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">🎯</span>
                <div>
                  <h5>Improve Visibility</h5>
                  <p>Verified businesses get priority placement in search results</p>
                </div>
              </div>
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
        document.querySelector('.business-owner-modal').remove();
        this.showBusinessOwnerDashboard();
        alert('Welcome to your Business Owner Dashboard!');
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
        document.querySelector('.business-owner-modal [data-tab="login"]').click();
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Business owner registration error:', error);
      alert('Registration failed. Please try again.');
    }
  }

  showBusinessOwnerDashboard() {
    const dashboard = document.createElement('div');
    dashboard.className = 'business-owner-dashboard';
    dashboard.innerHTML = `
      <div class="dashboard-overlay">
        <div class="dashboard-content">
          <div class="dashboard-header">
            <h2>🏢 Business Owner Dashboard</h2>
            <div class="owner-info">
              ${this.renderBusinessOwnerBadge(this.currentBusinessOwner)}
              <span class="owner-name">${this.currentBusinessOwner.first_name} ${this.currentBusinessOwner.last_name}</span>
              <button class="close-dashboard" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">✕</button>
            </div>
          </div>

          <div class="dashboard-tabs">
            <button class="dashboard-tab active" data-tab="overview">📊 Overview</button>
            <button class="dashboard-tab" data-tab="businesses">🏢 My Businesses</button>
            <button class="dashboard-tab" data-tab="reviews">💬 Reviews</button>
            <button class="dashboard-tab" data-tab="settings">⚙️ Settings</button>
          </div>

          <div class="dashboard-panels">
            <div class="dashboard-panel active" id="overview-panel">
              <div class="stats-grid">
                <div class="stat-card">
                  <h4>Total Businesses</h4>
                  <div class="stat-value">${this.currentBusinessOwner.claimed_businesses.length}</div>
                </div>
                <div class="stat-card">
                  <h4>Total Responses</h4>
                  <div class="stat-value">${this.currentBusinessOwner.response_count}</div>
                </div>
                <div class="stat-card">
                  <h4>Avg Response Time</h4>
                  <div class="stat-value">${this.currentBusinessOwner.avg_response_time.toFixed(1)}h</div>
                </div>
                <div class="stat-card">
                  <h4>Customer Satisfaction</h4>
                  <div class="stat-value">${this.currentBusinessOwner.customer_satisfaction.toFixed(1)}/5</div>
                </div>
              </div>
              
              <div class="badge-progress">
                <h4>Your Badge Status</h4>
                <div class="current-badge">
                  <span class="badge-icon">${this.currentBusinessOwner.badge_icon}</span>
                  <span class="badge-name">${this.currentBusinessOwner.badge_level}</span>
                </div>
                <p class="badge-description">${this.currentBusinessOwner.badge_description}</p>
              </div>
            </div>

            <div class="dashboard-panel" id="businesses-panel">
              <h4>My Claimed Businesses</h4>
              <div id="businessesList">Loading businesses...</div>
              <button class="action-btn claim-new-btn" onclick="gtgotgApp.showClaimBusinessForm()">➕ Claim New Business</button>
            </div>

            <div class="dashboard-panel" id="reviews-panel">
              <h4>Recent Reviews</h4>
              <div id="reviewsList">Loading reviews...</div>
            </div>

            <div class="dashboard-panel" id="settings-panel">
              <h4>Account Settings</h4>
              <form id="businessOwnerSettingsForm">
                <div class="form-row">
                  <input type="text" value="${this.currentBusinessOwner.first_name}" placeholder="First Name" />
                  <input type="text" value="${this.currentBusinessOwner.last_name}" placeholder="Last Name" />
                </div>
                <input type="email" value="${this.currentBusinessOwner.email}" placeholder="Email" readonly />
                <input type="tel" value="${this.currentBusinessOwner.phone || ''}" placeholder="Phone Number" />
                <input type="text" value="${this.currentBusinessOwner.company_name || ''}" placeholder="Company Name" />
                <button type="submit" class="submit-btn">Update Profile</button>
              </form>
              
              <div class="danger-zone">
                <h5>Account Actions</h5>
                <button class="danger-btn" onclick="gtgotgApp.logoutBusinessOwner()">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dashboard);

    // Add tab switching
    dashboard.querySelectorAll('.dashboard-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        dashboard.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active panel
        dashboard.querySelectorAll('.dashboard-panel').forEach(p => p.classList.remove('active'));
        dashboard.querySelector(`#${tabName}-panel`).classList.add('active');
        
        // Load data for the selected tab
        this.loadDashboardData(tabName);
      });
    });

    // Load initial data
    this.loadDashboardData('overview');
  }

  renderBusinessOwnerBadge(owner) {
    if (!owner) return '';
    
    return `
      <div class="business-owner-badge" style="color: ${owner.badge_color}">
        <span class="badge-icon">${owner.badge_icon}</span>
        <span class="badge-text">${owner.badge_level}</span>
      </div>
    `;
  }

  async loadDashboardData(tabName) {
    switch (tabName) {
      case 'businesses':
        await this.loadMyBusinesses();
        break;
      case 'reviews':
        await this.loadRecentReviews();
        break;
    }
  }

  async loadMyBusinesses() {
    try {
      const response = await fetch('/api/business-owner/my-businesses', {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const container = document.getElementById('businessesList');
        if (result.businesses.length === 0) {
          container.innerHTML = '<p>No businesses claimed yet. Claim your first business to get started!</p>';
        } else {
          container.innerHTML = result.businesses.map(business => `
            <div class="business-card owner-view">
              <h5>${business.name}</h5>
              <p>${business.address}</p>
              <div class="business-stats">
                <span>📊 ${business.total_reviews} reviews</span>
                <span>⭐ ${business.average_ratings.overall}/5 overall</span>
              </div>
              <div class="business-actions">
                <button onclick="gtgotgApp.viewBusinessDetails('${business.id}')">View Details</button>
                <button onclick="gtgotgApp.respondToReviews('${business.id}')">Respond to Reviews</button>
              </div>
            </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  }

  async loadRecentReviews() {
    const container = document.getElementById('reviewsList');
    container.innerHTML = '<p>Recent reviews functionality coming soon...</p>';
  }

  showClaimBusinessForm() {
    alert('Claim business functionality coming soon! For now, businesses are automatically approved.');
  }

  async logoutBusinessOwner() {
    try {
      const response = await fetch('/api/business-owner/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        this.currentBusinessOwner = null;
        document.querySelector('.business-owner-dashboard').remove();
        alert('Logged out successfully!');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Placeholder methods for other functionality
  showLoginModal() {
    alert('User login functionality available - check existing implementation');
  }

  showSignupModal() {
    alert('User signup functionality available - check existing implementation');
  }

  showHelpModal() {
    alert('Help modal functionality coming soon');
  }

  showReviewModal(businessId) {
    alert(`Review modal for business ${businessId} - functionality available in existing implementation`);
  }

  showDirections(address) {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  }

  filterByCategory(category) {
    console.log(`Filtering by category: ${category}`);
    // Category filtering logic would go here
  }

  viewBusinessDetails(businessId) {
    alert(`Business details for ${businessId} - functionality coming soon`);
  }

  respondToReviews(businessId) {
    alert(`Respond to reviews for ${businessId} - functionality coming soon`);
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.gtgotgApp = new GTGOTGApp();
});

