export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.w = 32;
    this.h = 44;

    this.vx = 0;
    this.vy = 0;

    this.onGround = false;
    this.facing = 1; // 1 = right, -1 = left

    this.moveSpeed = 320;
    this.jumpVelocity = 750;
    this.gravity = 2000;
    this.maxFall = 1200;
  }

  rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(dt, input, level) {
    // Horizontal intent (do not touch vy)
    let ax = 0;
    if (input.left()) ax -= 1;
    if (input.right()) ax += 1;

    if (ax !== 0) this.facing = Math.sign(ax);

    this.vx = ax * this.moveSpeed;

    // Jump impulse (edge + grounded gate)
    if (input.jumpPressed() && this.onGround) {
      this.vy = -this.jumpVelocity;
      this.onGround = false;
    }

    // Gravity
    this.vy += this.gravity * dt;
    if (this.vy > this.maxFall) this.vy = this.maxFall;

    // Integrate + collide
    this.moveAndCollide(dt, level);

    // Clamp within level bounds
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > level.pixelWidth) this.x = level.pixelWidth - this.w;
  }

  moveAndCollide(dt, level) {
    // X axis
    this.x += this.vx * dt;
    let r = this.rect();
    if (level.rectHitsSolid(r)) {
      const dir = Math.sign(this.vx) || 1;
      while (level.rectHitsSolid(r)) {
        this.x -= dir * 1;
        r = this.rect();
      }
      this.vx = 0;
    }

    // Y axis
    this.y += this.vy * dt;
    r = this.rect();

    if (level.rectHitsSolid(r)) {
      const dir = Math.sign(this.vy) || 1;
      while (level.rectHitsSolid(r)) {
        this.y -= dir * 1;
        r = this.rect();
      }
      if (dir > 0) this.onGround = true;
      this.vy = 0;
    } else {
      this.onGround = false;
    }
  }

  draw(ctx, camX) {
    const px = this.x - camX;
    const py = this.y;

    // body
    ctx.fillStyle = '#d8d8d8';
    ctx.fillRect(px, py, this.w, this.h);

    // wizard hat
    ctx.fillStyle = '#6b3cff';
    ctx.beginPath();
    ctx.moveTo(px + this.w * 0.10, py + 8);
    ctx.lineTo(px + this.w * 0.90, py + 8);
    ctx.lineTo(px + this.w * 0.55, py - 18);
    ctx.closePath();
    ctx.fill();

    // eye (flip based on facing)
    ctx.fillStyle = '#111';
    const ex = (this.facing === 1) ? (px + this.w*0.62) : (px + this.w*0.30);
    ctx.fillRect(ex, py + this.h*0.35, 4, 4);

    // outline
    ctx.strokeStyle = '#000';
    ctx.strokeRect(px + 0.5, py + 0.5, this.w - 1, this.h - 1);
  }
}
