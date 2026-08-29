import { useMutation } from "convex/react";
import { Bell, Database, Download, Eye, Languages, Sparkles, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import {
  ProfilePreferenceRow,
  ProfileSubScreen,
  ProfileSelect,
} from "../../components/profile/ProfileSubScreen";
import { ProfileMenuDivider, ProfileMenuSection } from "../../components/profile/ProfileMenuRow";
import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeProvider";
import { useProfileStats } from "../../hooks/useProfileStats";
import { convexUserToProfile } from "../../lib/convex-mappers";
import { formatLastSeen } from "../../lib/profile-achievements";
import { resolveUserSettings } from "../../lib/user-settings";
import type { Doc } from "../../../convex/_generated/dataModel";

type Theme = Doc<"users">["settings"]["theme"];

export function ProfilePreferencesScreen() {
  const { syncUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { userId, convexUser } = useProfileStats();
  const updateProfile = useMutation(api.users.updateProfile);

  const settings = resolveUserSettings(convexUser?.settings);
  const [currency, setCurrency] = useState(settings.currency);
  const [language, setLanguage] = useState(settings.language ?? "en");

  useEffect(() => {
    if (!convexUser?.settings) return;
    setCurrency(convexUser.settings.currency);
    setLanguage(convexUser.settings.language ?? "en");
  }, [convexUser?.settings?.currency, convexUser?.settings?.language]);

  const persistSettings = async (patch: Partial<typeof settings>) => {
    if (!userId) return;
    const next = { ...settings, ...patch };
    const updated = await updateProfile({ userId, settings: next });
    syncUser(convexUserToProfile(updated));
  };

  const themeOptions: { id: Theme; label: string }[] = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "system", label: "System" },
  ];

  const currencyOptions = [
    { value: "INR", label: "INR (₹)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
  ] as const;

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
  ] as const;

  const preferenceItems = [
    {
      label: "Show Account Balance",
      icon: Eye,
      checked: settings.showBalance ?? true,
      key: "showBalance" as const,
    },
    {
      label: "Show Notifications Preview",
      icon: Bell,
      checked: settings.showNotificationPreview ?? true,
      key: "showNotificationPreview" as const,
    },
    {
      label: "Auto-categorize Transactions",
      icon: Sparkles,
      checked: settings.autoCategorize ?? true,
      key: "autoCategorize" as const,
    },
    {
      label: "Push Notifications",
      icon: Bell,
      checked: settings.notifications,
      key: "notifications" as const,
    },
  ] as const;

  return (
    <ProfileSubScreen title="Preferences">
      <ProfileMenuSection title="Display">
        <div className="px-4 py-4">
          <p className="mb-2 text-[0.75rem] font-medium text-ink-muted">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTheme(id);
                  void persistSettings({ theme: id });
                }}
                className={`rounded-[12px] py-2.5 text-[0.8125rem] font-semibold transition-colors ${
                  theme === id
                    ? "bg-teal-brand text-white shadow-sm"
                    : "bg-slate-50 text-ink-secondary dark:bg-slate-700 dark:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <ProfileMenuDivider />
        <label className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary dark:bg-slate-700/60">
            <Wallet className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-ink">Currency</span>
          <ProfileSelect
            value={currency}
            onChange={(value) => {
              setCurrency(value);
              void persistSettings({ currency: value });
            }}
            options={currencyOptions}
          />
        </label>
        <ProfileMenuDivider />
        <label className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary dark:bg-slate-700/60">
            <Languages className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-ink">Language</span>
          <ProfileSelect
            value={language}
            onChange={(value) => {
              setLanguage(value);
              void persistSettings({ language: value });
            }}
            options={languageOptions}
          />
        </label>
      </ProfileMenuSection>

      <ProfileMenuSection title="App Preferences">
        {preferenceItems.map((item, index) => (
          <div key={item.key}>
            <ProfilePreferenceRow
              icon={item.icon}
              label={item.label}
              checked={item.checked}
              onChange={(value) => void persistSettings({ [item.key]: value })}
            />
            {index < preferenceItems.length - 1 ? <ProfileMenuDivider /> : null}
          </div>
        ))}
      </ProfileMenuSection>

      <ProfileMenuSection title="Data & Sync">
        <button
          type="button"
          onClick={() => window.alert("Last backup: Today")}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-50 dark:active:bg-slate-700/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary dark:bg-slate-700/60">
            <Database className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.9375rem] font-medium text-ink">Data Backup</span>
            <span className="mt-0.5 block text-[0.75rem] text-ink-muted">
              Last synced: {formatLastSeen(convexUser?.updatedAt)}
            </span>
          </span>
        </button>
        <ProfileMenuDivider />
        <button
          type="button"
          onClick={() => window.alert("Export to CSV/PDF coming soon.")}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-50 dark:active:bg-slate-700/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary dark:bg-slate-700/60">
            <Download className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="text-[0.9375rem] font-medium text-ink">Export Data</span>
        </button>
      </ProfileMenuSection>
    </ProfileSubScreen>
  );
}
