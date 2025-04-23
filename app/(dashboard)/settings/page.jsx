import SettingsPage from "@/components/settings/SettingsPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserSettingsbyUserId } from "@/lib/actions";
import { SettingsProvider } from "@/lib/context/SettingsContext";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const settings = await getUserSettingsbyUserId(userId);

  const { UserSettings, Organization, ...baseSettings } = settings;

  const finalSettings = {
    ...baseSettings,
    ...(UserSettings || {}),
    ...(Organization?.OrgSettings || {}),
  };

  return (
    <SettingsProvider data={finalSettings}>
      <SettingsPage />
    </SettingsProvider>
  );
}
