import React, { FC, useState, useMemo, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { MapPin, Calendar } from "lucide-react";
import { DestinationPicker } from "./DestinationPicker";
import { useT } from "@/hooks/useT";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface DestinationNodeData {
  id: string;
  sequenceNumber: number;
  values: {
    destination: string;
    hotel: string;
    duration: number;
    activities: string[];
  };
  onChange: (id: string, values: DestinationNodeData["values"]) => void;
  onAddDestination?: () => void;
  onOpenDestinationPicker?: (nodeId: string) => void;
  destinations: any[];
  hotels: any[];
  isLastNode: boolean;
  tripStartDate?: Date;
  cumulativeDaysBeforeThis?: number;
}

const DestinationNode: FC<NodeProps<DestinationNodeData>> = ({ data }) => {
  const t = useT();
  const { convertCredits } = useCurrency();
  const {
    sequenceNumber,
    values,
    id,
    onChange,
    onAddDestination,
    onOpenDestinationPicker,
    destinations,
    hotels,
    isLastNode,
    tripStartDate,
    cumulativeDaysBeforeThis = 0,
  } = data;
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedDestination = destinations.find(
    (d) => d.id === values.destination
  );
  const selectedHotel = hotels.find((h) => h.id === values.hotel);

  // Fetch weather data for the selected destination when needed
  const [currentWeather, setCurrentWeather] = useState<{
    temp: number;
    condition: string;
    humidity: string;
    date: string;
  } | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Fetch weather when destination or dates change
  useEffect(() => {
    if (!selectedDestination || !tripStartDate) {
      setCurrentWeather(null);
      return;
    }

    const fetchWeather = async () => {
      setIsLoadingWeather(true);
      try {
        // Calculate the arrival date for this destination
        const arrivalDate = new Date(tripStartDate);
        arrivalDate.setDate(
          arrivalDate.getDate() + (cumulativeDaysBeforeThis || 0)
        );
        const arrivalDateStr = arrivalDate.toISOString().split("T")[0]; // YYYY-MM-DD format

        const response = await fetch(
          `/api/get-weather?city=${encodeURIComponent(
            selectedDestination.name.toLowerCase()
          )}&date=${arrivalDateStr}`
        );

        if (response.ok) {
          const weather = await response.json();
          setCurrentWeather(weather);
        } else {
          console.warn(
            `Weather data not available for ${selectedDestination.name} on ${arrivalDateStr}`
          );
          setCurrentWeather(null);
        }
      } catch (error) {
        console.error(
          `Failed to fetch weather for ${selectedDestination.name}:`,
          error
        );
        setCurrentWeather(null);
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [selectedDestination, tripStartDate, cumulativeDaysBeforeThis]);

  // Calculate trip dates
  const tripDates = useMemo(() => {
    if (!tripStartDate) {
      return {
        startDate: null,
        endDate: null,
        dateRange: "Dates not set",
        formattedStart: "",
        formattedEnd: "",
      };
    }

    const startDate = new Date(tripStartDate);
    startDate.setDate(startDate.getDate() + cumulativeDaysBeforeThis);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (values.duration - 1));

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const formatDateShort = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    return {
      startDate,
      endDate,
      dateRange:
        values.duration === 1
          ? formatDateShort(startDate)
          : `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`,
      formattedStart: formatDate(startDate),
      formattedEnd: formatDate(endDate),
    };
  }, [tripStartDate, cumulativeDaysBeforeThis, values.duration]);

  const handleChange = (field: string, value: any) => {
    onChange(id, {
      ...values,
      [field]: value,
    });
  };

  const handleActivityToggle = (activity: string) => {
    const currentActivities = values.activities || [];
    const newActivities = currentActivities.includes(activity)
      ? currentActivities.filter((a) => a !== activity)
      : [...currentActivities, activity];
    handleChange("activities", newActivities);
  };

  const handleDestinationSelect = (destinationId: string) => {
    handleChange("destination", destinationId);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl w-80 overflow-hidden">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-300 border-2 border-white"
      />

      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {sequenceNumber}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {selectedDestination?.name || "Select Destination"}
              </h3>
              {selectedDestination && (
                <p className="text-xs text-gray-500">
                  {selectedDestination.country} •{" "}
                  {selectedDestination.continent}
                </p>
              )}
              {tripStartDate && (
                <div className="flex items-center space-x-1 mt-1">
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">
                    {tripDates.dateRange}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Destination Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            {t("builder.destination.selectDestination")}
          </label>
          <button
            onClick={() => onOpenDestinationPicker?.(id)}
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span
                className={
                  selectedDestination ? "text-gray-900" : "text-gray-500"
                }
              >
                {selectedDestination
                  ? `${selectedDestination.name}, ${selectedDestination.country}`
                  : t("builder.destination.chooseDestination")}
              </span>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Duration */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {t("builder.destination.duration")}
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={values.duration || 1}
              onChange={(e) =>
                handleChange("duration", parseInt(e.target.value) || 1)
              }
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {t("builder.destination.hotel")}
            </label>
            <select
              value={values.hotel}
              onChange={(e) => handleChange("hotel", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">{t("builder.destination.chooseHotel")}</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} - {convertCredits(h.price)}/night
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            {/* Activities */}
            {selectedDestination?.activities && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  {t("builder.destination.activities")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedDestination.activities.map((activity: string) => (
                    <button
                      key={activity}
                      onClick={() => handleActivityToggle(activity)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        values.activities?.includes(activity)
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weather & Visa Info */}
            <div className="flex space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center flex-1">
                {isLoadingWeather ? (
                  <>
                    <div className="text-2xl mb-1">⏳</div>
                    <div className="text-xs text-gray-500">Weather</div>
                    <div className="text-xs font-medium text-gray-400">
                      Loading...
                    </div>
                  </>
                ) : currentWeather ? (
                  <>
                    <div className="text-2xl mb-1">☀️</div>
                    <div className="text-xs text-gray-500">
                      {t("builder.destination.weather")}
                    </div>
                    <div className="text-xs font-medium text-gray-800">
                      {currentWeather.temp}°C
                    </div>
                    <div className="text-xs text-gray-600">
                      {currentWeather.condition}
                    </div>
                    <div className="text-xs text-gray-500">
                      💧 {currentWeather.humidity}
                    </div>
                  </>
                ) : selectedDestination ? (
                  <>
                    <div className="text-2xl mb-1">❌</div>
                    <div className="text-xs text-gray-500">
                      {t("builder.destination.weather")}
                    </div>
                    <div className="text-xs font-medium text-gray-400">
                      {t("builder.destination.unavailable")}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-1">🌤️</div>
                    <div className="text-xs text-gray-500">
                      {t("builder.destination.weather")}
                    </div>
                    <div className="text-xs font-medium text-gray-400">
                      Select destination
                    </div>
                  </>
                )}
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl mb-1">🛂</div>
                <div className="text-xs text-gray-500">
                  {t("builder.destination.visa")}
                </div>
                <div className="text-xs font-medium text-gray-400">N/A</div>
              </div>
            </div>
          </div>
        )}

        {/* Add Destination Button - Only shown in last node */}
        {isLastNode && onAddDestination && (
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={onAddDestination}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>{t("builder.destination.addNextDestination")}</span>
            </button>
          </div>
        )}
      </div>

      {!isLastNode && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-gray-300 border-2 border-white"
        />
      )}
    </div>
  );
};

export default DestinationNode;
