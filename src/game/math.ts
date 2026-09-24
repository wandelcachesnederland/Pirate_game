export const TAU = Math.PI * 2;

/** Shortest signed angle from `a` to `b`, in (-PI, PI]. */
export function angDiff(a: number, b: number) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  else if (d < -Math.PI) d += TAU;
  return d;
}
