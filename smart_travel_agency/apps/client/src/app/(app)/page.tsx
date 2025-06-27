"use client";

import { HomePage } from "@/features/home/HomePage";
import { Trip as VoyageTrip } from "@/types/voyage";

export default function Page() {
  const handleTripSelect = (trip: VoyageTrip) => {
    console.log("Selected trip:", trip);
  };

  return <HomePage onTripSelect={handleTripSelect} />;
}
