import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import BathroomMap from "@/components/BathroomMap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_TITLE } from "@/const";
import { MapPin, Filter, Info, Lightbulb } from "lucide-react";

const CATEGORIES = [
  { name: "Rest Area", color: "#3B82F6", icon: "🛣️" },
  { name: "Gas Station/Fuel", color: "#EF4444", icon: "⛽" },
  { name: "Restaurant/Food", color: "#F59E0B", icon: "🍔" },
  { name: "Bar/Pub/Tavern", color: "#8B5CF6", icon: "🍺" },
  { name: "Public Building", color: "#10B981", icon: "🏛️" },
  { name: "Park/Recreation", color: "#059669", icon: "🌳" },
];

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userState, setUserState] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Detect user's state from geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // In a real app, you'd use reverse geocoding to get the state
          // For now, we'll default to loading all nearby locations
          console.log("User location:", position.coords);
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }
  }, []);

  // Load locations in viewport (for now, load a sample from California)
  const { data: locations, isLoading } = trpc.locations.byState.useQuery({
    state: "CA",
    limit: 5000,
  });

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    if (selectedCategories.length === 0) return locations;
    return locations.filter(loc => selectedCategories.includes(loc.category));
  }, [locations, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                🚻
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {APP_TITLE}
                </h1>
                <p className="text-sm text-gray-600">Find restrooms anywhere, anytime</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTips(!showTips)}
              className="gap-2"
            >
              <Lightbulb className={`w-4 h-4 ${showTips ? 'text-yellow-500' : ''}`} />
              Tips
            </Button>
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
                  <li>Click on category filters below to show/hide location types</li>
                  <li>Zoom in on the map to see individual locations</li>
                  <li>Click on markers to see location details</li>
                  <li>Colored markers indicate different types of facilities</li>
                  <li>Public restrooms are free to use, customer restrooms require a purchase</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-white/90 backdrop-blur-sm shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
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
                      className="w-full"
                      onClick={() => setSelectedCategories(CATEGORIES.map(c => c.name))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
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
                        <span className="font-semibold">{locations?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Showing:</span>
                        <span className="font-semibold">{filteredLocations.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current State:</span>
                        <span className="font-semibold">CA</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Legend */}
            <Card className="mt-4 p-4 bg-white/90 backdrop-blur-sm shadow-lg">
              <h3 className="text-sm font-bold mb-3">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>Public Restroom (Free)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span>Customer Only</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden shadow-2xl">
              <div className="h-[600px] lg:h-[700px]">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-lg font-semibold text-gray-700">Loading locations...</p>
                      <p className="text-sm text-gray-500 mt-2">Fetching bathroom data</p>
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
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">313,590 Restroom Locations Nationwide</p>
                  <p className="text-sm text-blue-100">
                    Currently showing California. Pan and zoom the map to explore other states!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-white/90 backdrop-blur-sm border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 {APP_TITLE} - Find restrooms anywhere, anytime</p>
          <p className="mt-1 text-xs">
            Data sources: OpenStreetMap contributors, State DOT, NREL
          </p>
        </div>
      </footer>
    </div>
  );
}
