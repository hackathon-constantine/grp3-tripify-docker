"use client";

import { SettingsPage } from "@/features/settings/SettingsPage";

const user = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://via.placeholder.com/40",
  credits: 2500,
};

export default function Settings() {
  return <SettingsPage user={user} />;
}
