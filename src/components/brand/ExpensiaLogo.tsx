type ExpensiaMarkProps = {
  size?: number;
  className?: string;
};

export function ExpensiaMark({ size = 140, className = "" }: ExpensiaMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="eGrad" x1="35" y1="25" x2="105" y2="115" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="0.35" stopColor="#14B8A6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="barGrad" x1="66" y1="68" x2="94" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.48" r="0.52">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="55%" stopColor="#F8FAFC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#EEF2FF" stopOpacity="0" />
        </radialGradient>
        <filter id="softShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#6366F1" floodOpacity="0.14" />
        </filter>
      </defs>

      <circle cx="70" cy="68" r="56" fill="url(#glow)" />

      <g filter="url(#softShadow)">
        {/* Stylized E — three rounded bars + spine */}
        <path
          d="M34 34 h62 a10 10 0 0 1 0 20 H52 v0 H34 a10 10 0 0 1 0 -20 z"
          fill="url(#eGrad)"
        />
        <path
          d="M34 60 h48 a10 10 0 0 1 0 20 H34 a10 10 0 0 1 0 -20 z"
          fill="url(#eGrad)"
        />
        <path
          d="M34 86 h62 a10 10 0 0 1 0 20 H34 a10 10 0 0 1 0 -20 z"
          fill="url(#eGrad)"
        />
        <rect x="34" y="34" width="18" height="72" rx="9" fill="url(#eGrad)" />
      </g>

      {/* Rising chart + arrow in middle gap */}
      <rect x="66" y="80" width="4.5" height="9" rx="2" fill="url(#barGrad)" />
      <rect x="73.5" y="74" width="4.5" height="15" rx="2" fill="url(#barGrad)" />
      <rect x="81" y="68" width="4.5" height="21" rx="2" fill="url(#barGrad)" />
      <path
        d="M64 86 C70 76, 80 70, 90 64"
        stroke="#14B8A6"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M86 62 L90 64 L88.5 68"
        stroke="#14B8A6"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

type BrandLockupProps = {
  markSize?: number;
  showTagline?: boolean;
  compact?: boolean;
  className?: string;
};

export function BrandLockup({
  markSize = 132,
  showTagline = true,
  compact = false,
  className = "",
}: BrandLockupProps) {
  const size = compact ? (markSize ?? 76) : markSize;

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <ExpensiaMark size={size} className={compact ? "" : "animate-float"} />
      <h1
        className={`font-display font-semibold tracking-[-0.02em] text-ink ${
          compact ? "mt-3 text-[1.375rem]" : "mt-6 text-[2rem]"
        }`}
      >
        Expens<span className="gradient-text">ia</span>
      </h1>
      {showTagline ? (
        <p
          className={`font-medium tracking-[0.02em] text-ink-secondary ${
            compact ? "mt-1 text-[0.8125rem]" : "mt-2.5 text-[0.9375rem]"
          }`}
        >
          Track. Understand. Grow.
        </p>
      ) : null}
    </div>
  );
}
