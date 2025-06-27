import React, { useState, useMemo, FC } from "react";
import { Node } from "reactflow";
import { DestinationNodeData } from "./DestinationNode";
import { TransportNodeData } from "./TransportNode";
import { Loader2, Save } from "lucide-react";
import { useT } from "@/hooks/useT";
import { useCurrency } from "@/contexts/CurrencyContext";

interface TripHUDProps {
  nodes: Node<DestinationNodeData | TransportNodeData>[];
  destinations: any[];
  hotels: any[];
  transportOptions: any[];
  onSave: () => void;
  onShare: () => void;
  tripStartDate: Date;
  onTripStartDateChange: (date: Date) => void;
  shareSuccess?: boolean;
  saveSuccess?: boolean;
  saveError?: string | null;
  isSaving?: boolean;
}

const TripHUD: FC<TripHUDProps> = ({
  nodes,
  destinations,
  hotels,
  transportOptions,
  onSave,
  onShare,
  tripStartDate,
  onTripStartDateChange,
  shareSuccess = false,
  saveSuccess = false,
  saveError = null,
  isSaving = false,
}) => {
  const t = useT();
  const { convertCredits } = useCurrency();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const calculations = useMemo(() => {
    let destinationCosts = 0;
    let hotelCosts = 0;
    let transportCosts = 0;
    let totalDays = 0;
    let destinationCount = 0;

    nodes.forEach((node) => {
      if (node.type === "destinationNode") {
        const nodeData = node.data as DestinationNodeData;
        const hotel = hotels.find((h) => h.id === nodeData.values.hotel);
        const duration = nodeData.values.duration || 1;

        if (nodeData.values.destination) {
          destinationCount++;
        }
        if (hotel) hotelCosts += hotel.price * duration;
        totalDays += duration;
      } else if (node.type === "transportNode") {
        const nodeData = node.data as TransportNodeData;
        const transport = transportOptions.find(
          (t) => t.id === nodeData.values.transport
        );

        if (transport && nodeData.fromDestination && nodeData.toDestination) {
          // Calculate distance-based cost similar to TransportNode
          const fromDest = destinations.find(
            (d) => d.id === nodeData.fromDestination
          );
          const toDest = destinations.find(
            (d) => d.id === nodeData.toDestination
          );

          if (fromDest?.coordinates && toDest?.coordinates) {
            const R = 6371; // Radius of the Earth in kilometers
            const dLat =
              ((toDest.coordinates.lat - fromDest.coordinates.lat) * Math.PI) /
              180;
            const dLng =
              ((toDest.coordinates.lng - fromDest.coordinates.lng) * Math.PI) /
              180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((fromDest.coordinates.lat * Math.PI) / 180) *
                Math.cos((toDest.coordinates.lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            // Check if transport is disabled based on distance
            const isTransportDisabled = (
              transportId: string,
              distance: number
            ) => {
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

            // Skip cost calculation if transport is disabled for this distance
            if (isTransportDisabled(transport.id, distance)) {
              return; // Don't add any cost for disabled transport
            }

            // Apply same pricing logic as TransportNode (pure distance-based)
            let pricePerKm = 1;

            switch (transport.id) {
              case "flight":
                pricePerKm = distance > 500 ? 0.15 : 0.25;
                break;
              case "train":
                pricePerKm = 0.12;
                break;
              case "bus":
                pricePerKm = 0.08;
                break;
              case "car":
                pricePerKm = 0.1;
                break;
              default:
                pricePerKm = 0.15;
            }

            const calculatedPrice = Math.round(distance * pricePerKm);
            transportCosts += calculatedPrice;
          } else {
            // Fallback for missing coordinates - use average distance pricing
            const fallbackPrice = Math.round(500 * 0.15); // 500km at flight rate
            transportCosts += fallbackPrice;
          }
        }
      }
    });

    const subtotal = hotelCosts + transportCosts;
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;

    return {
      hotelCosts,
      transportCosts,
      subtotal,
      discountAmount,
      total,
      totalDays,
      destinationCount,
      avgDailyCost: totalDays > 0 ? total / totalDays : 0,
    };
  }, [nodes, destinations, hotels, transportOptions, discount]);

  const handleApplyPromo = () => {
    const validCodes = {
      SUMMER20: 0.2,
      WELCOME10: 0.1,
      STUDENT15: 0.15,
    };

    const code = promoCode.toUpperCase();
    if (validCodes[code as keyof typeof validCodes]) {
      setDiscount(validCodes[code as keyof typeof validCodes]);
      setPromoError("");
    } else {
      setDiscount(0);
      setPromoError("Invalid promo code");
    }
  };

  const destinationNodes = nodes.filter((n) => n.type === "destinationNode");
  if (destinationNodes.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-20">
      <div
        className={`bg-white rounded-2xl border border-gray-200 transition-all duration-300 ${
          isCollapsed ? "w-16 h-16" : "w-80"
        }`}
      >
        {/* Collapsed State */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full h-full flex items-center justify-center text-2xl hover:bg-gray-50 rounded-2xl transition-colors"
          >
            💰
          </button>
        )}

        {/* Expanded State */}
        {!isCollapsed && (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">
                {t("builder.tripHud.tripSummary")}
              </h3>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Trip Start Date */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("builder.tripHud.tripStartDate")}
              </label>
              <input
                type="date"
                value={tripStartDate.toLocaleDateString("en-CA")} // YYYY-MM-DD format
                onChange={(e) => {
                  if (e.target.value) {
                    // Create date in local timezone to avoid timezone issues
                    const [year, month, day] = e.target.value
                      .split("-")
                      .map(Number);
                    const newDate = new Date(year, month - 1, day, 0, 0, 0, 0);
                    onTripStartDateChange(newDate);
                  }
                }}
                min={new Date().toLocaleDateString("en-CA")} // Prevent past dates
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Trip Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-600 text-xs font-medium">
                  {t("builder.tripHud.destinations")}
                </div>
                <div className="text-blue-900 font-bold text-lg">
                  {calculations.destinationCount}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-600 text-xs font-medium">
                  {t("builder.tripHud.totalDays")}
                </div>
                <div className="text-green-900 font-bold text-lg">
                  {calculations.totalDays}
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {t("builder.tripHud.hotels")} ({calculations.totalDays}{" "}
                  {t("builder.tripHud.nights")})
                </span>
                <span className="font-medium">
                  {convertCredits(calculations.hotelCosts)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {t("builder.tripHud.transport")}
                </span>
                <span className="font-medium">
                  {convertCredits(calculations.transportCosts)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{t("builder.tripHud.subtotal")}</span>
                  <span>{convertCredits(calculations.subtotal)}</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-4">
              <div className="flex space-x-2 w-full">
                <input
                  type="text"
                  placeholder={t("builder.tripHud.promoCode")}
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoError("");
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  {t("builder.tripHud.apply")}
                </button>
              </div>
              {promoError && (
                <div className="text-red-500 text-xs mt-1">
                  {t("builder.tripHud.invalidCode")}
                </div>
              )}
              {discount > 0 && (
                <div className="text-green-600 text-xs mt-1 font-medium">
                  {(discount * 100).toFixed(0)}%{" "}
                  {t("builder.tripHud.discountApplied")} -$
                  {calculations.discountAmount.toLocaleString()}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-blue-600 text-xs font-medium">
                    {t("builder.tripHud.total")}
                  </div>
                  <div className="text-blue-900 font-bold text-2xl">
                    ${calculations.total.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-600 text-xs font-medium">
                    {t("builder.tripHud.perDay")}
                  </div>
                  <div className="text-blue-700 font-semibold">
                    ${calculations.avgDailyCost.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onShare}
                disabled={shareSuccess}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-lg transition-colors"
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {t("builder.tripHud.share")}
                </span>
              </button>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">
                      {t("builder.tripHud.saving")}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t("builder.tripHud.save")}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Success/Error Messages */}
            {shareSuccess && (
              <div className="text-sm font-medium text-green-600 p-2">
                {t("builder.tripHud.shareSuccess")}
              </div>
            )}

            {saveSuccess && (
              <div className="text-sm font-medium text-green-600 p-2">
                {t("builder.tripHud.saveSuccess")}
              </div>
            )}

            {saveError && (
              <div className="text-sm font-medium text-red-600 p-2">
                {saveError}
              </div>
            )}

            {/* Tips */}
            {/* <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="text-yellow-700 text-xs font-medium mb-1">
                💡 Pro Tips
              </div>
              <div className="text-yellow-600 text-xs">
                Try promo codes: SUMMER20, WELCOME10, STUDENT15
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHUD;
