import {
  KeyRound,
  LogOut,
  MonitorSmartphone,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  ProfileCard,
  ProfileSubScreen,
  ProfileToggle,
} from "../../components/profile/ProfileSubScreen";
import {
  ProfileMenuDivider,
  ProfileMenuRow,
  ProfileMenuSection,
} from "../../components/profile/ProfileMenuRow";
import { ConfirmSheet } from "../../components/sheets/ConfirmSheet";
import { useAuth } from "../../context/AuthProvider";
import { useProfileStats } from "../../hooks/useProfileStats";
import { formatLastSeen } from "../../lib/profile-achievements";
import { loadProfileExtras, saveProfileExtras } from "../../lib/profile-extras";

export function ProfileSecurityScreen() {
  const { signOut, user } = useAuth();
  const { convexUser } = useProfileStats();
  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  useEffect(() => {
    const extras = loadProfileExtras();
    setBiometric(extras.biometricLogin ?? false);
    setTwoFactor(extras.twoFactorAuth ?? false);
  }, []);

  const persistToggle = (patch: { biometricLogin?: boolean; twoFactorAuth?: boolean }) => {
    saveProfileExtras({ ...loadProfileExtras(), ...patch });
  };

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
                onClick={() => window.alert("Password change will be available in a future update.")}
              />
              <ProfileMenuDivider />
            </>
          ) : null}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary">
              <Shield className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-ink">Biometric Login</span>
            <ProfileToggle
              checked={biometric}
              onChange={(value) => {
                setBiometric(value);
                persistToggle({ biometricLogin: value });
              }}
            />
          </div>
          <ProfileMenuDivider />
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-secondary">
              <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-ink">Two-Factor Authentication</span>
            <ProfileToggle
              checked={twoFactor}
              onChange={(value) => {
                setTwoFactor(value);
                persistToggle({ twoFactorAuth: value });
              }}
            />
          </div>
          <ProfileMenuDivider />
          <ProfileMenuRow
            icon={MonitorSmartphone}
            label="Active Sessions"
            trailing={
              <span className="text-[0.75rem] font-medium text-ink-muted">This device</span>
            }
            onClick={() => window.alert("You are signed in on this device.")}
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
            icon={LogOut}
            label="Sign Out"
            danger
            onClick={() => setSignOutOpen(true)}
          />
          <ProfileMenuDivider />
          <ProfileMenuRow
            icon={Trash2}
            label="Delete Account"
            danger
            onClick={() => window.alert("Account deletion will be available in a future update.")}
          />
        </ProfileMenuSection>
      </ProfileSubScreen>

      <ConfirmSheet
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={() => {
          setSignOutOpen(false);
          signOut();
        }}
        title="Sign out?"
        message="You will need to sign in again to access your account."
        confirmLabel="Sign out"
      />
    </>
  );
}
