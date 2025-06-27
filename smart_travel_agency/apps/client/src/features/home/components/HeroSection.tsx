"use client";

import { Calendar, MapPin, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useT } from "@/hooks/useT";

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
}

interface HeroSectionProps {
  onTripSelect: (trip: Trip) => void;
}

export function HeroSection({ onTripSelect }: HeroSectionProps) {
  const router = useRouter();
  const t = useT();

  const handleBookNewTrip = () => {
    router.push("/marketplace");
  };

  const handleViewAllTrips = () => {
    router.push("/marketplace");
  };

  return (
    <Card className="bg-blue-700 text-white p-8">
      <div className="flex flex-col lg:flex-row items-center justify-between">
        <div className="flex-1 mb-6 lg:mb-0">
          <h1 className="text-2xl font-bold mb-4">{t("dashboard.welcome")}</h1>
          <p className="mb-6 font-semibold">{t("dashboard.nextAdventure")}</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Plane className="w-5 h-5" strokeWidth={1.5} />
              <span>12 {t("dashboard.voyagesCompleted")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" strokeWidth={1.5} />
              <span>8 {t("dashboard.countriesVisited")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" strokeWidth={1.5} />
              <span>{t("dashboard.memberSince")}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleBookNewTrip}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-sm"
            >
              {t("dashboard.bookNewVoyage")}
            </Button>
            <Button
              onClick={handleViewAllTrips}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-6 py-3 bg-transparent rounded-sm"
            >
              {t("dashboard.viewAllTrips")}
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="w-64 h-48 bg-white/10 rounded-4xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-6xl mb-4">🏜️</div>
              <p>{t("dashboard.nextTrip")}</p>
              <p>{t("dashboard.departureDate")}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
