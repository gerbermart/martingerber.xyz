export class Fireball {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.r = 8;

    this.vx = 650 * dir;   // px/s
    this.vy = 0;

    this.life = 1.6;       // seconds
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

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Kill if hits a solid tile
    if (level.rectHitsSolid(this.rect())) {
      this.dead = true;
    }
  }

  draw(ctx, camX) {
    const px = this.x - camX;
    const py = this.y;

    ctx.beginPath();
    ctx.arc(px, py, this.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb000';
    ctx.fill();
    ctx.strokeStyle = '#ff5a00';
    ctx.stroke();
  }
}
