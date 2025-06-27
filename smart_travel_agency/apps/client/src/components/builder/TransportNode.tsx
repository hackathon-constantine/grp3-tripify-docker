import React, { FC, useMemo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useT } from "@/hooks/useT";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface TransportNodeData {
  id: string;
  fromDestination: string;
  toDestination: string;
  values: {
    transport: string;
  };
  onChange: (id: string, values: TransportNodeData["values"]) => void;
  transportOptions: any[];
  destinations: any[];
}

// Function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const TransportNode: FC<NodeProps<TransportNodeData>> = ({ data }) => {
  const t = useT();
  const { convertCredits } = useCurrency();
  const {
    id,
    fromDestination,
    toDestination,
    values,
    onChange,
    transportOptions,
    destinations,
  } = data;

  const fromDest = destinations.find((d) => d.id === fromDestination);
  const toDest = destinations.find((d) => d.id === toDestination);

  // Calculate distance and pricing
  const { distance, transportPricing } = useMemo(() => {
    if (!fromDest || !toDest || !fromDest.coordinates || !toDest.coordinates) {
      return { distance: 0, transportPricing: [] };
    }

    const dist = calculateDistance(
      fromDest.coordinates.lat,
      fromDest.coordinates.lng,
      toDest.coordinates.lat,
      toDest.coordinates.lng
    );

    // Calculate pricing based purely on distance with different multipliers for each transport type
    const pricing = transportOptions.map((transport) => {
      let pricePerKm = 1;

      // Different pricing strategies for different transport types (price per km)
      switch (transport.id) {
        case "flight":
          pricePerKm = dist > 500 ? 0.15 : 0.25; // Cheaper per km for long distances
          break;
        case "train":
          pricePerKm = 0.12; // Consistent pricing
          break;
        case "bus":
          pricePerKm = 0.08; // Cheapest option
          break;
        case "car":
          pricePerKm = 0.1; // Rental + fuel costs
          break;
        default:
          pricePerKm = 0.15;
      }

      const calculatedPrice = Math.round(dist * pricePerKm);

      return {
        ...transport,
        calculatedPrice: calculatedPrice,
      };
    });

    return { distance: Math.round(dist), transportPricing: pricing };
  }, [fromDest, toDest, transportOptions]);

  const selectedTransport = transportPricing.find(
    (t) => t.id === values.transport
  );

  // Check if transport option is disabled based on distance
  const isTransportDisabled = (transportId: string, distance: number) => {
    switch (transportId) {
      case "train":
        return distance >= 1800; // Disable trains for 1800km+
      case "bus":
      case "car":
        return distance >= 1000; // Disable buses and cars for 1000km+
      default:
        return false;
    }
  };

  const handleTransportChange = (transportId: string) => {
    // Only allow selection if both destinations are set and transport is not disabled
    if (fromDest && toDest && !isTransportDisabled(transportId, distance)) {
      onChange(id, { transport: transportId });
    }
  };

  const isDisabled = !fromDest || !toDest;
  const bothDestinationsSelected = fromDest && toDest;

  return (
    <div
      className={`bg-white border-2 rounded-xl w-80 overflow-hidden transition-all ${
        isDisabled
          ? "border-dashed border-gray-300 opacity-60"
          : "border-dashed border-orange-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />

      {/* Header */}
      <div
        className={`p-4 border-b border-gray-200 ${
          isDisabled ? "bg-gray-50" : "bg-orange-50"
        }`}
      >
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 text-sm">
            Transport Selection
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {fromDest?.name || "Select Origin"} →{" "}
            {toDest?.name || "Select Destination"}
          </p>
          {bothDestinationsSelected && distance > 0 && (
            <p className="text-xs text-orange-600 font-medium mt-1">
              📍 {distance.toLocaleString()} km distance
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isDisabled ? (
          /* Disabled State */
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🚫</div>
            <h4 className="font-medium text-gray-700 mb-2">
              Transport Unavailable
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Please select both starting point and destination in the connected
              nodes to choose transport options.
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center justify-center space-x-2">
                <span className={fromDest ? "text-green-500" : "text-red-500"}>
                  {fromDest ? "✓" : "✗"}
                </span>
                <span>Starting point: {fromDest?.name || "Not selected"}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className={toDest ? "text-green-500" : "text-red-500"}>
                  {toDest ? "✓" : "✗"}
                </span>
                <span>Destination: {toDest?.name || "Not selected"}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Transport Options */
          <div className="space-y-3">
            {transportPricing.map((transport) => {
              const isDisabledByDistance = isTransportDisabled(
                transport.id,
                distance
              );
              return (
                <button
                  key={transport.id}
                  onClick={() => handleTransportChange(transport.id)}
                  disabled={isDisabledByDistance}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    isDisabledByDistance
                      ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                      : values.transport === transport.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{transport.icon}</span>
                      <div>
                        <div
                          className={`font-medium text-sm ${
                            isDisabledByDistance
                              ? "text-gray-400"
                              : "text-gray-800"
                          }`}
                        >
                          {transport.name}
                          {isDisabledByDistance && (
                            <span className="ml-2 text-red-500 text-xs">
                              (Unavailable)
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs ${
                            isDisabledByDistance
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          {isDisabledByDistance ? (
                            <>
                              Distance too far ({distance.toLocaleString()} km)
                              {transport.id === "train" &&
                                " - Trains limited to <1,500km"}
                              {(transport.id === "bus" ||
                                transport.id === "car") &&
                                " - Limited to <1,000km"}
                            </>
                          ) : (
                            transport.duration
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold text-sm whitespace-nowrap ${
                          isDisabledByDistance
                            ? "text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        {isDisabledByDistance
                          ? "N/A"
                          : `${convertCredits(transport.calculatedPrice)}`}
                      </div>

                      {values.transport === transport.id &&
                        !isDisabledByDistance && (
                          <div className="text-xs text-orange-600 font-medium">
                            ✓ Selected
                          </div>
                        )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Warning if no transport selected */}
            {!values.transport && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="text-xs text-yellow-700 font-medium">
                    Please select a transport method
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};

export default TransportNode;
