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

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function DonutChart({ segments, totalLabel, size = 168 }: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const stroke = size * 0.14;
  const total = segments.reduce((sum, s) => sum + s.amount, 0);

  if (total <= 0) {
    return (
      <div
        className="relative mx-auto flex items-center justify-center rounded-full bg-slate-100"
        style={{ width: size, height: size }}
      >
        <p className="text-center text-[0.75rem] text-ink-muted">No spending yet</p>
      </div>
    );
  }

  let cursor = 0;
  const arcs = segments.map((segment, index) => {
    const sweep = (segment.amount / total) * 360;
    const start = cursor;
    const end = cursor + sweep;
    cursor = end;
    const color = segment.color ?? CATEGORY_COLORS[segment.label.toLowerCase()] ?? CATEGORY_COLORS.other;
    return {
      ...segment,
      color,
      d: describeArc(cx, cy, radius, start, end - 0.5),
      key: `${segment.label}-${index}`,
    };
  });

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={stroke}
        />
        {arcs.length === 1 ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={arcs[0].color}
            strokeWidth={stroke}
          />
        ) : (
          arcs.map((arc) => (
            <path
              key={arc.key}
              d={arc.d}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeLinecap="round"
            />
          ))
        )}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-display text-[1.125rem] font-bold text-ink">{totalLabel}</p>
        <p className="text-[0.6875rem] font-medium text-ink-muted">Total spent</p>
      </div>
    </div>
  );
}

export function categoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
}
