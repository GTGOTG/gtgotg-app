// GTGOTG - Got To Go On The Go - Main Application
class GTGOTGApp {
  constructor() {
    this.apiBaseUrl = 'https://8xhpiqclk1x1.manus.space/api';
    this.businesses = [];
    this.filteredBusinesses = [];
    this.selectedCategories = [];
    this.currentLocation = '';
    this.isLoading = false;
    
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.loadInitialData();
  }

  render() {
    const app = document.getElementById('root');
    app.innerHTML = `
      <div class="app">
        <header class="header">
          <div class="header-content">
            <div class="logo">
              <div class="logo-icon">GT</div>
              <span>GTGOTG</span>
            </div>
            <div class="search-container">
              <input 
                type="text" 
                class="search-input" 
                placeholder="Search by city, state, zip code, or 'near me'..."
                id="searchInput"
              />
              <button class="search-button" id="searchButton">Search</button>
            </div>
          </div>
        </header>
        
        <main class="main-content">
          <section class="filters-section">
            <h2 class="filters-title">Filter by Category</h2>
            <div class="category-filters" id="categoryFilters">
              <!-- Categories will be loaded here -->
            </div>
          </section>
          
          <section class="results-section">
            <div class="results-header">
              <h2 class="results-title">Restroom Locations</h2>
              <div class="results-count" id="resultsCount">Loading...</div>
            </div>
            <div id="resultsContainer">
              <!-- Results will be loaded here -->
            </div>
          </section>
        </main>
      </div>
    `;
  }

