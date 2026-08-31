type Point = { x: number; y: number };

function n(value: number) {
  return Number(value.toFixed(2));
}

function catmullControls(p0: Point, p1: Point, p2: Point, p3: Point) {
  return {
    cp1x: n(p1.x + (p2.x - p0.x) / 6),
    cp1y: n(p1.y + (p2.y - p0.y) / 6),
    cp2x: n(p2.x - (p3.x - p1.x) / 6),
    cp2y: n(p2.y - (p3.y - p1.y) / 6),
  };
}

/** Smooth cubic bezier path through points (Catmull-Rom style). */
export function smoothLinePath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${n(points[0].x)} ${n(points[0].y)}`;
  if (points.length === 2) {
    return `M ${n(points[0].x)} ${n(points[0].y)} L ${n(points[1].x)} ${n(points[1].y)}`;
  }

  let path = `M ${n(points[0].x)} ${n(points[0].y)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const { cp1x, cp1y, cp2x, cp2y } = catmullControls(p0, p1, p2, p3);
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${n(p2.x)} ${n(p2.y)}`;
  }

  return path;
}

export function smoothLineSegments(points: Point[]): string[] {
  if (points.length < 2) return [];
  if (points.length === 2) {
    return [`M ${n(points[0].x)} ${n(points[0].y)} L ${n(points[1].x)} ${n(points[1].y)}`];
  }

  const segments: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const { cp1x, cp1y, cp2x, cp2y } = catmullControls(p0, p1, p2, p3);
    segments.push(
      `M ${n(p1.x)} ${n(p1.y)} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${n(p2.x)} ${n(p2.y)}`,
    );
  }
  return segments;
}

export function smoothAreaPath(points: Point[], baselineY: number): string {
  if (points.length === 0) return "";
  const line = smoothLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${n(last.x)} ${n(baselineY)} L ${n(first.x)} ${n(baselineY)} Z`;
}
