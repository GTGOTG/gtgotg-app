import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import BathroomMap from "@/components/BathroomMap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { APP_TITLE, APP_LOGO, getLoginUrl } from "@/const";
import { MapPin, Filter, Info, Lightbulb, Navigation, Search, User, Building2, Shield } from "lucide-react";
import { Link } from "wouter";

const CATEGORIES = [
  { name: "Rest Area", color: "#8B5CF6", icon: "🛣️" },
  { name: "Gas Station/Fuel", color: "#A78BFA", icon: "⛽" },
  { name: "Restaurant/Food", color: "#C4B5FD", icon: "🍔" },
  { name: "Bar/Pub/Tavern", color: "#DDD6FE", icon: "🍺" },
  { name: "Public Building", color: "#9333EA", icon: "🏛️" },
  { name: "Park/Recreation", color: "#7C3AED", icon: "🌳" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [mapBounds, setMapBounds] = useState<{minLat: number; maxLat: number; minLng: number; maxLng: number} | null>(null);

  // Load locations based on map viewport (defaults to USA bounds)
  const { data: locations, isLoading } = trpc.locations.inBounds.useQuery(
    mapBounds || { minLat: 24, maxLat: 50, minLng: -125, maxLng: -66 }, // USA bounds
    { enabled: true }
  );

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    
    let filtered = locations;
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((loc: any) => selectedCategories.includes(loc.category));
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((loc: any) => 
        loc.name.toLowerCase().includes(query) ||
        loc.category.toLowerCase().includes(query) ||
        (loc.state && loc.state.toLowerCase().includes(query)) ||
        (loc.city && loc.city.toLowerCase().includes(query)) ||
        (loc.street && loc.street.toLowerCase().includes(query)) ||
        (loc.postcode && loc.postcode.includes(query))
      );
    }
    
    // Filter by "Near Me" (5-mile radius)
    if (nearMeActive && userLocation) {
      filtered = filtered.filter((loc: any) => {
        const lat = parseFloat(loc.latitude);
        const lng = parseFloat(loc.longitude);
        if (isNaN(lat) || isNaN(lng)) return false;
        
        // Haversine formula for distance calculation
        const R = 3959; // Earth's radius in miles
        const dLat = (lat - userLocation.lat) * Math.PI / 180;
        const dLng = (lng - userLocation.lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance <= 5; // 5-mile radius
      });
    }
    
    return filtered;
  }, [locations, selectedCategories, searchQuery, nearMeActive, userLocation]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setNearMeActive(true);
        },
        (error) => {
          alert("Unable to get your location. Please enable location services.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const stats = useMemo(() => {
    if (!locations) return {};
    const counts: Record<string, number> = {};
    locations.forEach((loc: any) => {
      counts[loc.category] = (counts[loc.category] || 0) + 1;
    });
    return counts;
  }, [locations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="GTGOTG Logo" className="w-10 h-10 rounded-lg" />
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {APP_TITLE}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTips(!showTips)}
                className="gap-2 text-white hover:bg-purple-500 hidden md:flex"
              >
                <Lightbulb className={`w-4 h-4 ${showTips ? 'text-yellow-300' : ''}`} />
                Tips
              </Button>
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-purple-500">
                        <Shield className="w-4 h-4" />
                        <span className="hidden md:inline">Admin</span>
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 text-white text-sm">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user?.name}</span>
                  </div>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-purple-500">
                      <User className="w-4 h-4" />
                      <span className="hidden md:inline">Customer Login</span>
                    </Button>
                  </a>
                  <a href={getLoginUrl()}>
                    <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-purple-500">
                      <Building2 className="w-4 h-4" />
                      <span className="hidden md:inline">Business Login</span>
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tips Panel */}
      {showTips && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">💡 Quick Tips:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Use the search bar to find restrooms by city, state, ZIP code, or business name</li>
                  <li>Click "Near Me" to find restrooms within 5 miles of your location</li>
                  <li>Filter by category to find specific types of locations</li>
                  <li>Click on map markers to see details and reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-white shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-purple-900">Filters</h2>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, address, ZIP, city, state, highway, or rest stop..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>

              <Button
                onClick={handleNearMe}
                className="w-full mb-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Near Me (5 mi)
              </Button>

              {/* Categories */}
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
                {CATEGORIES.map(category => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={category.name}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={() => toggleCategory(category.name)}
                      />
                      <label
                        htmlFor={category.name}
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </label>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stats[category.name] || 0}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategories(CATEGORIES.map(c => c.name))}
                  className="flex-1"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="flex-1"
                >
                  Clear All
                </Button>
              </div>

              {/* Statistics */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Statistics</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Locations:</span>
                    <span className="font-semibold text-purple-600">{locations?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Showing:</span>
                    <span className="font-semibold text-purple-600">{filteredLocations.length}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden shadow-md">
              <div className="h-[500px] md:h-[600px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center bg-purple-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-purple-600 font-medium">Loading locations...</p>
                      <p className="text-sm text-purple-400">Fetching bathroom data</p>
                    </div>
                  </div>
                ) : (
                  <BathroomMap locations={filteredLocations} onBoundsChange={setMapBounds} />
                )}
              </div>
            </Card>

            {/* Info Banner */}
            <div className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white shadow-md">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-lg">313,590 Restroom Locations Nationwide</p>
                  <p className="text-sm text-purple-100">Currently showing {filteredLocations.length} locations. Use search or pan the map to explore other states!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
