"use client";

import { useState } from "react";
import { MarketplacePage } from "@/features/marketplace/MarketplacePage";
import { Trip as VoyageTrip } from "@/types/voyage";

export default function Marketplace() {
  const [activeView, setActiveView] = useState<"marketplace" | "map">(
    "marketplace"
  );

  const handleTripSelect = (trip: VoyageTrip) => {
    console.log("Selected trip:", trip);
  };

  return (
    <MarketplacePage
      onTripSelect={handleTripSelect}
      onMapView={() => setActiveView("map")}
    />
  );
}
