import { CreditCard, Link2, Pencil, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { ProfileAvatar, profileDisplayName } from "../../components/profile/ProfileAvatar";
import {
  ProfileCard,
  ProfileSubScreen,
} from "../../components/profile/ProfileSubScreen";
import {
  ProfileMenuDivider,
  ProfileMenuRow,
  ProfileMenuSection,
} from "../../components/profile/ProfileMenuRow";
import { useAuth } from "../../context/AuthProvider";
import { useProfileStats } from "../../hooks/useProfileStats";
import {
  getProfileAchievements,
  providerLabel,
} from "../../lib/profile-achievements";
import { formatCurrency } from "../../lib/format";
import { formatMemberSince } from "../../lib/profile-extras";

export function ProfileOverviewScreen() {
  const { user } = useAuth();
  const { stats, convexUser, isLoading } = useProfileStats();
  const name = profileDisplayName(user);
  const achievements = getProfileAchievements(stats);
  const savings = stats?.savings ?? 0;

  return (
    <ProfileSubScreen
      title="Profile Overview"
      action={
        <Link
          to="/home/profile/personal"
          aria-label="Edit profile"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary"
        >
          <Pencil className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>
      }
    >
      <section className="overflow-hidden rounded-[24px] bg-gradient-to-br from-teal-brand via-teal-deep to-[#0f766e] p-5 text-white shadow-[0_16px_40px_rgba(13,148,136,0.28)]">
        <div className="flex items-start gap-4">
          <ProfileAvatar
            name={name}
            picture={user?.picture}
            size="lg"
            showBadge={user?.provider === "google"}
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[1.125rem] font-bold">{name}</p>
            <p className="mt-1 text-[0.8125rem] text-white/80">{user?.email}</p>
            {convexUser?.contactNumber ? (
              <p className="mt-0.5 text-[0.8125rem] text-white/70">{convexUser.contactNumber}</p>
            ) : null}
            {convexUser ? (
              <p className="mt-1 text-[0.75rem] text-white/60">
                Joined {formatMemberSince(convexUser.createdAt)}
              </p>
            ) : null}
            <span className="mt-2 inline-flex items-center rounded-pill bg-white/15 px-2.5 py-1 text-[0.6875rem] font-semibold">
              {providerLabel(user?.provider)}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Credit Accounts", value: String(stats?.creditCount ?? 0) },
          { label: "Transactions", value: String(stats?.transactionCount ?? 0) },
          {
            label: "Total Income",
            value: isLoading ? "…" : formatCurrency(stats?.totalIncome ?? 0),
          },
          {
            label: "Total Expenses",
            value: isLoading ? "…" : formatCurrency(stats?.totalExpenses ?? 0),
          },
          {
            label: "Net Savings",
            value: isLoading ? "…" : formatCurrency(savings, { signed: true }),
            valueClass: savings >= 0 ? "text-teal-deep" : "text-expense",
          },
          {
            label: "Credit Balance",
            value: isLoading ? "…" : formatCurrency(stats?.creditBalance ?? 0),
            valueClass: "text-sky-600",
          },
        ].map((item) => (
          <ProfileCard key={item.label} className="p-4">
            <p className={`text-[1rem] font-bold text-ink ${item.valueClass ?? ""}`}>{item.value}</p>
            <p className="mt-1 text-[0.6875rem] font-medium text-ink-muted">{item.label}</p>
          </ProfileCard>
        ))}
      </div>

      {!isLoading && (stats?.monthIncome || stats?.monthExpenses) ? (
        <ProfileCard className="p-4">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-ink-muted">This month</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[0.875rem] font-bold text-income">
                {formatCurrency(stats?.monthIncome ?? 0)}
              </p>
              <p className="mt-1 text-[0.6875rem] text-ink-muted">Income</p>
            </div>
            <div>
              <p className="text-[0.875rem] font-bold text-expense">
                {formatCurrency(stats?.monthExpenses ?? 0)}
              </p>
              <p className="mt-1 text-[0.6875rem] text-ink-muted">Expenses</p>
            </div>
            <div>
              <p
                className={`text-[0.875rem] font-bold ${
                  (stats?.monthNet ?? 0) >= 0 ? "text-teal-deep" : "text-expense"
                }`}
              >
                {formatCurrency(stats?.monthNet ?? 0, { signed: true })}
              </p>
              <p className="mt-1 text-[0.6875rem] text-ink-muted">Net</p>
            </div>
          </div>
        </ProfileCard>
      ) : null}

      <section>
        <p className="mb-3 px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
          Achievements
        </p>
        {achievements.length === 0 ? (
          <ProfileCard className="px-4 py-8 text-center">
            <p className="text-[0.875rem] font-medium text-ink">No achievements yet</p>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              Add transactions and credit accounts to unlock badges.
            </p>
          </ProfileCard>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {achievements.map((item) => (
              <ProfileCard key={item.id} className="w-[9.5rem] shrink-0 p-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl">
                  {item.emoji}
                </div>
                <p className="mt-3 text-[0.8125rem] font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-muted">{item.description}</p>
              </ProfileCard>
            ))}
          </div>
        )}
      </section>

      <ProfileMenuSection title="">
        <ProfileMenuRow
          icon={CreditCard}
          label="Credit Accounts"
          to="/home/activity"
        />
        <ProfileMenuDivider />
        <ProfileMenuRow icon={Target} label="My Goals" onClick={() => window.alert("Goals coming soon.")} />
        <ProfileMenuDivider />
        <ProfileMenuRow icon={Link2} label="Connected Accounts" onClick={() => window.alert("Connect bank accounts coming soon.")} />
        <ProfileMenuDivider />
        <ProfileMenuRow icon={Trophy} label="View All Achievements" onClick={() => window.alert(`${achievements.length} achievement(s) unlocked.`)} />
      </ProfileMenuSection>
    </ProfileSubScreen>
  );
}
