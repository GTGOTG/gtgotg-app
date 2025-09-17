# 🚽 Got To Go On The Go (GTGOTG)

**Smart Restroom Finder for Travelers**

Find clean, safe, and accessible restrooms anywhere in the USA. Specializing in truck stops, rest areas, gas stations, and other traveler-friendly locations.

## 🌟 Features

### 🎯 **Smart Location Targeting**
- **Truck Stops & Rest Areas**: Priority focus for long-distance travelers
- **Gas Stations**: Always have public restrooms
- **Chain Restaurants**: McDonald's, Starbucks, and other reliable options
- **Shopping Centers**: Malls, supermarkets, and retail locations
- **Hotels & Lodging**: Clean facilities for travelers

### 🗺️ **Interactive Map**
- Compact map view with expand functionality
- Real-time location markers with custom icons
- Click-to-focus on specific locations
- Distance-based sorting and filtering

### 📊 **Intelligent Filtering**
- Restroom probability scoring (50-95%)
- Chain store recognition and prioritization
- Category-based filtering (truck stops, gas stations, etc.)
- Distance-based radius search (5-50km)

### 🔐 **Admin Dashboard**
- Search analytics and user activity tracking
- Review management system
- Real-time statistics and reporting
- Secure admin authentication

## 🚀 **Technology Stack**

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Data Source**: Geoapify Places API
- **Deployment**: Vercel with custom domain support
- **Analytics**: Local storage with admin dashboard

## 🌐 **Live Domains**

- **Primary**: [gtgotg.com](https://gtgotg.com)
- **Secondary**: [gottogoonthego.com](https://gottogoonthego.com)
- **App**: [gtgotg.app](https://gtgotg.app)

## 📱 **Mobile Responsive**

Fully optimized for:
- 📱 Mobile phones (iOS/Android)
- 📱 Tablets (iPad, Android tablets)
- 💻 Desktop computers
- 🖥️ Large displays

## 🎯 **Target Categories**

### **High Priority (90%+ Restroom Probability)**
- 🚛 Truck Stops (Pilot, Flying J, Love's, TA)
- 🛣️ Rest Areas & Service Plazas
- ⛽ Gas Stations (Shell, Exxon, BP, Chevron)
- 🏨 Hotels & Motels
- 🏪 Shopping Malls & Department Stores

### **Medium Priority (80%+ Restroom Probability)**
- 🍔 Fast Food Restaurants
- ☕ Coffee Shops (Starbucks, Dunkin')
- 🛒 Supermarkets (Walmart, Target, Kroger)
- 🏥 Healthcare Facilities
- 🎬 Entertainment Venues

## 🔧 **Setup & Installation**

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/gtgotg/restroom-finder.git
cd restroom-finder

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### **Environment Variables**
- `GEOAPIFY_API_KEY`: Your Geoapify API key for location data

## 📊 **API Integration**

### **Geoapify Places API**
- **Endpoint**: `https://api.geoapify.com/v2/places`
- **Features**: Business search, geocoding, category filtering
- **Coverage**: Comprehensive US business database
- **Cost**: Free tier (3,000 requests/day), paid plans available

### **Search Categories**
```javascript
const categories = [
  'commercial.gas_station',      // Gas stations
  'tourism.information.rest_area', // Rest areas
  'commercial.truck_stop',       // Truck stops
  'commercial.supermarket',      // Supermarkets
  'accommodation.hotel',         // Hotels
  'commercial.food_and_drink',   // Restaurants
  'commercial.shopping'          // Shopping centers
];
```

## 🔐 **Admin Features**

### **Dashboard Access**
- **URL**: Click "🔐 Admin" in top-right corner
- **Credentials**: admin / gtgotg2025 (change in production)

### **Analytics Tracked**
- Total searches performed
- Popular search locations
- User activity patterns
- Review submissions
- API usage statistics

## 🎨 **Design Features**

### **Visual Elements**
- Modern gradient backgrounds
- Card-based business listings
- Interactive hover effects
- Responsive grid layouts
- Custom map markers with business type icons

### **Color Scheme**
- **Primary**: #667eea (Blue gradient)
- **Secondary**: #764ba2 (Purple gradient)
- **Success**: #4CAF50 (Green)
- **Warning**: #FF9800 (Orange)
- **Error**: #c62828 (Red)

## 📈 **Performance Optimization**

- **Lazy Loading**: Map tiles and business data
- **Caching**: Local storage for search history
- **Compression**: Optimized images and assets
- **CDN**: Vercel edge network deployment
- **Mobile First**: Responsive design approach

## 🔒 **Security Features**

- **XSS Protection**: Content Security Policy headers
- **HTTPS Only**: Secure connections required
- **Input Validation**: Sanitized user inputs
- **Admin Authentication**: Secure dashboard access

## 🚀 **Deployment Guide**

### **GitHub Setup**
1. Create repository: `gtgotg/restroom-finder`
2. Push code to main branch
3. Configure GitHub Pages (optional)

### **Vercel Deployment**
1. Connect GitHub repository to Vercel
2. Configure custom domains:
   - gtgotg.com
   - gottogoonthego.com
   - gtgotg.app
3. Set environment variables
4. Deploy to production

### **Domain Configuration**
```
# DNS Records for each domain:
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## 📞 **Support & Contact**

- **Website**: [gtgotg.com](https://gtgotg.com)
- **Email**: support@gtgotg.com
- **Issues**: GitHub Issues tab

## 📄 **License**

MIT License - See LICENSE file for details

## 🙏 **Acknowledgments**

- **Geoapify**: Location data and mapping services
- **OpenStreetMap**: Map tiles and geographic data
- **Leaflet.js**: Interactive mapping library
- **Vercel**: Hosting and deployment platform

---

**Built with ❤️ for travelers who need to go on the go!** 🚽✨

---
*Last updated: September 16, 2025 - Enhanced with Geoapify integration and professional branding*

