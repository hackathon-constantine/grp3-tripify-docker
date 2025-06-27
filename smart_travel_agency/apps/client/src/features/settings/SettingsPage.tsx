"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { User as UserType } from "@/types";
import { useT } from "@/hooks/useT";
import { useCurrency, Currency, CURRENCY_LABELS } from "@/contexts/CurrencyContext";

interface SettingsPageProps {
  user: UserType;
}

export function SettingsPage({ user }: SettingsPageProps) {
  const t = useT();
  const { currency, setCurrency } = useCurrency();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("settings.title")}
        </h1>
        <p className="text-gray-600 mt-1">{t("settings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white">
            <div className="mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <User className="w-5 h-5 mr-2" />
                {t("settings.general.profile")}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg bg-blue-600 text-white">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG up to 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input defaultValue={user.name} className="border-gray-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.general.email")}
                  </label>
                  <Input
                    defaultValue={user.email}
                    type="email"
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.general.phone")}
                  </label>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input
                    placeholder="New York, NY"
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  {t("settings.general.saveChanges")}
                </Button>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white">
            <div className="mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <Shield className="w-5 h-5 mr-2" />
                {t("settings.security.title")}
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.security.currentPassword")}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="border-gray-300 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute inset-y-0 right-0 px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.security.newPassword")}
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  className="border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.security.confirmPassword")}
                </label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="border-gray-300"
                />
              </div>

              <div className="pt-4 border-t">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  {t("settings.security.changePassword")}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Settings */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="bg-white">
            <div className="mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <Bell className="w-5 h-5 mr-2" />
                {t("settings.tabs.notifications")}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">
                    Trip updates and bookings
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push</p>
                  <p className="text-sm text-gray-500">Mobile notifications</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Marketing</p>
                  <p className="text-sm text-gray-500">Deals and promotions</p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, marketing: checked })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="bg-white">
            <div className="mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <Globe className="w-5 h-5 mr-2" />
                Preferences
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.general.language")}
                </label>
                <select className="w-full py-2 px-3 border border-gray-300 rounded-md">
                  <option>English (US)</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>Arabic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select 
                  className="w-full py-2 px-3 border border-gray-300 rounded-md"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                >
                  {Object.entries(CURRENCY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select className="w-full py-2 px-3 border border-gray-300 rounded-md">
                  <option>UTC-5 (Eastern)</option>
                  <option>UTC+1 (Central European)</option>
                  <option>UTC+0 (GMT)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Payment */}
          <Card className="bg-white">
            <div className="mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment
              </h3>
            </div>
            <div>
              <Button variant="outline" className="w-full border-gray-300">
                Manage Payment Methods
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
