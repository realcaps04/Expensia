const LOGO_SRC = "/logo.png";

type ExpensiaMarkProps = {
  size?: number;
  className?: string;
};

export function ExpensiaMark({ size = 140, className = "" }: ExpensiaMarkProps) {
  return (
    <img
      src={LOGO_SRC}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`block select-none object-contain ${className}`}
    />
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

export { LOGO_SRC };
