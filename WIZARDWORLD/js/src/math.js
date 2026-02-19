export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export class Vec2 {
  constructor(x=0, y=0) { this.x = x; this.y = y; }
  copy() { return new Vec2(this.x, this.y); }
  set(x, y) { this.x = x; this.y = y; return this; }
}
