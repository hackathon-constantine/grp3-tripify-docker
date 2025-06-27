"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Star,
  Calendar,
  Settings,
  Filter,
  Loader2,
  Route,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingModal } from "./BookingModal";
import type { Voyage } from "../../types/voyage";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React from "react";

interface MapPageProps {
  onBack: () => void;
  onVoyageSelect: (voyage: Voyage) => void;
}

interface BookingData {
  voyageId: string;
  numberOfPeople: number;
  idDocument: File | null;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
  specialRequests: string;
  totalAmount: number;
}

// Mock voyages data with coordinates
const mapVoyages: Voyage[] = [
  {
    id: "normal-1",
    type: "normal",
    title: "Tlemcen Desert Adventure",
    author: "Sarah Johnson",
    price: 890,
    duration: "7 days",
    rating: 4.8,
    image: "🏜️",
    description:
      "Explore the Sahara desert with camel rides and traditional Berber camps",
    reviews: 124,
    destination: {
      name: "Merzouga",
      coordinates: { lat: 31.0801, lng: -4.0133 },
      country: "Morocco",
    },
  },
  {
    id: "custom-1",
    type: "custom",
    title: "Personalized Tokyo Experience",
    createdBy: "Alex Chen",
    price: 1200,
    duration: "5 days",
    image: "🏯",
    description: "Custom-built itinerary based on your preferences",
    workflowLink: "/workflows/tokyo-custom-builder",
    customData: { flexibility: "high", themes: ["culture", "food"] },
    isPrivate: false,
    destination: {
      name: "Tokyo",
      coordinates: { lat: 35.6762, lng: 139.6503 },
      country: "Japan",
    },
  },
  {
    id: "normal-2",
    type: "normal",
    title: "Iceland Northern Lights",
    author: "Emma Nordic",
    price: 1200,
    duration: "5 days",
    rating: 4.7,
    image: "🌌",
    description: "Chase the aurora borealis and explore ice caves",
    reviews: 156,
    destination: {
      name: "Reykjavik",
      coordinates: { lat: 64.1466, lng: -21.9426 },
      country: "Iceland",
    },
  },
  {
    id: "custom-2",
    type: "custom",
    title: "Bespoke Swiss Alps Adventure",
    createdBy: "Mountain Guide Pro",
    price: 2200,
    duration: "8 days",
    image: "🏔️",
    description: "Fully customizable mountain adventure with personal guide",
    workflowLink: "/workflows/alps-adventure-builder",
    customData: { difficulty: "adjustable", activities: ["hiking", "skiing"] },
    isPrivate: false,
    destination: {
      name: "Zermatt",
      coordinates: { lat: 46.0207, lng: 7.7491 },
      country: "Switzerland",
    },
  },
  {
    id: "normal-3",
    type: "normal",
    title: "Greek Island Hopping",
    author: "Sofia Papadopoulos",
    price: 980,
    duration: "9 days",
    rating: 4.8,
    image: "🏛️",
    description: "Discover ancient history and pristine beaches",
    reviews: 142,
    destination: {
      name: "Santorini",
      coordinates: { lat: 36.3932, lng: 25.4615 },
      country: "Greece",
    },
  },
];

