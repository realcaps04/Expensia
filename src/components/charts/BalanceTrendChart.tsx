import { smoothAreaPath, smoothLinePath } from "./smooth-path";

type BalanceTrendChartProps = {
  points: number[];
  stroke?: string;
  height?: number;
  className?: string;
};

export function BalanceTrendChart({
  points,
  stroke = "#14B8A6",
  height = 88,
  className = "h-[5.5rem] w-full",
}: BalanceTrendChartProps) {
  if (points.length < 2) return null;

  const width = 320;
  const padX = 6;
  const padY = 10;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const spread = max - min;
  const padding = spread === 0 ? Math.max(Math.abs(max) * 0.08, 1) : spread * 0.12;
  const scaleMin = min - padding;
  const scaleMax = max + padding;
  const range = scaleMax - scaleMin || 1;

  const coords = points.map((value, index) => ({
    x: padX + (index / (points.length - 1)) * innerW,
    y: padY + innerH - ((value - scaleMin) / range) * innerH,
  }));

  const linePath = smoothLinePath(coords);
  const baselineY = height - padY;
  const areaPath = smoothAreaPath(coords, baselineY);
  const gradientId = `balanceTrend-${stroke.replace("#", "")}`;

  const showDots = points.length <= 18;

  return (
    <div className={`overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="55%" stopColor={stroke} stopOpacity="0.08" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {showDots
          ? coords.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="2.75"
                fill="#FFFFFF"
                stroke={stroke}
                strokeWidth="1.75"
                vectorEffect="non-scaling-stroke"
              />
            ))
          : (
              <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="3.25"
                fill="#FFFFFF"
                stroke={stroke}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )}
      </svg>
    </div>
  );
}
