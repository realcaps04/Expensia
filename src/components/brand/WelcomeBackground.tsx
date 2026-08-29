function WelcomeBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="waveTop" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C7D2FE" stopOpacity="0.35" />
          <stop offset="1" stopColor="#99F6E4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="waveBottom" x1="390" y1="844" x2="190" y2="644" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A5B4FC" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#67E8F9" stopOpacity="0.2" />
          <stop offset="1" stopColor="#FAFAF8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="waveStroke" x1="0" y1="120" x2="280" y2="320" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CBD5E1" stopOpacity="0.5" />
          <stop offset="1" stopColor="#E2E8F0" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <rect width="390" height="844" fill="#FAFAF8" />

      {/* top-left soft wash */}
      <ellipse cx="60" cy="80" rx="140" ry="120" fill="url(#waveTop)" />

      {/* top flowing line */}
      <path
        d="M-20 60 C40 20, 120 40, 180 90 S300 130, 420 80"
        stroke="url(#waveStroke)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M-10 95 C50 55, 130 75, 190 125 S310 165, 430 115"
        stroke="url(#waveStroke)"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />

      {/* bottom-right wave */}
      <path
        d="M390 720 C320 680, 260 700, 200 760 S80 820, -20 844 L390 844 Z"
        fill="url(#waveBottom)"
      />
      <path
        d="M390 680 C310 640, 240 660, 170 720 S60 790, -30 820"
        stroke="#A5B4FC"
        strokeWidth="1.2"
        strokeOpacity="0.25"
        fill="none"
      />
      <path
        d="M390 710 C315 675, 250 695, 185 750 S70 805, -20 830"
        stroke="#5EEAD4"
        strokeWidth="1"
        strokeOpacity="0.2"
        fill="none"
      />
    </svg>
  );
}

export { WelcomeBackground };
