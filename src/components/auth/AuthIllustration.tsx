import type { LucideIcon } from "lucide-react";

type AuthIllustrationProps = {
  icon: LucideIcon;
  accent?: "teal" | "sky" | "violet";
};

const ACCENTS = {
  teal: {
    ring: "from-teal-brand/20 to-teal-brand/5",
    icon: "bg-teal-brand/10 text-teal-brand",
  },
  sky: {
    ring: "from-sky-400/20 to-sky-400/5",
    icon: "bg-sky-50 text-sky-600",
  },
  violet: {
    ring: "from-violet-500/20 to-violet-500/5",
    icon: "bg-violet-50 text-violet-600",
  },
};

export function AuthIllustration({ icon: Icon, accent = "teal" }: AuthIllustrationProps) {
  const colors = ACCENTS[accent];

  return (
    <div
      className={`mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${colors.ring}`}
    >
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${colors.icon}`}>
        <Icon className="h-8 w-8" strokeWidth={1.75} />
      </span>
    </div>
  );
}
