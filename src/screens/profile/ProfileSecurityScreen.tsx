import {
  KeyRound,
  LogOut,
  MonitorSmartphone,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileCard, ProfileSubScreen } from "../../components/profile/ProfileSubScreen";
import {
  ProfileMenuDivider,
  ProfileMenuRow,
  ProfileMenuSection,
} from "../../components/profile/ProfileMenuRow";
import { ConfirmSheet } from "../../components/sheets/ConfirmSheet";
import { useAuth } from "../../context/AuthProvider";
import { useProfileStats } from "../../hooks/useProfileStats";
import { formatLastSeen } from "../../lib/profile-achievements";

const comingSoon = (
  <span className="text-[0.75rem] font-medium text-ink-muted">Coming soon</span>
);

export function ProfileSecurityScreen() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { convexUser } = useProfileStats();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const isEmailAccount = user?.provider === "email";

  return (
    <>
      <ProfileSubScreen title="Security">
        <ProfileMenuSection title="Account Security">
          {isEmailAccount ? (
            <>
              <ProfileMenuRow
                icon={KeyRound}
                label="Change Password"
                trailing={comingSoon}
                disabled
              />
              <ProfileMenuDivider />
            </>
          ) : null}
          <ProfileMenuRow
            icon={Shield}
            label="Biometric Login"
            trailing={comingSoon}
            disabled
          />
          <ProfileMenuDivider />
          <ProfileMenuRow
            icon={ShieldCheck}
            label="Two-Factor Authentication"
            trailing={comingSoon}
            disabled
          />
          <ProfileMenuDivider />
          <ProfileMenuRow
            icon={MonitorSmartphone}
            label="Active Sessions"
            trailing={comingSoon}
            disabled
          />
        </ProfileMenuSection>

        <ProfileCard className="border border-emerald-100 bg-emerald-50/40 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-income">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <p className="text-[0.9375rem] font-semibold text-ink">Your account is secure</p>
              <p className="mt-1 text-[0.8125rem] text-ink-secondary">
                Last active: {formatLastSeen(convexUser?.lastSeenAt)}
              </p>
            </div>
          </div>
        </ProfileCard>

        <ProfileMenuSection title="Danger Zone">
          <ProfileMenuRow
            icon={Trash2}
            label="Delete Account"
            trailing={comingSoon}
            danger
            disabled
          />
        </ProfileMenuSection>

        <button
          type="button"
          onClick={() => setSignOutOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-card border border-rose-200 bg-white py-3.5 text-[0.9375rem] font-semibold text-expense shadow-soft transition-colors hover:bg-rose-50 active:scale-[0.99]"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          Sign Out
        </button>
      </ProfileSubScreen>

      <ConfirmSheet
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={() => {
          setSignOutOpen(false);
          signOut();
          navigate("/login", { replace: true });
        }}
        title="Sign out?"
        message="You will need to sign in again to access your account."
        confirmLabel="Sign out"
      />
    </>
  );
}
