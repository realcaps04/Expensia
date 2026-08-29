import { useAuth } from "../context/AuthProvider";
import { getDisplayName } from "../lib/session";

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 max-w-xs text-sm text-ink-secondary">{description}</p>
    </div>
  );
}

export function ActivityScreen() {
  return (
    <PlaceholderPage
      title="Activity"
      description="Your full transaction timeline will appear here."
    />
  );
}

export { InsightsScreen } from "./InsightsScreen";

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <div className="px-5 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-[390px] rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img
              src={user.picture}
              alt=""
              className="h-16 w-16 rounded-full border border-surface-border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-brand to-violet-brand text-xl font-semibold text-white">
              {getDisplayName(user).charAt(0)}
            </div>
          )}
          <div>
            <p className="font-display text-lg font-semibold text-ink">{getDisplayName(user)}</p>
            <p className="text-sm text-ink-secondary">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="mt-6 w-full rounded-[14px] border border-surface-border py-3 text-sm font-semibold text-ink-secondary transition-colors hover:bg-slate-50 hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
