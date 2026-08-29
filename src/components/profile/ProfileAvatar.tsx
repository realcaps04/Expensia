import { BadgeCheck } from "lucide-react";
import { getDisplayName } from "../../lib/session";

type ProfileAvatarProps = {
  name: string;
  picture?: string;
  size?: "md" | "lg" | "xl";
  showBadge?: boolean;
  editable?: boolean;
};

const SIZES = {
  md: "h-16 w-16 text-xl",
  lg: "h-20 w-20 text-2xl",
  xl: "h-24 w-24 text-3xl",
};

export function ProfileAvatar({
  name,
  picture,
  size = "md",
  showBadge = false,
}: ProfileAvatarProps) {
  const initial = name.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative shrink-0">
      {picture ? (
        <img
          src={picture}
          alt=""
          className={`${SIZES[size]} rounded-full border-[3px] border-white/80 object-cover shadow-soft`}
        />
      ) : (
        <div
          className={`flex ${SIZES[size]} items-center justify-center rounded-full border-[3px] border-white/80 bg-white/20 font-semibold text-white shadow-soft`}
        >
          {initial}
        </div>
      )}
      {showBadge ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-teal-brand shadow-sm">
          <BadgeCheck className="h-4 w-4" strokeWidth={2.5} />
        </span>
      ) : null}
    </div>
  );
}

export function profileDisplayName(user: Parameters<typeof getDisplayName>[0]) {
  return getDisplayName(user);
}
