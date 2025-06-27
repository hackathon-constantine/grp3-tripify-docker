"use client";

import { useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Plane,
  MapPin,
  Calendar,
  MoreHorizontal,
  FolderSyncIcon as Sync,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVoyage } from "@/context/VoyageContext";
import { useT } from "@/hooks/useT";

interface CalendarDay {
  day: number;
  month: "current" | "next" | "previous";
  date: string;
  hasEvents: boolean;
  eventCount: number;
}

export function VoyageTimeline() {
  const {
    selectedDate,
    setSelectedDate,
    getEventsForDate,
    syncWithGoogleCalendar,
    isLoading,
    isSyncing,
    voyages,
  } = useVoyage();
  const t = useT();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      // 6 weeks
      const dateString = current.toISOString().split("T")[0];
      const events = getEventsForDate(dateString);

      days.push({
        day: current.getDate(),
        month:
          current.getMonth() === month
            ? "current"
            : current.getMonth() < month
            ? "previous"
            : "next",
        date: dateString,
        hasEvents: events.length > 0,
        eventCount: events.length,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const selectedEvents = getEventsForDate(selectedDate);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "departure":
      case "arrival":
        return Plane;
      case "transport":
        return MapPin;
      case "activity":
      case "hotel":
        return Calendar;
      default:
        return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "departure":
        return "bg-red-500";
      case "arrival":
        return "bg-green-500";
      case "transport":
        return "bg-blue-500";
      case "activity":
        return "bg-purple-500";
      case "hotel":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (isLoading) {
    return (
      <Card className="bg-white">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <div className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t("dashboard.voyageCalendar")}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {voyages.length} {t("dashboard.activeVoyages")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={syncWithGoogleCalendar}
              disabled={isSyncing}
              variant="outline"
              size="sm"
              className="border-gray-300 bg-transparent"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sync className="w-4 h-4 mr-2" />
              )}
              {isSyncing
                ? t("dashboard.syncing")
                : t("dashboard.syncWithGoogle")}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-6">
          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-500 mb-3">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => (
                <button
                  key={index}
                  className={`w-10 h-10 text-sm flex items-center justify-center font-medium rounded-md relative transition-colors ${
                    date.date === selectedDate
                      ? "bg-blue-600 text-white"
                      : date.month === "current"
                      ? date.hasEvents
                        ? "text-gray-700 bg-blue-50 hover:bg-blue-100"
                        : "text-gray-700 hover:bg-gray-100"
                      : "text-gray-300 hover:text-gray-400"
                  }`}
                  onClick={() => setSelectedDate(date.date)}
                >
                  {date.day}
                  {date.hasEvents && (
                    <div className="absolute -top-1 -right-1">
                      <Badge className="w-4 h-4 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                        {date.eventCount}
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Schedule */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {selectedEvents.length} events
              </div>
            </div>

            <div className="space-y-4">
              {selectedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled for this day</p>
                </div>
              ) : (
                selectedEvents.map((event) => {
                  const EventIcon = getEventIcon(event.type);

                  return (
                    <div key={event.id} className="flex items-start space-x-4">
                      <div className="text-sm font-medium text-gray-500 w-12 pt-1">
                        {event.time}
                      </div>

                      <div className="flex-1">
                        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 ${getEventTypeColor(
                                  event.type
                                )} rounded-md`}
                              >
                                <EventIcon className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {event.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {event.subtitle}
                                </p>
                                {event.location && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    📍 {event.location}
                                  </p>
                                )}
                                <Badge
                                  variant="outline"
                                  className="mt-2 text-xs"
                                >
                                  {event.voyageName}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="p-1">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
