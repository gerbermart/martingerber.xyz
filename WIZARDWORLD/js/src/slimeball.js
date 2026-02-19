export class Slimeball {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.r = 8;

    this.vx = 320 * dir;  // px/s
    this.vy = -140;       // initial arc up
    this.gravity = 900;   // px/s^2

    this.life = 2.2;      // seconds
    this.dead = false;
  }

  rect() {
    return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 };
  }

  update(dt, level) {
    if (this.dead) return;

    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
      return;
    }

    this.vy += this.gravity * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (level.rectHitsSolid(this.rect())) {
      this.dead = true; // splat
    }
  }

  draw(ctx, camX) {
    const px = this.x - camX;
    const py = this.y;

    ctx.beginPath();
    ctx.arc(px, py, this.r, 0, Math.PI * 2);
    ctx.fillStyle = '#45d26f';
    ctx.fill();
    ctx.strokeStyle = '#0a5a22';
    ctx.stroke();
  }
}
