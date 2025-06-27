"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CreditCard,
  Info,
  Zap,
  Settings,
  Trash2,
  Filter,
  Mail,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useT } from "@/hooks/useT";

interface Notification {
  id: string;
  type: "system" | "billing" | "usage" | "security" | "feature";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

export default function NotificationsPage() {
  const t = useT();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "billing",
      title: "Payment Successful",
      message: t("notifications.messages.paymentSuccessful"),
      timestamp: "2 hours ago",
      read: false,
      priority: "medium",
    },
    {
      id: "2",
      type: "usage",
      title: "Low Credit Balance",
      message: t("notifications.messages.lowCreditBalance"),
      timestamp: "1 day ago",
      read: false,
      priority: "high",
    },
    {
      id: "3",
      type: "system",
      title: "System Maintenance Complete",
      message: t("notifications.messages.systemMaintenance"),
      timestamp: "2 days ago",
      read: true,
      priority: "low",
    },
    {
      id: "4",
      type: "feature",
      title: "New Feature Available",
      message: t("notifications.messages.newFeature"),
      timestamp: "3 days ago",
      read: true,
      priority: "medium",
    },
    {
      id: "5",
      type: "security",
      title: "Login from New Device",
      message: t("notifications.messages.loginNewDevice"),
      timestamp: "1 week ago",
      read: false,
      priority: "high",
    },
    {
      id: "6",
      type: "billing",
      title: "Invoice Available",
      message: t("notifications.messages.invoiceAvailable"),
      timestamp: "1 week ago",
      read: true,
      priority: "low",
    },
  ]);

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      billing: true,
      usage: true,
      security: true,
      system: false,
      feature: true,
    },
    push: {
      billing: true,
      usage: true,
      security: true,
      system: false,
      feature: false,
    },
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass =
      priority === "high"
        ? "text-red-500"
        : priority === "medium"
        ? "text-yellow-500"
        : "text-blue-500";

    switch (type) {
      case "billing":
        return <CreditCard className={`h-5 w-5 ${iconClass}`} />;
      case "usage":
        return <Zap className={`h-5 w-5 ${iconClass}`} />;
      case "security":
        return <Shield className={`h-5 w-5 ${iconClass}`} />;
      case "system":
        return <Settings className={`h-5 w-5 ${iconClass}`} />;
      case "feature":
        return <Info className={`h-5 w-5 ${iconClass}`} />;
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-500 text-white">
            {t("notifications.priority.high")}
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-500 text-white">
            {t("notifications.priority.medium")}
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-blue-500 text-white">
            {t("notifications.priority.low")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "read" && !notification.read) return false;
    if (filter === "unread" && notification.read) return false;
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const updateNotificationSetting = (
    channel: "email" | "push",
    type: string,
    value: boolean
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("notifications.title")}
          </h1>
          <p className="text-gray-600">{t("notifications.subtitle")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            {t("notifications.actions.markAllRead")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger
            value="notifications"
            className="flex items-center space-x-2"
          >
            <Bell className="h-4 w-4" />
            <span>{t("notifications.title")}</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>{t("notifications.settings.title")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Filters:
                  </span>
                </div>
                <div className="flex space-x-2">
                  {["all", "unread", "read"].map((filterOption) => (
                    <Button
                      key={filterOption}
                      variant={filter === filterOption ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(filterOption as typeof filter)}
                    >
                      {t(`notifications.filters.${filterOption}`)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="all">{t("notifications.types.all")}</option>
                  <option value="billing">
                    {t("notifications.types.billing")}
                  </option>
                  <option value="usage">
                    {t("notifications.types.usage")}
                  </option>
                  <option value="security">
                    {t("notifications.types.security")}
                  </option>
                  <option value="system">
                    {t("notifications.types.system")}
                  </option>
                  <option value="feature">
                    {t("notifications.types.feature")}
                  </option>
                </select>
              </div>
            </div>
          </Card>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center bg-white">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("notifications.empty.title")}
              </h3>
              <p className="text-gray-600">
                {t("notifications.empty.subtitle")}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 bg-white border-l-4 ${
                    notification.read
                      ? "border-gray-200 bg-gray-50"
                      : "border-blue-500 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(
                          notification.type,
                          notification.priority
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4
                            className={`text-sm font-medium ${
                              notification.read
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {getPriorityBadge(notification.priority)}
                          <Badge variant="secondary" className="text-xs">
                            {t(`notifications.types.${notification.type}`)}
                          </Badge>
                        </div>
                        <p
                          className={`text-sm ${
                            notification.read
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("notifications.settings.title")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("notifications.settings.subtitle")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email Notifications */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h4 className="text-md font-medium text-gray-900">
                    {t("notifications.settings.email.title")}
                  </h4>
                </div>
                <div className="space-y-3">
                  {Object.entries(notificationSettings.email).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
                          {t(`notifications.settings.email.${key}`)}
                        </span>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            updateNotificationSetting("email", key, checked)
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <h4 className="text-md font-medium text-gray-900">
                    {t("notifications.settings.push.title")}
                  </h4>
                </div>
                <div className="space-y-3">
                  {Object.entries(notificationSettings.push).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
                          {t(`notifications.settings.push.${key}`)}
                        </span>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            updateNotificationSetting("push", key, checked)
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
