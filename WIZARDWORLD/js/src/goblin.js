export class Goblin {
  constructor(x, y, patrolRangePx = 220) {
    this.x = x;
    this.y = y;

    this.w = 34;
    this.h = 34;

    this.dead = false;

    // HP (5 hits)
    this.hpMax = 5;
    this.hp = this.hpMax;

    // Patrol behavior
    this.startX = x;
    this.range = patrolRangePx;
    this.dir = -1;
    this.speed = 90;

    // Hop physics
    this.vy = 0;
    this.onGround = false;
    this.gravity = 1800;
    this.jumpVelocity = 650;
    this.jumpCooldown = 0.35; // first hop delay so you can see him

    // Shooting cooldown (Game decides aim; goblin decides when it's time)
    this.shootCooldown = 0.9;
  }

  rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  center() {
    return { x: this.x + this.w * 0.5, y: this.y + this.h * 0.5 };
  }

  hit() {
    if (this.dead) return;
    this.hp -= 1;
    if (this.hp <= 0) this.dead = true;
  }

  canShoot() {
    return !this.dead && this.shootCooldown <= 0;
  }

  didShoot() {
    // reset after shooting
    this.shootCooldown = 1.05;
  }

  update(dt, level) {
    if (this.dead) return;

    // ----- Horizontal patrol
    this.x += this.dir * this.speed * dt;

    if (this.x < this.startX - this.range) {
      this.x = this.startX - this.range;
      this.dir = 1;
    } else if (this.x > this.startX + this.range) {
      this.x = this.startX + this.range;
      this.dir = -1;
    }

    // Bounce off solids horizontally
    let r = this.rect();
    if (level.rectHitsSolid(r)) {
      const step = this.dir;
      while (level.rectHitsSolid(r)) {
        this.x -= step * 1;
        r = this.rect();
      }
      this.dir *= -1;
    }

    // ----- Hop logic
    if (this.jumpCooldown > 0) this.jumpCooldown -= dt;

    // Only hop when grounded + cooldown elapsed
    if (this.onGround && this.jumpCooldown <= 0) {
      this.vy = -this.jumpVelocity;
      this.onGround = false;
      this.jumpCooldown = 0.85; // hop every ~0.85s
    }

    // Gravity
    this.vy += this.gravity * dt;
    if (this.vy > 1200) this.vy = 1200;

    // Vertical move + collide
    this.y += this.vy * dt;
    r = this.rect();
    if (level.rectHitsSolid(r)) {
      const dirY = Math.sign(this.vy) || 1;
      while (level.rectHitsSolid(r)) {
        this.y -= dirY * 1;
        r = this.rect();
      }
      if (dirY > 0) this.onGround = true;
      this.vy = 0;
    } else {
      this.onGround = false;
    }

    // ----- Shooting timer (actual spawn in Game)
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
  }

  draw(ctx, camX) {
    if (this.dead) return;

    const px = this.x - camX;
    const py = this.y;

    // body
    ctx.fillStyle = '#2c7a3a';
    ctx.fillRect(px, py, this.w, this.h);

    // eyes
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 9, py + 12, 5, 5);
    ctx.fillRect(px + 20, py + 12, 5, 5);

    // mouth
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 12, py + 24, 10, 3);

    // direction nose
    ctx.fillRect(px + (this.dir === 1 ? 28 : 1), py + 18, 5, 3);

    // HP pips above head
    const pipY = py - 10;
    for (let i = 0; i < this.hpMax; i++) {
      const pipX = px + i * 7;
      ctx.fillStyle = (i < this.hp) ? '#ff3b3b' : '#333';
      ctx.fillRect(pipX, pipY, 6, 6);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(pipX + 0.5, pipY + 0.5, 6, 6);
    }

    // outline
    ctx.strokeStyle = '#000';
    ctx.strokeRect(px + 0.5, py + 0.5, this.w - 1, this.h - 1);
  }
}
