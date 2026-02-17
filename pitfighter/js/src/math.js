export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}
