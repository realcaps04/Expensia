import { useId, useMemo, useRef, useState } from "react";
import { formatCurrency } from "../../lib/format";

const INCOME_COLOR = "#14B8A6";
const EXPENSE_COLOR = "#F87171";
const GRID_COLOR = "#E2E8F0";
const AXIS_COLOR = "#94A3B8";

export type TrendSeriesPoint = {
  date: string;
  value: number;
};

type TrendAreaChartProps = {
  points: TrendSeriesPoint[];
  /** Spending charts: rising values are expense-red. Balance charts: falling values are red. */
  invertTone?: boolean;
  expenseLed?: boolean;
  signed?: boolean;
  height?: number;
  className?: string;
};

function n(value: number) {
  return Number(value.toFixed(2));
}

function parseDateKey(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function formatAxisValue(value: number) {
  const sign = value < 0 ? "−" : "";
  const abs = Math.abs(value);
  if (abs >= 10_000_000) return `${sign}₹${Math.round(abs / 10_000_000)}Cr`;
  if (abs >= 100_000) {
    const lakhs = abs / 100_000;
    const rounded = lakhs >= 10 ? Math.round(lakhs) : Math.round(lakhs * 10) / 10;
    return `${sign}₹${rounded}L`.replace(".0L", "L");
  }
  if (abs >= 1000) return `${sign}₹${Math.round(abs / 1000)}K`;
  return `${sign}₹${Math.round(abs)}`;
}

function formatAxisDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(parseDateKey(date));
}

function formatTooltipDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseDateKey(date));
}

function niceStep(raw: number) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
  const err = raw / magnitude;
  if (err >= 7.5) return 10 * magnitude;
  if (err >= 3.5) return 5 * magnitude;
  if (err >= 1.5) return 2 * magnitude;
  return magnitude;
}

function niceTicks(min: number, max: number, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
  if (max === min) {
    const pad = Math.max(Math.abs(max) * 0.5, 1000);
    return niceTicks(min - pad, max + pad, count);
  }
  const step = niceStep((max - min) / (count - 1));
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Math.round(value * 1000) / 1000);
  }
  return ticks.length ? ticks : [0, max];
}

function pickXLabels(points: TrendSeriesPoint[], maxLabels = 7) {
  if (points.length <= maxLabels) return points.map((_, index) => index);
  const last = points.length - 1;
  const step = last / (maxLabels - 1);
  const indexes = Array.from({ length: maxLabels }, (_, i) => Math.round(i * step));
  return [...new Set(indexes)];
}

function toneForDelta(from: number, to: number, invertTone: boolean, fallback: string) {
  if (to === from) return fallback;
  const rising = to > from;
  if (invertTone) return rising ? EXPENSE_COLOR : INCOME_COLOR;
  return rising ? INCOME_COLOR : EXPENSE_COLOR;
}

