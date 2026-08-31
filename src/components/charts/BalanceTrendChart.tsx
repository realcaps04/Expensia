import { useId } from "react";
import { smoothAreaPath, smoothLineSegments } from "./smooth-path";

const INCOME_COLOR = "#14B8A6";
const EXPENSE_COLOR = "#F87171";

type BalanceTrendChartProps = {
  points: number[];
  /** When expenses outweigh income for the period. */
  expenseLed?: boolean;
  height?: number;
  className?: string;
};

export function BalanceTrendChart({
  points,
  expenseLed = false,
  height = 80,
  className = "w-full",
}: BalanceTrendChartProps) {
  const reactId = useId().replace(/:/g, "");
  if (points.length < 2) return null;

  const width = 320;
  const padX = 8;
  const padY = 8;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const spread = max - min;
  const padding = spread === 0 ? Math.max(Math.abs(max) * 0.08, 1) : spread * 0.14;
  const scaleMin = min - padding;
  const scaleMax = max + padding;
  const range = scaleMax - scaleMin || 1;

  const coords = points.map((value, index) => ({
    x: padX + (index / (points.length - 1)) * innerW,
    y: padY + innerH - ((value - scaleMin) / range) * innerH,
  }));

  const trendingDown = points[points.length - 1] < points[0];
  const downTone = expenseLed || trendingDown;
  const fillColor = downTone ? EXPENSE_COLOR : INCOME_COLOR;
  const lastColor =
    points[points.length - 1] < points[points.length - 2]
      ? EXPENSE_COLOR
      : points[points.length - 1] > points[points.length - 2]
        ? INCOME_COLOR
        : fillColor;

  const segments = smoothLineSegments(coords);
  const areaPath = smoothAreaPath(coords, height - padY);
  const gradientId = `balanceTrend-${reactId}`;
  const last = coords[coords.length - 1];

  return (
    <div className={className} style={{ aspectRatio: `${width} / ${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.28" />
            <stop offset="70%" stopColor={fillColor} stopOpacity="0.06" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        {segments.map((d, index) => {
          const from = points[index];
          const to = points[index + 1];
          const color = to < from ? EXPENSE_COLOR : to > from ? INCOME_COLOR : fillColor;
          return (
            <g key={index}>
              <path
                d={d}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
        <circle cx={last.x} cy={last.y} r="4" fill="#FFFFFF" />
        <circle cx={last.x} cy={last.y} r="3" fill={lastColor} />
      </svg>
    </div>
  );
}
