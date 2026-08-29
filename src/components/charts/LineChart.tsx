type LineChartProps = {
  points: number[];
  labels?: string[];
  height?: number;
  stroke?: string;
};

export function LineChart({
  points,
  labels,
  height = 140,
  stroke = "#6366F1",
}: LineChartProps) {
  const width = 320;
  const padX = 8;
  const padY = 12;

  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-[16px] bg-slate-50 text-[0.8125rem] text-ink-muted"
        style={{ height }}
      >
        No spending in this period
      </div>
    );
  }

  const max = Math.max(...points, 1);
  const min = 0;
  const range = max - min || 1;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const coords = points.map((value, index) => {
    const x = padX + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
    const y = padY + innerH - ((value - min) / range) * innerH;
    return { x, y, value };
  });

  const linePath = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;
  const gradientId = "lineChartFill";

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Spending trend chart"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((pct) => {
          const y = padY + innerH * (1 - pct);
          return (
            <line
              key={pct}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#E2E8F0"
              strokeDasharray="4 4"
            />
          );
        })}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        {coords.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={stroke} />
        ))}
      </svg>
      {labels && labels.length > 0 ? (
        <div className="mt-2 flex justify-between px-1 text-[0.625rem] font-medium text-ink-muted">
          <span>{labels[0]}</span>
          {labels.length > 2 ? <span>{labels[Math.floor(labels.length / 2)]}</span> : null}
          <span>{labels[labels.length - 1]}</span>
        </div>
      ) : null}
    </div>
  );
}