export function TrendAreaChart({
  points,
  invertTone = false,
  expenseLed = false,
  signed = false,
  height = 196,
  className = "w-full",
}: TrendAreaChartProps) {
  const reactId = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const width = 360;
  const padL = 40;
  const padR = 12;
  const padT = 14;
  const padB = 26;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const values = points.map((point) => point.value);
  const ticks = useMemo(() => {
    const min = Math.min(0, ...values);
    const max = Math.max(...values, 1);
    return niceTicks(min, max, 5);
  }, [values]);

  const scaleMin = ticks[0] ?? 0;
  const scaleMax = ticks[ticks.length - 1] ?? 1;
  const range = scaleMax - scaleMin || 1;

  const coords = points.map((point, index) => ({
    x: padL + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW),
    y: padT + innerH - ((point.value - scaleMin) / range) * innerH,
    ...point,
  }));

  const xLabelIndexes = pickXLabels(points);
  const lastIndex = coords.length - 1;
  const last = coords[lastIndex];
  const first = coords[0];
  const trendingDown = last.value < first.value;
  const fillColor =
    expenseLed || (invertTone ? !trendingDown : trendingDown) ? EXPENSE_COLOR : INCOME_COLOR;
  const lastColor = toneForDelta(
    points[Math.max(0, lastIndex - 1)]?.value ?? last.value,
    last.value,
    invertTone,
    fillColor,
  );

  const linePath = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${n(point.x)} ${n(point.y)}`).join(" ");
  const areaPath = `${linePath} L ${n(last.x)} ${n(padT + innerH)} L ${n(first.x)} ${n(padT + innerH)} Z`;
  const gradientId = `trendFill-${reactId}`;
  const active = activeIndex !== null ? coords[activeIndex] : null;

  const moveTo = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || coords.length === 0) return;
    const x = ((clientX - rect.left) / rect.width) * width;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const dist = Math.abs(coords[i].x - x);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    setActiveIndex(best);
  };

  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-[16px] bg-slate-50 text-[0.8125rem] text-ink-muted"
        style={{ height }}
      >
        No activity in this period
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
      onPointerMove={(event) => moveTo(event.clientX)}
      onPointerDown={(event) => moveTo(event.clientX)}
      onPointerLeave={() => setActiveIndex(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
        role="img"
        aria-label="Trend chart"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.28" />
            <stop offset="62%" stopColor={fillColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => {
          const y = padT + innerH - ((tick - scaleMin) / range) * innerH;
          return (
            <g key={tick}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                stroke={GRID_COLOR}
                strokeWidth="1"
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                fill={AXIS_COLOR}
                fontSize="9"
                fontWeight="500"
              >
                {formatAxisValue(tick)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill={`url(#${gradientId})`} />

        {coords.slice(0, -1).map((from, index) => {
          const to = coords[index + 1];
          const color = toneForDelta(from.value, to.value, invertTone, fillColor);
          return (
            <path
              key={index}
              d={`M ${n(from.x)} ${n(from.y)} L ${n(to.x)} ${n(to.y)}`}
              fill="none"
              stroke={color}
              strokeWidth="2.25"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit={8}
            />
          );
        })}

        {coords.length <= 32
          ? coords.map((point, index) =>
              index === lastIndex ? null : (
                <circle key={index} cx={point.x} cy={point.y} r="3.1" fill={fillColor} />
              ),
            )
          : null}

        {xLabelIndexes.map((index) => (
          <text
            key={points[index].date + index}
            x={coords[index].x}
            y={height - 8}
            textAnchor="middle"
            fill={AXIS_COLOR}
            fontSize="9"
            fontWeight="500"
          >
            {formatAxisDate(points[index].date)}
          </text>
        ))}

        {active ? (
          <line
            x1={active.x}
            x2={active.x}
            y1={padT}
            y2={padT + innerH}
            stroke={lastColor}
            strokeWidth="1.25"
            strokeDasharray="3.5 3.5"
          />
        ) : null}

        <g transform={`translate(${n(last.x)} ${n(last.y)})`}>
          <circle
            r="7"
            fill={lastColor}
            className="origin-center animate-graph-pulse [transform-box:fill-box]"
          />
          <circle
            r="7"
            fill={lastColor}
            className="origin-center animate-graph-pulse [transform-box:fill-box] [animation-delay:850ms]"
          />
          <circle r="4.2" fill="#FFFFFF" />
          <circle r="2.8" fill={lastColor} />
        </g>

        {active && activeIndex !== lastIndex ? (
          <>
            <circle cx={active.x} cy={active.y} r="5.5" fill="#FFFFFF" />
            <circle cx={active.x} cy={active.y} r="3.6" fill={fillColor} />
          </>
        ) : null}
      </svg>

      {active ? (
        <div
          className="pointer-events-none absolute z-10 -translate-y-full rounded-[12px] bg-white px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
          style={{
            left: `${(active.x / width) * 100}%`,
            top: `${(active.y / height) * 100}%`,
            transform:
              active.x > width * 0.62
                ? "translate(-100%, calc(-100% - 10px))"
                : "translate(8px, calc(-100% - 10px))",
          }}
        >
          <p className="text-[0.6875rem] font-medium text-ink-muted">{formatTooltipDate(active.date)}</p>
          <p className="mt-0.5 text-[0.875rem] font-bold text-ink">
            {formatCurrency(active.value, signed ? { signed: true } : undefined)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
