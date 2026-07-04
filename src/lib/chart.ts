/*
 * SVG path helpers ported verbatim (in behaviour) from the Claude Design
 * handoff's support.js. We render charts as smoothed SVG paths rather than
 * pulling in a charting dependency — this keeps the output pixel-faithful to
 * the design and dependency-free.
 */

export interface Point {
  x: number
  y: number
}

/** Map a series of values to evenly-spaced points within a padded box. */
export function toPoints(
  values: number[],
  width: number,
  height: number,
  pad: number,
  min: number,
  max: number,
): Point[] {
  const n = values.length
  const iw = width - pad * 2
  const ih = height - pad * 2
  if (max === min) max = min + 1
  return values.map((v, i) => ({
    x: pad + iw * (n === 1 ? 0 : i / (n - 1)),
    y: pad + ih * (1 - (v - min) / (max - min)),
  }))
}

/** Catmull-Rom → cubic-bezier smoothing, matching the handoff curve feel. */
export function smooth(pts: Point[]): string {
  if (!pts.length) return ''
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d +=
      ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)}` +
      ` ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

/** Close a smoothed line down to the baseline to form a fillable area. */
export function area(pts: Point[], height: number): string {
  if (!pts.length) return ''
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${smooth(pts)} L${last.x.toFixed(1)} ${height} L${first.x.toFixed(1)} ${height} Z`
}

export interface LineGeometry {
  line: string
  area: string
  points: Point[]
  last: Point
}

/** Build line + area + endpoint geometry for one series. */
export function lineGeometry(
  values: number[],
  width: number,
  height: number,
  pad: number,
  min: number,
  max: number,
): LineGeometry {
  const points = toPoints(values, width, height, pad, min, max)
  return {
    line: smooth(points),
    area: area(points, height),
    points,
    last: points[points.length - 1],
  }
}
