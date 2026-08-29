const CATEGORY_COLORS: Record<string, string> = {
  food: "#14B8A6",
  transport: "#6366F1",
  shopping: "#F87171",
  bills: "#F59E0B",
  entertainment: "#A855F7",
  health: "#EC4899",
  salary: "#0D9488",
  freelance: "#3B82F6",
  other: "#94A3B8",
  credit: "#0EA5E9",
};

export type DonutSegment = {
  label: string;
  amount: number;
  percentage: number;
  color?: string;
};

type DonutChartProps = {
  segments: DonutSegment[];
  totalLabel: string;
  size?: number;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const sweep = endAngle - startAngle;
  if (sweep <= 0) return "";

  const largeArc = sweep > 180 ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function DonutChart({ segments, totalLabel, size = 176 }: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.46;
  const innerRadius = size * 0.31;
  const gapDegrees = segments.length > 1 ? 2.5 : 0;
  const total = segments.reduce((sum, segment) => sum + segment.amount, 0);

  if (total <= 0) {
    return (
      <div
        className="relative mx-auto flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/50"
        style={{ width: size, height: size }}
      >
        <p className="px-4 text-center text-[0.75rem] text-ink-muted">No spending yet</p>
      </div>
    );
  }

  let cursor = 0;
  const slices = segments.map((segment, index) => {
    const sweep = (segment.amount / total) * 360;
    const start = cursor + gapDegrees / 2;
    const end = cursor + sweep - gapDegrees / 2;
    cursor += sweep;

    const color =
      segment.color ?? CATEGORY_COLORS[segment.label.toLowerCase()] ?? CATEGORY_COLORS.other;

    return {
      key: `${segment.label}-${index}`,
      color,
      d: describeDonutSlice(cx, cy, outerRadius, innerRadius, start, end),
    };
  });

  return (
    <div className="relative mx-auto shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        role="img"
        aria-label={`Spending breakdown chart, total ${totalLabel}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={(outerRadius + innerRadius) / 2}
          fill="none"
          stroke="#EEF2F6"
          strokeWidth={outerRadius - innerRadius}
          className="dark:stroke-slate-700/60"
        />
        {slices.map((slice) =>
          slice.d ? (
            <path
              key={slice.key}
              d={slice.d}
              fill={slice.color}
              className="transition-opacity duration-200"
            />
          ) : null,
        )}
        <circle cx={cx} cy={cy} r={innerRadius - 1} fill="white" className="dark:fill-[var(--bg-card)]" />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className="max-w-full truncate font-display text-[1.0625rem] font-bold leading-tight text-ink">
          {totalLabel}
        </p>
        <p className="mt-0.5 text-[0.6875rem] font-medium text-ink-muted">Total spent</p>
      </div>
    </div>
  );
}

export function categoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
}
