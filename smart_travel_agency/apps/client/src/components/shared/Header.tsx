"use client";

import { useState } from "react";
import { Bell, CreditCard, CheckCheck, Menu, LogOut } from "lucide-react"; // Added Menu import
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserInfo } from "@/types/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getNotificationIcon } from "@/lib/notification-utils";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useT } from "@/hooks/useT";
import { useAuth } from "@/contexts/authContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRouter } from "next/navigation";

// Define the notification type
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: string;
}

// Initial notifications data
const initialNotifications = [
  {
    id: "1",
    type: "billing",
    title: "Payment Successful",
    message: "Your Pro Pack purchase has been processed successfully.",
    timestamp: "2 hours ago",
    read: false,
    priority: "medium",
  },
  {
    id: "2",
    type: "usage",
    title: "Low Credit Balance",
    message: "Your credit balance is running low (1,250 credits remaining).",
    timestamp: "1 day ago",
    read: false,
    priority: "high",
  },
  {
    id: "3",
    type: "security",
    title: "Login from New Device",
    message: "We detected a login from a new device (Chrome on Windows).",
    timestamp: "1 week ago",
    read: false,
    priority: "high",
  },
];

interface HeaderProps {
  user: UserInfo;
  onMenuClick: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const t = useT();
  const { logout } = useAuth();
  const { convertCredits } = useCurrency();
  const router = useRouter();

  // Convert constant to state so we can update it
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  // Get user credits from the user object
  const userCredits = user.credit || 0;
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-white px-6 py-4 rounded-xl mx-3 mt-3 mb-1">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Left side - logo or brand */}
        <div className="flex-1 font-bold text-xl text-blue-600">Tripify</div>

        {/* Right side - actions and profile */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Credits Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative p-2">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{t("user.credits")}</h4>
                  <div className="text-2xl font-bold">{convertCredits(userCredits)}</div>
                </div>
                <Link href="/credits">
                  <Button
                    className="w-full cursor-pointer hover:bg-blue-500 bg-blue-600"
                    size="sm"
                  >
                    {t("user.buyMore")}
                  </Button>
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {/* Notifications Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="w-4 h-4 text-gray-600" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                    {unreadCount}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h4 className="font-medium">{t("user.notifications")}</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs hover:bg-blue-50 text-blue-600"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <p>{t("user.notifications")}</p>
                  </div>
                ) : (
                  // Only show the first 3 notifications
                  notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(
                            notification.type,
                            notification.priority
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-0.5 flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-gray-100 text-center">
                <Link
                  href="/notifications"
                  className="text-sm text-blue-600 font-medium hover:text-blue-700"
                >
                  {notifications.length > 3
                    ? `View all notifications (${notifications.length})`
                    : "View all notifications"}
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src={""} />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {(user.name || user.email)
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Logout Button - New Addition */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-red-600 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
