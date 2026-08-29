import type { Doc } from "../../convex/_generated/dataModel";

export type UserSettings = Doc<"users">["settings"];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: "INR",
  theme: "light",
  notifications: true,
  showBalance: true,
  showNotificationPreview: true,
  autoCategorize: true,
  language: "en",
};

export function resolveUserSettings(settings?: Partial<UserSettings> | null): UserSettings {
  return {
    ...DEFAULT_USER_SETTINGS,
    ...settings,
  };
}
