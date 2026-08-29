type SparklineProps = {
  points: number[];
  width?: number;
  height?: number;
  stroke?: string;
  className?: string;
};

export function Sparkline({
  points,
  width = 120,
  height = 48,
  stroke = "#14B8A6",
  className = "h-12 w-[7.5rem] shrink-0",
}: SparklineProps) {
  if (points.length < 2) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const linePath = `M ${coords.join(" L ")}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const last = coords[coords.length - 1].split(",");
  const gradientId = `sparkFill-${stroke.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill={stroke} />
    </svg>
  );
}
