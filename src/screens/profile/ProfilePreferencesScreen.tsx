import { useMutation } from "convex/react";
import { Bell, Database, Download, Eye, Languages, Sparkles, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import {
  ProfileSubScreen,
  ProfileSelect,
  ProfileToggle,
} from "../../components/profile/ProfileSubScreen";
import { ProfileMenuDivider, ProfileMenuSection } from "../../components/profile/ProfileMenuRow";
import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeProvider";
import { useProfileStats } from "../../hooks/useProfileStats";
import { convexUserToProfile } from "../../lib/convex-mappers";
import { formatLastSeen } from "../../lib/profile-achievements";
import type { Doc } from "../../../convex/_generated/dataModel";

type Theme = Doc<"users">["settings"]["theme"];

export function ProfilePreferencesScreen() {
  const { syncUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { userId, convexUser } = useProfileStats();
  const updateProfile = useMutation(api.users.updateProfile);

  const settings = convexUser?.settings;
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("en");
  const [showBalance, setShowBalance] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [autoCategorize, setAutoCategorize] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!settings) return;
    setCurrency(settings.currency);
    setLanguage(settings.language ?? "en");
    setShowBalance(settings.showBalance ?? true);
    setShowPreview(settings.showNotificationPreview ?? true);
    setAutoCategorize(settings.autoCategorize ?? true);
    setNotifications(settings.notifications);
  }, [settings]);

  const persistSettings = async (patch: Partial<NonNullable<typeof settings>>) => {
    if (!userId || !settings) return;
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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary">
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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary">
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
        {[
          {
            label: "Show Account Balance",
            icon: Eye,
            checked: showBalance,
            key: "showBalance" as const,
            setter: setShowBalance,
          },
          {
            label: "Show Notifications Preview",
            icon: Bell,
            checked: showPreview,
            key: "showNotificationPreview" as const,
            setter: setShowPreview,
          },
          {
            label: "Auto-categorize Transactions",
            icon: Sparkles,
            checked: autoCategorize,
            key: "autoCategorize" as const,
            setter: setAutoCategorize,
          },
          {
            label: "Push Notifications",
            icon: Bell,
            checked: notifications,
            key: "notifications" as const,
            setter: setNotifications,
          },
        ].map((item, index, arr) => (
          <div key={item.key}>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary">
                <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-ink">{item.label}</span>
              <ProfileToggle
                checked={item.checked}
                onChange={(value) => {
                  item.setter(value);
                  void persistSettings({ [item.key]: value });
                }}
              />
            </div>
            {index < arr.length - 1 ? <ProfileMenuDivider /> : null}
          </div>
        ))}
      </ProfileMenuSection>

      <ProfileMenuSection title="Data & Sync">
        <button
          type="button"
          onClick={() => window.alert("Last backup: Today")}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary">
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
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary">
            <Download className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="text-[0.9375rem] font-medium text-ink">Export Data</span>
        </button>
      </ProfileMenuSection>
    </ProfileSubScreen>
  );
}
