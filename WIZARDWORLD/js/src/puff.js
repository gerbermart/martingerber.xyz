export class Puff {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 0.35; // seconds
    this.dead = false;

    // Deterministic mini "smoke" particles
    this.particles = [];
    const angles = [0, 1.0, 2.2, 3.1, 4.0, 5.2];
    for (let i = 0; i < angles.length; i++) {
      const a = angles[i];
      const sp = 60 + i * 15;
      this.particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        r: 6 + (i % 3) * 2,
      });
    }
  }

  update(dt) {
    if (this.dead) return;

    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
      return;
    }

    // simple drift + fade
    for (const p of this.particles) {
      p.vy += 120 * dt; // slight downward pull
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r *= (1 - 1.6 * dt); // shrink
      if (p.r < 0.5) p.r = 0.5;
    }
  }

  draw(ctx, camX) {
    const alpha = Math.max(0, Math.min(1, this.life / 0.35));
    ctx.save();
    ctx.globalAlpha = alpha;

    for (const p of this.particles) {
      const px = this.x + p.x - camX;
      const py = this.y + p.y;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#bdbdbd';
      ctx.fill();
    }

    ctx.restore();
  }
}
