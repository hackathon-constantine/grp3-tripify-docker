"use client";

import { Card } from "@/components/ui/card";
import { useT } from "@/hooks/useT";
import { useCurrency } from "@/contexts/CurrencyContext";

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}

export function UserStatsCards() {
  const t = useT();
  const { convertCredits } = useCurrency();

  const userStats: StatCard[] = [
    {
      title: t("dashboard.completedVoyages"),
      value: "12",
      subtitle: t("dashboard.sinceJoining"),
      icon: "✈️",
    },
    {
      title: t("dashboard.totalSpent"),
      value: convertCredits(24580),
      subtitle: t("dashboard.lifetimeSpent"),
      icon: "💰",
    },
    {
      title: t("dashboard.nextVoyage"),
      value: "Tlemcen",
      subtitle: t("dashboard.departingDate"),
      icon: "🗺️",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {userStats.map((stat, index) => (
        <Card key={index} className="bg-white p-6 relative">
          <div className="text-8xl absolute top-6 right-6 opacity-40 z-0">
            {stat.icon}
          </div>
          <div className="flex items-center justify-between mb-4 z-10">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {stat.title}
            </p>
          </div>

          <div className="space-y-4 z-10">
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.subtitle}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
