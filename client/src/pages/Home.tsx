import { useState, useEffect, useMemo } from "react";
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

  // Load locations (California by default)
  const { data: locations, isLoading } = trpc.locations.byState.useQuery({
    state: "CA",
    limit: 5000,
  });

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    
    let filtered = locations;
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(loc => selectedCategories.includes(loc.category));
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loc => 
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
      filtered = filtered.filter(loc => {
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
    locations.forEach(loc => {
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
              <img src={APP_LOGO} alt="GTGOTG Logo" className="w-12 h-12 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {APP_TITLE}
                </h1>
                <p className="text-sm text-purple-100">Find restrooms anywhere, anytime</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTips(!showTips)}
                className="gap-2 text-white hover:bg-purple-500"
              >
                <Lightbulb className={`w-4 h-4 ${showTips ? 'text-yellow-300' : ''}`} />
                Tips
              </Button>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-white hover:bg-purple-500"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 text-white">
                    {user?.role === "business" ? (
                      <Building2 className="w-5 h-5" />
                    ) : user?.role === "admin" ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="text-sm">{user?.name}</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = getLoginUrl()}
                    className="bg-white text-purple-600 hover:bg-purple-50"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Customer Login
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = getLoginUrl()}
                    className="bg-purple-800 text-white hover:bg-purple-900 border-purple-800"
                  >
                    <Building2 className="w-4 h-4 mr-1" />
                    Business Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tips Panel */}
      {showTips && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">How to use this app:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Click "Near Me" to find restrooms within 5 miles of your location</li>
                  <li>Use the search bar to find locations by name, address, ZIP code, city, state, or highway</li>
                  <li>Click category filters to show/hide location types</li>
                  <li>Zoom in on the map to see individual locations</li>
                  <li>Click markers for details and to leave reviews (login required)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Search and Near Me */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <Input
              type="text"
              placeholder="Search by name, address, ZIP, city, state, highway, or rest stop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-purple-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <Button
            onClick={handleNearMe}
            className={`gap-2 ${nearMeActive ? 'bg-purple-700' : 'bg-purple-600'} hover:bg-purple-700`}
          >
            <Navigation className="w-5 h-5" />
            Near Me (5 mi)
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-white shadow-lg border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-purple-700">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  {showFilters ? "Hide" : "Show"}
                </Button>
              </div>

              {showFilters && (
                <>
                  {/* Category Filters */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Categories</p>
                    {CATEGORIES.map((category) => (
                      <div key={category.name} className="flex items-center gap-3">
                        <Checkbox
                          id={category.name}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() => toggleCategory(category.name)}
                        />
                        <label
                          htmlFor={category.name}
                          className="flex-1 flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <span className="text-lg">{category.icon}</span>
                          <span className="flex-1">{category.name}</span>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                              borderColor: category.color,
                            }}
                          >
                            {stats[category.name] || 0}
                          </Badge>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                      onClick={() => setSelectedCategories(CATEGORIES.map(c => c.name))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                      onClick={() => setSelectedCategories([])}
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Statistics</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Locations:</span>
                        <span className="font-semibold text-purple-700">{locations?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Showing:</span>
                        <span className="font-semibold text-purple-700">{filteredLocations.length}</span>
                      </div>
                      {nearMeActive && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Within 5 miles:</span>
                          <span className="font-semibold text-green-600">Yes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden shadow-2xl border-purple-200">
              <div className="h-[600px] lg:h-[700px]">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-purple-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-lg font-semibold text-purple-700">Loading locations...</p>
                      <p className="text-sm text-purple-500 mt-2">Fetching bathroom data</p>
                    </div>
                  </div>
                ) : (
                  <BathroomMap
                    locations={filteredLocations}
                    selectedCategories={selectedCategories}
                  />
                )}
              </div>
            </Card>

            {/* Info Banner */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg text-white">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">313,590 Restroom Locations Nationwide</p>
                  <p className="text-sm text-purple-100">
                    {nearMeActive 
                      ? `Showing ${filteredLocations.length} locations within 5 miles of you`
                      : "Currently showing California. Use search or pan the map to explore other states!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-purple-900 text-purple-100 py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2025 {APP_TITLE} - Find restrooms anywhere, anytime</p>
          <p className="mt-1 text-xs text-purple-300">
            Data sources: OpenStreetMap contributors, State DOT, NREL
          </p>
        </div>
      </footer>
    </div>
  );
}
