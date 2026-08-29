import { useMutation } from "convex/react";
import {
  Calendar,
  Camera,
  Globe,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { ProfileAvatar, profileDisplayName } from "../../components/profile/ProfileAvatar";
import {
  ProfileCard,
  ProfileField,
  ProfileSubScreen,
} from "../../components/profile/ProfileSubScreen";
import { useAuth } from "../../context/AuthProvider";
import { useProfileStats } from "../../hooks/useProfileStats";
import { convexUserToProfile } from "../../lib/convex-mappers";
import { providerLabel } from "../../lib/profile-achievements";
import { loadProfileExtras, saveProfileExtras, formatMemberSince } from "../../lib/profile-extras";
import { toDateInputValue } from "../../lib/datetime";

export function ProfilePersonalInfoScreen() {
  const { user, syncUser } = useAuth();
  const { userId, convexUser } = useProfileStats();
  const updateProfile = useMutation(api.users.updateProfile);

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const extras = loadProfileExtras();
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setPhone(convexUser?.contactNumber ?? "");
    setDob(extras.dateOfBirth ?? "");
    setGender(extras.gender ?? "");
    setCountry(extras.country ?? "");
  }, [user, convexUser]);

  const name = profileDisplayName(user);

  const handleSave = async () => {
    if (!userId) return;
    setBusy(true);
    setMessage("");
    try {
      const updated = await updateProfile({
        userId,
        firstName,
        lastName,
        contactNumber: phone || undefined,
      });
      syncUser(convexUserToProfile(updated));
      saveProfileExtras({ dateOfBirth: dob, gender, country });
      setMessage("Changes saved.");
    } catch {
      setMessage("Could not save changes.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProfileSubScreen
      title="Personal Information"
      footer={
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleSave()}
          className="gradient-btn w-full rounded-[16px] py-3.5 text-[0.9375rem] font-semibold text-white shadow-btn disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save Changes"}
        </button>
      }
    >
      <ProfileCard className="px-5 py-6 text-center">
        <div className="relative mx-auto w-fit">
        <ProfileAvatar
          name={name}
          picture={user?.picture}
          size="xl"
          showBadge={user?.provider === "google"}
        />
          <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-teal-brand text-white shadow-md">
            <Camera className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
        <p className="mt-4 font-display text-[1.125rem] font-bold text-ink">{name}</p>
        <p className="mt-1 text-[0.8125rem] text-ink-secondary">{providerLabel(user?.provider)}</p>
        {convexUser ? (
          <p className="mt-1 text-[0.75rem] text-ink-muted">
            Member since {formatMemberSince(convexUser.createdAt)}
          </p>
        ) : null}
      </ProfileCard>

      <div className="space-y-4">
        <ProfileField label="Full Name" icon={User}>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-transparent text-[0.9375rem] text-ink outline-none"
              placeholder="First name"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-transparent text-[0.9375rem] text-ink outline-none"
              placeholder="Last name"
            />
          </div>
        </ProfileField>

        <ProfileField label="Email Address" icon={Mail}>
          <input
            value={email}
            readOnly
            className="w-full bg-transparent text-[0.9375rem] text-ink-secondary outline-none"
          />
        </ProfileField>

        <ProfileField label="Phone Number" icon={Phone}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full bg-transparent text-[0.9375rem] text-ink outline-none"
          />
        </ProfileField>

        <ProfileField label="Date of Birth" icon={Calendar}>
          <input
            type="date"
            value={dob}
            max={toDateInputValue()}
            onChange={(e) => setDob(e.target.value)}
            className="w-full bg-transparent text-[0.9375rem] text-ink outline-none"
          />
        </ProfileField>

        <ProfileField label="Gender" icon={Users}>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-transparent text-[0.9375rem] text-ink outline-none"
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </ProfileField>

        <ProfileField label="Country" icon={Globe}>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-transparent text-[0.9375rem] text-ink outline-none"
          >
            <option value="">Select country</option>
            <option>India</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>Australia</option>
          </select>
        </ProfileField>
      </div>

      {message ? <p className="text-center text-[0.8125rem] font-medium text-teal-brand">{message}</p> : null}
    </ProfileSubScreen>
  );
}
