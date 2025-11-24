import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Location {
  id: number;
  name: string;
  category: string;
  latitude: string;
  longitude: string;
  state: string | null;
  restroomType: "public" | "customer";
}

interface BathroomMapProps {
  locations: Location[];
  onLocationClick?: (location: Location) => void;
  selectedCategories?: string[];
}

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  "Rest Area": "#3B82F6", // Blue
  "Gas Station/Fuel": "#EF4444", // Red
  "Restaurant/Food": "#F59E0B", // Orange
  "Bar/Pub/Tavern": "#8B5CF6", // Purple
  "Public Building": "#10B981", // Green
  "Park/Recreation": "#059669", // Dark Green
};

export default function BathroomMap({ locations, onLocationClick, selectedCategories }: BathroomMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create map centered on USA
    const map = L.map(containerRef.current).setView([39.8283, -98.5795], 4);

    // Add OpenStreetMap tiles (free!)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setIsLoading(false);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    // Remove existing markers
    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current);
    }

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = "small";
        if (count > 100) size = "large";
        else if (count > 10) size = "medium";

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40),
        });
      },
    });

    // Filter locations by selected categories
    const filteredLocations = selectedCategories && selectedCategories.length > 0
      ? locations.filter(loc => selectedCategories.includes(loc.category))
      : locations;

    // Add markers for each location
    filteredLocations.forEach((location) => {
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const color = CATEGORY_COLORS[location.category] || "#6B7280";
      
      // Create custom colored marker
      const icon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: "custom-marker",
        iconSize: [25, 25],
        iconAnchor: [12, 24],
      });

      const marker = L.marker([lat, lng], { icon });

      // Create popup content
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">${location.name}</h3>
          <p class="text-xs text-gray-600 mb-1">${location.category}</p>
          <p class="text-xs">
            <span class="inline-block px-2 py-0.5 rounded text-white" style="background-color: ${color}">
              ${location.restroomType === "public" ? "Public Restroom" : "Customer Restroom"}
            </span>
          </p>
          ${location.state ? `<p class="text-xs text-gray-500 mt-1">State: ${location.state}</p>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onLocationClick) {
        marker.on("click", () => onLocationClick(location));
      }

      markers.addLayer(marker);
    });

    mapRef.current.addLayer(markers);
    markersRef.current = markers;

    // Fit bounds to show all markers (if there are any)
    if (filteredLocations.length > 0 && filteredLocations.length < 1000) {
      const bounds = markers.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [locations, isLoading, onLocationClick, selectedCategories]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg shadow-lg" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