  attachEventListeners() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    searchButton.addEventListener('click', () => this.handleSearch());
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSearch();
      }
    });
  }

  async loadInitialData() {
    try {
      await this.loadCategories();
      await this.loadBusinesses('denver'); // Load Denver by default
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Show a user-friendly message
      const resultsContainer = document.getElementById('resultsContainer');
      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="error">
            <h3>Welcome to GTGOTG!</h3>
            <p>Enter a location to search for restrooms near you.</p>
          </div>
        `;
      }
    }
  }

  async loadCategories() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const categories = await response.json();
      
      const categoriesContainer = document.getElementById('categoryFilters');
      if (categoriesContainer && categories && categories.length > 0) {
        categoriesContainer.innerHTML = categories.map(category => `
          <button 
            class="category-button" 
            data-category="${category.name.toLowerCase()}"
            onclick="app.toggleCategory('${category.name.toLowerCase()}')"
          >
            ${category.name}
          </button>
        `).join('');
      } else {
        // Fallback categories if API fails
        const fallbackCategories = ['Restaurant', 'Gas Station', 'Coffee Shop', 'Hotel', 'Rest Park', 'Shopping Mall'];
        if (categoriesContainer) {
          categoriesContainer.innerHTML = fallbackCategories.map(category => `
            <button 
              class="category-button" 
              data-category="${category.name.toLowerCase()}"
              onclick="app.toggleCategory('${category.name.toLowerCase()}')"
            >
              ${category.name}
            </button>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories if API fails
      const fallbackCategories = ['Restaurant', 'Gas Station', 'Coffee Shop', 'Hotel', 'Rest Park', 'Shopping Mall'];
      const categoriesContainer = document.getElementById('categoryFilters');
      if (categoriesContainer) {
        categoriesContainer.innerHTML = fallbackCategories.map(category => `
          <button 
            class="category-button" 
            data-category="${category.name.toLowerCase()}"
            onclick="app.toggleCategory('${category.name.toLowerCase()}')"
          >
            ${category.name}
          </button>
        `).join('');
      }
    }
  }

  async loadBusinesses(location = '') {
    this.setLoading(true);
    
    try {
      let url = `${this.apiBaseUrl}/search`;
      const params = new URLSearchParams();
      
      if (location) {
        params.append('location', location);
      }
      
      if (this.selectedCategories.length > 0) {
        params.append('categories', this.selectedCategories.join(','));
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      this.businesses = data.businesses || [];
      this.filteredBusinesses = [...this.businesses];
      this.currentLocation = location;
      
      this.renderResults();
    } catch (error) {
      console.error('Error loading businesses:', error);
      this.renderError('Failed to load businesses. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  async handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const location = searchInput.value.trim();
    
    if (!location) {
      alert('Please enter a location to search');
      return;
    }
    
    if (location.toLowerCase() === 'near me') {
      this.handleNearMeSearch();
    } else {
      await this.loadBusinesses(location);
    }
  }

  handleNearMeSearch() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await this.loadBusinessesByCoordinates(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enter a city or zip code instead.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Please enter a city or zip code.');
    }
  }

  async loadBusinessesByCoordinates(lat, lng) {
    this.setLoading(true);
    
    try {
      let url = `${this.apiBaseUrl}/search?lat=${lat}&lng=${lng}`;
      
      if (this.selectedCategories.length > 0) {
        url += `&categories=${this.selectedCategories.join(',')}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      this.businesses = data.businesses || [];
      this.filteredBusinesses = [...this.businesses];
      this.currentLocation = 'Near You';
      
      this.renderResults();
    } catch (error) {
      console.error('Error loading nearby businesses:', error);
      this.renderError('Failed to load nearby businesses. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  toggleCategory(category) {
    const button = document.querySelector(`[data-category="${category.name}"]`);
    
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
      button.classList.remove('active');
    } else {
      this.selectedCategories.push(category);
      button.classList.add('active');
    }
    
    this.filterBusinesses();
  }

  filterBusinesses() {
    if (this.selectedCategories.length === 0) {
      this.filteredBusinesses = [...this.businesses];
    } else {
      this.filteredBusinesses = this.businesses.filter(business => 
        this.selectedCategories.some(category => 
          business.category.name.toLowerCase().includes(category) ||
          business.subcategory?.toLowerCase().includes(category)
        )
      );
    }
    
    this.renderResults();
  }

  setLoading(loading) {
    this.isLoading = loading;
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    
    if (loading) {
      resultsContainer.innerHTML = '<div class="loading">Searching for restrooms...</div>';
      resultsCount.textContent = 'Loading...';
    }
  }

  renderResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    
    if (this.filteredBusinesses.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          <h3>No restrooms found</h3>
          <p>Try adjusting your search location or category filters.</p>
        </div>
      `;
      resultsCount.textContent = 'No results';
      return;
    }
    
    const locationText = this.currentLocation ? ` in ${this.currentLocation}` : '';
    resultsCount.textContent = `${this.filteredBusinesses.length} restroom${this.filteredBusinesses.length !== 1 ? 's' : ''} found${locationText}`;
    
    resultsContainer.innerHTML = `
      <div class="business-grid">
        ${this.filteredBusinesses.map(business => this.renderBusinessCard(business)).join('')}
      </div>
    `;
  }

  renderBusinessCard(business) {
    const safetyLevel = this.getSafetyLevel(business.safety_rating);
    const stars = this.renderStars(business.overall_rating);
    const amenities = this.getAmenities(business);
    
    return `
      <div class="business-card">
        <div class="business-header">
          <div>
            <h3 class="business-name">${business.name}</h3>
            <div class="business-category">${business.category}</div>
          </div>
          <div class="safety-badge ${safetyLevel.class}">${safetyLevel.text}</div>
        </div>
        
        <div class="business-address">${business.address}</div>
        
        <div class="ratings-container">
          <div class="rating-item">
            <span class="rating-label">Overall:</span>
            <span class="rating-value">${business.overall_rating || 'N/A'}</span>
            <span class="stars">${stars}</span>
          </div>
          <div class="rating-item">
            <span class="rating-label">Cleanliness:</span>
            <span class="rating-value">${business.cleanliness_rating || 'N/A'}/5</span>
          </div>
          <div class="rating-item">
            <span class="rating-label">Safety:</span>
            <span class="rating-value">${business.safety_rating || 'N/A'}/5</span>
          </div>
        </div>
        
        ${amenities.length > 0 ? `
          <div class="amenities">
            ${amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
          </div>
        ` : ''}
        
        <div class="business-actions">
          <button class="action-button" onclick="app.getDirections('${business.address}')">
            Get Directions
          </button>
          <button class="action-button secondary" onclick="app.showDetails('${business.id}')">
            View Details
          </button>
        </div>
      </div>
    `;
  }

  getSafetyLevel(rating) {
    if (!rating) return { text: 'UNRATED', class: '' };
    
    if (rating >= 4.0) return { text: 'SAFE', class: '' };
    if (rating >= 3.0) return { text: 'CAUTION', class: 'warning' };
    return { text: 'UNSAFE', class: 'danger' };
  }

  renderStars(rating) {
    if (!rating) return '';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }
    
    if (hasHalfStar) {
      stars += '☆';
    }
    
    return stars;
  }

  getAmenities(business) {
    const amenities = [];
    
    if (business.is_accessible) amenities.push('Wheelchair Accessible');
    if (business.has_changing_table) amenities.push('Changing Table');
    if (business.is_unisex) amenities.push('Unisex');
    if (business.is_24_hour) amenities.push('24 Hours');
    
    return amenities;
  }

  getDirections(address) {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(url, '_blank');
  }

  showDetails(businessId) {
    const business = this.businesses.find(b => b.id == businessId);
    if (business) {
      alert(`Details for ${business.name}:\n\nAddress: ${business.address}\nCategory: ${business.category}\nSafety Rating: ${business.safety_rating || 'N/A'}/5\nCleanliness Rating: ${business.cleanliness_rating || 'N/A'}/5\n\nNote: Detailed view coming soon!`);
    }
  }

  renderError(message) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsContainer.innerHTML = `<div class="error">${message}</div>`;
    resultsCount.textContent = 'Error';
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new GTGOTGApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GTGOTGApp;
}

