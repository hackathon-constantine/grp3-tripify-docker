"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, Search, Globe, Star, Navigation } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useT } from "@/hooks/useT";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export interface DestinationOption {
  id: string;
  name: string;
  country: string;
  continent: string;
  coordinates: { lat: number; lng: number };
  description: string;
  activities: string[];
  avgStayDays: number;
  bestMonths: string[];
  emoji: string;
  popularity: number; // 1-5 stars
}

interface DestinationPickerProps {
  destinations: DestinationOption[];
  selectedDestination: string;
  onSelect: (destinationId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced destinations data with coordinates and better structure
const enhancedDestinations: DestinationOption[] = [
  {
    id: "paris-france",
    name: "Paris",
    country: "France",
    continent: "Europe",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    description: "City of Light with iconic landmarks and romantic atmosphere",
    activities: ["museums", "dining", "architecture", "shopping"],
    avgStayDays: 4,
    bestMonths: ["Apr", "May", "Sep", "Oct"],
    emoji: "🇫🇷",
    popularity: 5,
  },
  {
    id: "london-uk",
    name: "London",
    country: "United Kingdom",
    continent: "Europe",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    description: "Historic capital with royal palaces and modern culture",
    activities: ["history", "museums", "theater", "shopping"],
    avgStayDays: 3,
    bestMonths: ["May", "Jun", "Jul", "Aug", "Sep"],
    emoji: "🇬🇧",
    popularity: 5,
  },
  {
    id: "dubai-uae",
    name: "Dubai",
    country: "United Arab Emirates",
    continent: "Asia",
    coordinates: { lat: 25.2048, lng: 55.2708 },
    description: "Futuristic city with luxury shopping and desert adventures",
    activities: ["luxury", "shopping", "desert", "nightlife"],
    avgStayDays: 4,
    bestMonths: ["Nov", "Dec", "Jan", "Feb", "Mar"],
    emoji: "🇦🇪",
    popularity: 4,
  },
  {
    id: "tokyo-japan",
    name: "Tokyo",
    country: "Japan",
    continent: "Asia",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    description: "Modern metropolis blending tradition with innovation",
    activities: ["culture", "food", "technology", "temples"],
    avgStayDays: 5,
    bestMonths: ["Mar", "Apr", "May", "Oct", "Nov"],
    emoji: "🇯🇵",
    popularity: 5,
  },
  {
    id: "istanbul-turkey",
    name: "Istanbul",
    country: "Turkey",
    continent: "Europe/Asia",
    coordinates: { lat: 41.0082, lng: 28.9784 },
    description: "Cultural bridge between Europe and Asia with rich history",
    activities: ["history", "culture", "food", "bazaars"],
    avgStayDays: 3,
    bestMonths: ["Apr", "May", "Sep", "Oct"],
    emoji: "🇹🇷",
    popularity: 4,
  },
  {
    id: "marrakech-tlemcen",
    name: "Marrakech",
    country: "Tlemcen",
    continent: "Africa",
    coordinates: { lat: 31.6295, lng: -7.9811 },
    description: "Imperial city with vibrant souks and desert gateway",
    activities: ["culture", "markets", "desert", "architecture"],
    avgStayDays: 3,
    bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    emoji: "🇲🇦",
    popularity: 4,
  },
  {
    id: "cairo-egypt",
    name: "Cairo",
    country: "Egypt",
    continent: "Africa",
    coordinates: { lat: 30.0444, lng: 31.2357 },
    description: "Ancient capital with pyramids and Nile River",
    activities: ["history", "archaeology", "culture", "museums"],
    avgStayDays: 3,
    bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    emoji: "🇪🇬",
    popularity: 4,
  },
  {
    id: "algiers-algeria",
    name: "Algiers",
    country: "Algeria",
    continent: "Africa",
    coordinates: { lat: 36.7538, lng: 3.0588 },
    description: "White city overlooking the Mediterranean Sea",
    activities: ["history", "architecture", "coastal", "culture"],
    avgStayDays: 2,
    bestMonths: ["Apr", "May", "Sep", "Oct", "Nov"],
    emoji: "🇩🇿",
    popularity: 3,
  },
  {
    id: "oran-algeria",
    name: "Oran",
    country: "Algeria",
    continent: "Africa",
    coordinates: { lat: 35.6969, lng: -0.6331 },
    description: "Coastal port city with Spanish colonial architecture",
    activities: ["coastal", "architecture", "music", "culture"],
    avgStayDays: 2,
    bestMonths: ["Apr", "May", "Jun", "Sep", "Oct"],
    emoji: "🇩🇿",
    popularity: 3,
  },
  {
    id: "constantine-algeria",
    name: "Constantine",
    country: "Algeria",
    continent: "Africa",
    coordinates: { lat: 36.365, lng: 6.6147 },
    description: "City of bridges built on dramatic rocky outcrops",
    activities: ["architecture", "history", "nature", "bridges"],
    avgStayDays: 2,
    bestMonths: ["Apr", "May", "Sep", "Oct", "Nov"],
    emoji: "🇩🇿",
    popularity: 3,
  },
  {
    id: "tamanrasset-algeria",
    name: "Tamanrasset",
    country: "Algeria",
    continent: "Africa",
    coordinates: { lat: 22.7851, lng: 5.5228 },
    description: "Gateway to the Sahara with Tuareg culture",
    activities: ["desert", "culture", "adventure", "nature"],
    avgStayDays: 3,
    bestMonths: ["Nov", "Dec", "Jan", "Feb", "Mar"],
    emoji: "🇩🇿",
    popularity: 2,
  },
  {
    id: "new-york-usa",
    name: "New York",
    country: "United States",
    continent: "North America",
    coordinates: { lat: 40.7128, lng: -74.006 },
    description: "The city that never sleeps with iconic skyline",
    activities: ["culture", "museums", "shopping", "nightlife"],
    avgStayDays: 4,
    bestMonths: ["Apr", "May", "Sep", "Oct", "Nov"],
    emoji: "🇺🇸",
    popularity: 5,
  },
];

// Map component for destination selection
function DestinationMap({
  destinations,
  onDestinationSelect,
  selectedDestination,
}: {
  destinations: DestinationOption[];
  onDestinationSelect: (destination: DestinationOption) => void;
  selectedDestination: DestinationOption | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        const L = (await import("leaflet")).default;

        mapRef.current.style.height = "400px";

        const mapInstance = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([20, 0], 2);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapInstance);

        // Create custom icons based on popularity
        const createIcon = (
          destination: DestinationOption,
          isSelected: boolean
        ) => {
          const color = isSelected ? "#10b981" : "#3b82f6";
          const size = destination.popularity >= 4 ? 35 : 30;

          return L.divIcon({
            html: `<div style="background: ${color}; color: white; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; font-size: ${
              size === 35 ? "18px" : "16px"
            }; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;">${
              destination.emoji
            }</div>`,
            className: "custom-destination-marker",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
        };

        // Add markers for each destination
        destinations.forEach((destination) => {
          const isSelected = selectedDestination?.id === destination.id;
          const marker = L.marker(
            [destination.coordinates.lat, destination.coordinates.lng],
            { icon: createIcon(destination, isSelected) }
          ).addTo(mapInstance);

          const popupContent = `
            <div style="min-width: 220px; padding: 4px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 24px; margin-right: 8px;">${
                  destination.emoji
                }</span>
                <div>
                  <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${
                    destination.name
                  }</h3>
                  <p style="margin: 0; color: #666; font-size: 12px;">${
                    destination.country
                  }, ${destination.continent}</p>
                </div>
              </div>
              <p style="margin: 0 0 8px 0; color: #555; font-size: 13px; line-height: 1.4;">${
                destination.description
              }</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center;">
                  ${Array.from(
                    { length: destination.popularity },
                    () => "⭐"
                  ).join("")}
                </div>
                <span style="background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 8px; font-size: 11px;">${
                  destination.avgStayDays
                } days avg</span>
              </div>
              <div style="display: flex; flex-wrap: gap: 4px;">
                ${destination.activities
                  .slice(0, 3)
                  .map(
                    (activity) =>
                      `<span style="background: #e0e7ff; color: #3730a3; padding: 1px 6px; border-radius: 8px; font-size: 10px;">${activity}</span>`
                  )
                  .join("")}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on("click", () => onDestinationSelect(destination));
        });

        setTimeout(() => {
          mapInstance.invalidateSize();
          setIsLoading(false);
        }, 500);

        setMap(mapInstance);
      } catch (error) {
        console.error("Error initializing map:", error);
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Update markers when selection changes
  useEffect(() => {
    if (!map) return;

    // Remove existing markers and re-add with updated selection
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Re-add all markers with updated selection state
    import("leaflet").then((L) => {
      const createIcon = (
        destination: DestinationOption,
        isSelected: boolean
      ) => {
        const color = isSelected ? "#10b981" : "#3b82f6";
        const size = destination.popularity >= 4 ? 35 : 30;

        return L.divIcon({
          html: `<div style="background: ${color}; color: white; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; font-size: ${
            size === 35 ? "18px" : "16px"
          }; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;">${
            destination.emoji
          }</div>`,
          className: "custom-destination-marker",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      };

      destinations.forEach((destination) => {
        const isSelected = selectedDestination?.id === destination.id;
        const marker = L.marker(
          [destination.coordinates.lat, destination.coordinates.lng],
          { icon: createIcon(destination, isSelected) }
        ).addTo(map);

        marker.on("click", () => onDestinationSelect(destination));
      });
    });
  }, [map, selectedDestination, destinations]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading destinations...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ height: "400px", width: "100%" }}
      />
    </div>
  );
}

export function DestinationPicker({
  destinations = enhancedDestinations,
  selectedDestination,
  onSelect,
  isOpen,
  onClose,
}: DestinationPickerProps) {
  const t = useT();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
  const [selectedDestinationObj, setSelectedDestinationObj] =
    useState<DestinationOption | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("map");

  const continents = Array.from(
    new Set(destinations.map((d) => d.continent))
  ).sort();

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContinent =
      selectedContinent === "all" ||
      destination.continent === selectedContinent;
    return matchesSearch && matchesContinent;
  });

  const handleDestinationSelect = (destination: DestinationOption) => {
    setSelectedDestinationObj(destination);
    // Don't call onSelect immediately - wait for confirmation
  };

  const handleConfirm = () => {
    if (selectedDestinationObj) {
      onSelect(selectedDestinationObj.id);
      onClose();
    }
  };

  useEffect(() => {
    if (selectedDestination) {
      const dest = destinations.find((d) => d.id === selectedDestination);
      setSelectedDestinationObj(dest || null);
    }
  }, [selectedDestination, destinations]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t("builder.destinationPicker.title")}
              </h2>
              <p className="text-gray-600">
                {t("builder.destinationPicker.subtitle", {
                  count: destinations.length,
                })}
              </p>
            </div>
            <Button variant="ghost" onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("builder.destinationPicker.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">
                {t("builder.destinationPicker.allContinents")}
              </option>
              {continents.map((continent) => (
                <option key={continent} value={continent}>
                  {continent}
                </option>
              ))}
            </select>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "map"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                {t("builder.destinationPicker.map")}
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Globe className="w-4 h-4 inline mr-1" />
                {t("builder.destinationPicker.list")}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[500px]">
          {/* Main View */}
          <div className="flex-1">
            {viewMode === "map" ? (
              <DestinationMap
                destinations={filteredDestinations}
                onDestinationSelect={handleDestinationSelect}
                selectedDestination={selectedDestinationObj}
              />
            ) : (
              <div className="h-full overflow-y-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDestinations.map((destination) => (
                    <Card
                      key={destination.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedDestinationObj?.id === destination.id
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleDestinationSelect(destination)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {destination.emoji}
                            </span>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {destination.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {destination.country}
                              </p>
                            </div>
                          </div>
                          <div className="flex">
                            {Array.from(
                              { length: destination.popularity },
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                />
                              )
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {destination.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {destination.activities
                            .slice(0, 3)
                            .map((activity) => (
                              <Badge
                                key={activity}
                                variant="secondary"
                                className="text-xs"
                              >
                                {activity}
                              </Badge>
                            ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {destination.avgStayDays}{" "}
                            {t("builder.destinationPicker.daysRecommended")}
                          </span>
                          <span>{destination.continent}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Destination Details */}
          {selectedDestinationObj && (
            <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {selectedDestinationObj.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedDestinationObj.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedDestinationObj.country},{" "}
                    {selectedDestinationObj.continent}
                  </p>
                  <div className="flex justify-center mt-2">
                    {Array.from(
                      { length: selectedDestinationObj.popularity },
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t("builder.destinationPicker.description")}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {selectedDestinationObj.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t("builder.destinationPicker.popularActivities")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDestinationObj.activities.map((activity) => (
                        <Badge
                          key={activity}
                          variant="outline"
                          className="text-xs"
                        >
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t("builder.destinationPicker.bestTimeToVisit")}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDestinationObj.bestMonths.map((month) => (
                        <Badge
                          key={month}
                          className="text-xs bg-green-100 text-green-800"
                        >
                          {month}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-blue-700 text-sm">
                      <Navigation className="w-4 h-4 mr-2" />
                      <span>
                        {t("builder.destinationPicker.recommendedStay")}:{" "}
                        {selectedDestinationObj.avgStayDays}{" "}
                        {t("builder.destinationPicker.days")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedDestinationObj ? (
                <span>
                  {t("builder.destinationPicker.selected")}:{" "}
                  <strong>
                    {selectedDestinationObj.name},{" "}
                    {selectedDestinationObj.country}
                  </strong>
                </span>
              ) : (
                <span>{t("builder.destinationPicker.selectDestination")}</span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                {t("builder.destinationPicker.cancel")}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedDestinationObj}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("builder.destinationPicker.confirmSelection")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
