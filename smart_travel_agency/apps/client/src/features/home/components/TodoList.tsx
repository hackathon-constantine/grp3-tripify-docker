"use client";

import { Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/hooks/useT";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Reservation {
  id: number;
  destination: string;
  departureDate: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
  amount: number; // Changed to number for currency conversion
  travelers: number;
}

const reservations: Reservation[] = [
  {
    id: 1,
    destination: "Tlemcen Desert Adventure",
    departureDate: "March 15, 2024",
    status: "Confirmed",
    amount: 2450,
    travelers: 2,
  },
  {
    id: 2,
    destination: "Egypt Nile Cruise",
    departureDate: "June 8, 2024",
    status: "Pending",
    amount: 3200,
    travelers: 2,
  },
  {
    id: 3,
    destination: "Tunisia Cultural Tour",
    departureDate: "September 12, 2024",
    status: "Confirmed",
    amount: 1850,
    travelers: 1,
  },
  {
    id: 4,
    destination: "Jordan Petra Experience",
    departureDate: "December 3, 2024",
    status: "Pending",
    amount: 2750,
    travelers: 2,
  },
];

export function ReservationsList() {
  const t = useT();
  const { convertCredits } = useCurrency();

  const getStatusColor = (status: Reservation["status"]) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500 text-white";
      case "Pending":
        return "bg-yellow-500 text-white";
      case "Cancelled":
        return "bg-red-500 text-white";
      case "Completed":
        return "bg-blue-500 text-white";
    }
  };

  const getStatusTranslation = (status: Reservation["status"]) => {
    switch (status) {
      case "Confirmed":
        return t("dashboard.confirmed");
      case "Pending":
        return t("dashboard.pending");
      case "Cancelled":
        return t("dashboard.cancelled");
      case "Completed":
        return t("dashboard.completed");
    }
  };

  return (
    <Card className="bg-white border-0">
      <div className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t("dashboard.myReservations")}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              4 {t("dashboard.upcomingVoyages")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 bg-transparent"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {t("dashboard.sort")}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-100">
          <span className="col-span-1">#</span>
          <span className="col-span-4">{t("dashboard.destination")}</span>
          <span className="col-span-2">{t("dashboard.departure")}</span>
          <span className="col-span-2">{t("dashboard.amount")}</span>
          <span className="col-span-2">{t("dashboard.status")}</span>
          <span className="col-span-1">{t("dashboard.travelers")}</span>
        </div>

        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="grid grid-cols-12 gap-4 items-center py-3 hover:bg-gray-50 px-3"
          >
            <div className="col-span-1">
              <div className="w-6 h-6 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                {reservation.id}
              </div>
            </div>

            <div className="col-span-4">
              <p className="text-sm text-gray-900 font-medium">
                {reservation.destination}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-gray-700">
                {reservation.departureDate}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-900">
                {convertCredits(reservation.amount)}
              </p>
            </div>

            <div className="col-span-2">
              <Badge
                className={`${getStatusColor(
                  reservation.status
                )} text-xs px-2 py-1`}
              >
                {getStatusTranslation(reservation.status)}
              </Badge>
            </div>

            <div className="col-span-1">
              <div className="flex items-center justify-center">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                    {reservation.travelers}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full mt-6 text-gray-600 border-gray-300 border-dashed h-10 bg-transparent"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("dashboard.bookNewVoyage2")}
        </Button>
      </div>
    </Card>
  );
}
