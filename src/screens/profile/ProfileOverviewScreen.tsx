import { Crown, Link2, Pencil, Target, Trophy } from "lucide-react";
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
import { formatCurrency } from "../../lib/format";
import { formatMemberSince } from "../../lib/profile-extras";

const ACHIEVEMENTS = [
  { title: "Budget Master", desc: "Stayed under budget for 3 months", emoji: "🏆" },
  { title: "Saving Streak", desc: "Saved money 7 days in a row", emoji: "🔥" },
  { title: "Goal Achiever", desc: "Completed your first savings goal", emoji: "🎯" },
];

export function ProfileOverviewScreen() {
  const { user } = useAuth();
  const { stats, convexUser, isLoading } = useProfileStats();
  const name = profileDisplayName(user);

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
          <ProfileAvatar name={name} picture={user?.picture} size="lg" showBadge />
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
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-2.5 py-1 text-[0.6875rem] font-semibold">
              <Crown className="h-3.5 w-3.5 text-amber-300" strokeWidth={2.5} />
              Premium Member
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Accounts", value: String(stats?.accountCount ?? 0) },
          { label: "Transactions", value: String(stats?.transactionCount ?? 0) },
          {
            label: "Total Incomes",
            value: isLoading ? "…" : formatCurrency(stats?.totalIncome ?? 0),
          },
          {
            label: "Total Expenses",
            value: isLoading ? "…" : formatCurrency(stats?.totalExpenses ?? 0),
          },
        ].map((item) => (
          <ProfileCard key={item.label} className="p-4">
            <p className="text-[1rem] font-bold text-ink">{item.value}</p>
            <p className="mt-1 text-[0.6875rem] font-medium text-ink-muted">{item.label}</p>
          </ProfileCard>
        ))}
      </div>

      <section>
        <p className="mb-3 px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
          Recent Achievements
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {ACHIEVEMENTS.map((item) => (
            <ProfileCard key={item.title} className="w-[9.5rem] shrink-0 p-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl">
                {item.emoji}
              </div>
              <p className="mt-3 text-[0.8125rem] font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-muted">{item.desc}</p>
            </ProfileCard>
          ))}
        </div>
      </section>

      <ProfileMenuSection title="">
        <ProfileMenuRow icon={Target} label="My Goals" onClick={() => window.alert("Goals coming soon.")} />
        <ProfileMenuDivider />
        <ProfileMenuRow icon={Link2} label="Connected Accounts" onClick={() => window.alert("Connect bank accounts coming soon.")} />
        <ProfileMenuDivider />
        <ProfileMenuRow icon={Trophy} label="View All Achievements" onClick={() => window.alert("Achievements coming soon.")} />
      </ProfileMenuSection>
    </ProfileSubScreen>
  );
}
