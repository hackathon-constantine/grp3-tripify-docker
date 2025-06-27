import { Shield, CreditCard, Zap, Settings, Info, Bell } from "lucide-react";
import React from "react";

export function getNotificationIcon(type: string, priority: string) {
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
}

export function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-500 text-white";
    case "medium":
      return "bg-yellow-500 text-white";
    case "low":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}