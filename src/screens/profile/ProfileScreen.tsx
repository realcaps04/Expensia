import {
  Bell,
  ChevronRight,
  Headphones,
  HelpCircle,
  LayoutGrid,
  Settings,
  Shield,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProfileAvatar, profileDisplayName } from "../../components/profile/ProfileAvatar";
import {
  ProfileMenuDivider,
  ProfileMenuRow,
  ProfileMenuSection,
} from "../../components/profile/ProfileMenuRow";
import { useAuth } from "../../context/AuthProvider";
import { useProfileStats } from "../../hooks/useProfileStats";
import { providerLabel } from "../../lib/profile-achievements";
import { formatCurrency } from "../../lib/format";
import { formatMemberSince } from "../../lib/profile-extras";

export function ProfileScreen() {
  const { user } = useAuth();
  const { stats, convexUser, isLoading } = useProfileStats();
  const name = profileDisplayName(user);
  const savings = stats?.savings ?? 0;

  return (
    <div className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-[390px] flex-col gap-5">
        <header className="flex items-center justify-between gap-3">
          <h1 className="font-display text-[1.375rem] font-bold text-ink">Profile</h1>
          <Link
            to="/home/profile/preferences"
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
          </Link>
        </header>

        <section className="overflow-hidden rounded-[24px] bg-gradient-to-br from-teal-brand via-teal-deep to-[#0f766e] p-5 text-white shadow-[0_16px_40px_rgba(13,148,136,0.28)]">
          <div className="flex items-start gap-4">
            <ProfileAvatar
              name={name}
              picture={user?.picture}
              size="lg"
              showBadge={user?.provider === "google"}
            />
            <div className="min-w-0 flex-1 pt-1">
              <p className="truncate font-display text-[1.125rem] font-bold">{name}</p>
              <p className="mt-0.5 truncate text-[0.8125rem] text-white/80">{user?.email}</p>
              <span className="mt-2 inline-flex items-center rounded-pill bg-white/15 px-2.5 py-1 text-[0.6875rem] font-semibold backdrop-blur-sm">
                {providerLabel(user?.provider)}
              </span>
              {convexUser ? (
                <p className="mt-2 text-[0.75rem] text-white/70">
                  Member since {formatMemberSince(convexUser.createdAt)}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-card bg-white px-4 py-4 shadow-soft">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[0.9375rem] font-bold text-expense">
                  {formatCurrency(stats?.totalExpenses ?? 0)}
                </p>
                <p className="mt-1 text-[0.6875rem] font-medium text-ink-muted">Total Expenses</p>
              </div>
              <div className="border-x border-surface-border px-2">
                <p className="text-[0.9375rem] font-bold text-income">
                  {formatCurrency(stats?.totalIncome ?? 0)}
                </p>
                <p className="mt-1 text-[0.6875rem] font-medium text-ink-muted">Total Income</p>
              </div>
              <div>
                <p
                  className={`text-[0.9375rem] font-bold ${
                    savings >= 0 ? "text-teal-deep" : "text-expense"
                  }`}
                >
                  {formatCurrency(savings, { signed: true })}
                </p>
                <p className="mt-1 text-[0.6875rem] font-medium text-ink-muted">Net Savings</p>
              </div>
            </div>
          )}
        </section>

        <Link
          to="/home/profile/overview"
          className="flex items-center gap-3 rounded-[20px] bg-[#1e293b] p-4 text-white shadow-[0_12px_32px_rgba(15,23,42,0.18)] transition-transform active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <LayoutGrid className="h-5 w-5 text-teal-light" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[0.9375rem] font-semibold">Profile Overview</p>
            <p className="mt-0.5 text-[0.75rem] text-white/70">
              {isLoading
                ? "Loading your stats…"
                : `${stats?.transactionCount ?? 0} transactions · ${stats?.creditCount ?? 0} credit accounts`}
            </p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[0.8125rem] font-semibold text-teal-light">
            View
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </Link>

        <ProfileMenuSection title="Account">
          <ProfileMenuRow icon={User} label="Personal Information" to="/home/profile/personal" />
          <ProfileMenuDivider />
          <ProfileMenuRow icon={Shield} label="Security" to="/home/profile/security" />
          <ProfileMenuDivider />
          <ProfileMenuRow icon={SlidersHorizontal} label="Preferences" to="/home/profile/preferences" />
          <ProfileMenuDivider />
          <ProfileMenuRow icon={Bell} label="Notification Settings" to="/home/profile/preferences" />
        </ProfileMenuSection>

        <ProfileMenuSection title="Support">
          <ProfileMenuRow icon={HelpCircle} label="Help Center" onClick={() => window.alert("Help center coming soon.")} />
          <ProfileMenuDivider />
          <ProfileMenuRow icon={Headphones} label="Contact Us" onClick={() => window.alert("Contact support at help@expensia.app")} />
        </ProfileMenuSection>
      </div>
    </div>
  );
}
