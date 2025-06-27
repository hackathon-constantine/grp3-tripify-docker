"use client";

import { HeroSection, Trip } from "./components/HeroSection";
import { UserStatsCards } from "./components/StatsCards";
import { ReservationsList } from "./components/TodoList";
import { VoyageTimeline } from "./components/Timeline";
import { VoyageProvider } from "@/context/VoyageContext";

interface HomePageProps {
  onTripSelect: (trip: Trip) => void;
}

export function HomePage({ onTripSelect }: HomePageProps) {
  return (
    <div className="space-y-6">
      <VoyageProvider>
      {/* Hero Section */}
      <HeroSection onTripSelect={onTripSelect} />

      {/* Stats Cards */}
      <UserStatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Todo List - Takes up 2 columns */}
        <div className="xl:col-span-2">
          < ReservationsList/>
        </div>

        {/* Timeline - Takes up 1 column */}
        <div className="xl:col-span-1">
          <VoyageTimeline/>
        </div>
      </div>
      </VoyageProvider>
    </div>
  );
}
