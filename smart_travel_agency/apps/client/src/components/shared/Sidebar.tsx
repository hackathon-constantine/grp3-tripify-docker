"use client";

import {
  Home,
  MapPin,
  Settings,
  Plus,
  Compass,
  MessageCircle,
  HelpCircle,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/useT";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

interface SidebarProps {
  onClose?: () => void;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: "nav.dashboard", href: "/" },
  { icon: Compass, label: "nav.discover", href: "/marketplace" },
  { icon: Settings, label: "nav.settings", href: "/settings" },
  { icon: MessageCircle, label: "nav.support", href: "/support" },
  { icon: HelpCircle, label: "nav.help", href: "/help" },
];

export function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();

  return (
    <div className="w-64 my-3 ms-3 rounded-xl bg-white flex flex-col">
      {/* Brand and Close Button */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded-sm">
              <span className="text-white font-bold">T</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tripify</h1>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 lg:hidden"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
          onClick={() => router.push("/builder")}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("nav.newTrip")}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={index}
              className={`w-full flex items-center space-x-3 py-3 px-3 mb-2 text-left rounded-md ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => router.push(item.href)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{t(item.label)}</span>
            </button>
          );
        })}
      </nav>

      {/* User Stats */}
      <div className="p-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t("user.profile")}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900">12</p>
              <p className="text-xs text-gray-600">
                {t("summary.destinations")}
              </p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">34</p>
              <p className="text-xs text-gray-600">{t("summary.totalDays")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