// OpenStreetMap component with route planning
export function OpenStreetMap({
  voyages,
  onVoyageSelect,
  selectedVoyage,
  showRoutes,
  userLocation,
}: {
  voyages: Voyage[];
  onVoyageSelect: (voyage: Voyage) => void;
  selectedVoyage: Voyage | null;
  showRoutes: boolean;
  userLocation: { lat: number; lng: number } | null;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<any>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This function ensures Leaflet is properly initialized
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);

        // Import Leaflet correctly with default
        const L = (await import("leaflet")).default;

        // Define the map container with explicit height
        mapRef.current.style.height = "600px";

        // Create the map with the correct element
        const mapInstance = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([40.7128, -74.006], 2);

        // Add the tile layer with HTTPS
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapInstance);

        // Create icons for markers
        const normalIcon = L.divIcon({
          html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">✈️</div>',
          className: "custom-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const customIcon = L.divIcon({
          html: '<div style="background: #7c3aed; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">⚙️</div>',
          className: "custom-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const userIcon = L.divIcon({
          html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">📍</div>',
          className: "user-marker",
          iconSize: [25, 25],
          iconAnchor: [12.5, 12.5],
        });

        // Add user location marker if available
        if (userLocation) {
          L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(mapInstance)
            .bindPopup("Your Location");
        }

        // Add markers for each voyage
        voyages.forEach((voyage) => {
          const marker = L.marker(
            [
              voyage.destination.coordinates.lat,
              voyage.destination.coordinates.lng,
            ],
            {
              icon: voyage.type === "normal" ? normalIcon : customIcon,
            }
          ).addTo(mapInstance);

          const popupContent = `
            <div style="min-width: 200px;">
              <div style="font-size: 18px; margin-bottom: 8px;">${
                voyage.image
              }</div>
              <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${
                voyage.title
              }</h3>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${
                voyage.destination.name
              }, ${voyage.destination.country}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 18px; font-weight: 700; color: #1f2937;">$${
                  voyage.price
                }</span>
                <span style="background: ${
                  voyage.type === "custom" ? "#7c3aed" : "#3b82f6"
                }; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${
            voyage.type
          }</span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on("click", () => onVoyageSelect(voyage));
        });

        // Add routes if needed
        if (showRoutes && userLocation) {
          voyages.forEach((voyage) => {
            const routeCoords: L.LatLngExpression[] = [
              [userLocation.lat, userLocation.lng],
              [
                voyage.destination.coordinates.lat,
                voyage.destination.coordinates.lng,
              ],
            ];

            const polyline = L.polyline(routeCoords, {
              color: voyage.type === "custom" ? "#7c3aed" : "#3b82f6",
              weight: 3,
              opacity: 0.7,
              dashArray: "10, 10",
            }).addTo(mapInstance);
          });
        }

        // Force the map to recalculate its size after a delay
        setTimeout(() => {
          mapInstance.invalidateSize();
          setIsLoading(false);
        }, 500);

        // Save the map instance
        setMap(mapInstance);
      } catch (error) {
        console.error("Error initializing map:", error);
        setIsLoading(false);
      }
    };

    // Initialize the map
    initializeMap();

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Update when showRoutes changes
  useEffect(() => {
    if (!map || !userLocation) return;

    // Clear existing routes
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add new routes if enabled
    if (showRoutes) {
      import("leaflet").then((L) => {
        voyages.forEach((voyage) => {
          const routeCoords: L.LatLngExpression[] = [
            [userLocation.lat, userLocation.lng],
            [
              voyage.destination.coordinates.lat,
              voyage.destination.coordinates.lng,
            ],
          ];

          const polyline = L.polyline(routeCoords, {
            color: voyage.type === "custom" ? "#7c3aed" : "#3b82f6",
            weight: 3,
            opacity: 0.7,
            dashArray: "10, 10",
          }).addTo(map);
        });
      });
    }
  }, [map, showRoutes, userLocation, voyages]);

  // Center map on selected voyage
  useEffect(() => {
    if (map && selectedVoyage) {
      map.setView(
        [
          selectedVoyage.destination.coordinates.lat,
          selectedVoyage.destination.coordinates.lng,
        ],
        8
      );

      // Force a resize event
      setTimeout(() => map.invalidateSize(), 100);
    }
  }, [map, selectedVoyage]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        id="map"
        className="w-full h-full"
        style={{ height: "600px", width: "100%" }}
      />
    </div>
  );
}

export function MapPage({ onBack, onVoyageSelect }: MapPageProps) {
  const [selectedVoyage, setSelectedVoyage] = useState<Voyage | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingVoyage, setBookingVoyage] = useState<Voyage | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Default to New York if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.006 });
        }
      );
    } else {
      // Default location if geolocation is not supported
      setUserLocation({ lat: 40.7128, lng: -74.006 });
    }
  }, []);

  const handleVoyageSelect = (voyage: Voyage) => {
    setSelectedVoyage(voyage);
  };

  const handleBookNow = (voyage: Voyage) => {
    setBookingVoyage(voyage);
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = (bookingData: BookingData) => {
    console.log("Booking completed:", bookingData);
    // Here you would typically send the booking data to your backend
    onVoyageSelect(bookingVoyage!);
  };

  return (
    <div className="h-screen flex flex-col rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Voyage Map
              </h1>
              <p className="text-sm text-gray-600">
                {mapVoyages.length} destinations worldwide
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showRoutes ? "default" : "outline"}
              onClick={() => setShowRoutes(!showRoutes)}
              className="border-gray-300 bg-transparent"
            >
              <Route className="w-4 h-4 mr-2" />
              {showRoutes ? "Hide Routes" : "Show Routes"}
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 bg-transparent"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map Container */}
        <div
          className="flex-1 relative bg-gray-200"
          style={{ minHeight: "600px", height: "100%", overflow: "hidden" }}
        >
          <OpenStreetMap
            voyages={mapVoyages}
            onVoyageSelect={handleVoyageSelect}
            selectedVoyage={selectedVoyage}
            showRoutes={showRoutes}
            userLocation={userLocation}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          {selectedVoyage ? (
            <div className="p-6">
              <Card className="border-0 shadow-none">
                <div className="p-0">
                  <div className="h-32 bg-gray-50 flex items-center justify-center mb-4 rounded-lg">
                    <div className="text-4xl">{selectedVoyage.image}</div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {selectedVoyage.title}
                        </h3>
                        <Badge
                          className={`text-xs ${
                            selectedVoyage.type === "custom"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {selectedVoyage.type}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">
                        {selectedVoyage.type === "normal"
                          ? `by ${selectedVoyage.author}`
                          : `by ${selectedVoyage.createdBy}`}
                      </p>

                      <p className="text-gray-700 text-sm">
                        {selectedVoyage.description}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {selectedVoyage.destination.name},{" "}
                          {selectedVoyage.destination.country}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedVoyage.duration}</span>
                      </div>
                      {selectedVoyage.type === "normal" && (
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>
                            {selectedVoyage.rating} ({selectedVoyage.reviews}{" "}
                            reviews)
                          </span>
                        </div>
                      )}
                      {selectedVoyage.type === "custom" && (
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>Fully customizable</span>
                        </div>
                      )}
                      {userLocation && (
                        <div className="flex items-center space-x-2">
                          <Navigation className="w-4 h-4" />
                          <span>
                            {Math.round(
                              Math.sqrt(
                                Math.pow(
                                  selectedVoyage.destination.coordinates.lat -
                                    userLocation.lat,
                                  2
                                ) +
                                  Math.pow(
                                    selectedVoyage.destination.coordinates.lng -
                                      userLocation.lng,
                                    2
                                  )
                              ) * 111
                            ).toLocaleString()}{" "}
                            km away
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            ${selectedVoyage.price}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedVoyage.type === "custom"
                              ? "starting from"
                              : "per person"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {selectedVoyage.type === "custom" && (
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() =>
                              window.open(selectedVoyage.workflowLink, "_blank")
                            }
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Customize Journey
                          </Button>
                        )}
                        <Button
                          onClick={() => handleBookNow(selectedVoyage)}
                          className={`w-full ${
                            selectedVoyage.type === "custom"
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white`}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="p-6 text-center">
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Destination
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Click on a location pin to view voyage details
              </p>

              {showRoutes && userLocation && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-blue-700">
                    <Route className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Routes from your location
                    </span>
                  </div>
                </div>
              )}

              {/* Voyage list when no selection */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 text-left">
                  All Destinations
                </h4>
                {mapVoyages.map((voyage) => (
                  <button
                    key={voyage.id}
                    onClick={() => handleVoyageSelect(voyage)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{voyage.image}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {voyage.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {voyage.destination.name},{" "}
                          {voyage.destination.country}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${
                          voyage.type === "custom"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {voyage.type}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        voyage={bookingVoyage}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingVoyage(null);
        }}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
}
