function AuthBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="authWaveTR" x1="390" y1="0" x2="220" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A5B4FC" stopOpacity="0.4" />
          <stop offset="0.5" stopColor="#5EEAD4" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FAFAF8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="authWaveBL" x1="0" y1="844" x2="180" y2="680" gradientUnits="userSpaceOnUse">
          <stop stopColor="#99F6E4" stopOpacity="0.35" />
          <stop offset="1" stopColor="#C7D2FE" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <rect width="390" height="844" fill="#FAFAF8" />

      {/* top-right wave */}
      <path
        d="M390 0 C320 40, 280 100, 260 180 S220 280, 390 320 L390 0 Z"
        fill="url(#authWaveTR)"
      />
      <path
        d="M390 20 C330 60, 290 120, 275 200 S240 300, 420 340"
        stroke="#CBD5E1"
        strokeWidth="1"
        strokeOpacity="0.35"
        fill="none"
      />

      {/* bottom-left wave */}
      <path
        d="M0 844 C80 780, 120 720, 140 640 S180 540, 0 500 L0 844 Z"
        fill="url(#authWaveBL)"
      />
      <path
        d="M0 820 C70 760, 110 700, 130 620 S170 520, -20 480"
        stroke="#A5B4FC"
        strokeWidth="1"
        strokeOpacity="0.25"
        fill="none"
      />

      {/* soft circles */}
      <circle cx="320" cy="120" r="48" fill="#E0E7FF" fillOpacity="0.35" />
      <circle cx="60" cy="680" r="64" fill="#CCFBF1" fillOpacity="0.3" />
      <circle cx="340" cy="760" r="32" fill="#E0E7FF" fillOpacity="0.25" />
      <circle cx="48" cy="200" r="24" fill="#F1F5F9" fillOpacity="0.8" />
    </svg>
  );
}

export { AuthBackground };
