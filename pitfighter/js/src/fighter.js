import { clamp } from './math.js';

export class Fighter {
  constructor({ name, color, x, y, facing=1, controls }) {
    this.name = name;
    this.color = color;

    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.size = { w: 48, h: 96 };

    this.facing = facing;
    this.onGround = false;

    this.hpMax = 100;
    this.hp = 100;

    // Meter
    this.meterMax = 100;
    this.meter = 0;

    this.controls = controls;

    // Hitstun so knockback doesn't get overwritten by input
    this.hitstun = 0;

    // Tiny state machine
    this.state = 'idle';     // 'idle' | 'special'
    this.stateT = 0;
    this.specialFired = false;

    // Hook set by Game
    this.onSpecialFire = null;

    // Attack state
    this.attack = {
      active: false,
      kind: null,
      t: 0,
      windup: 0.06,
      activeFor: 0.10,
      cooldown: 0.22,
      damage: 0,
      range: 0,
      height: 0
    };
  }

  bodyRect() {
    return { x: this.pos.x, y: this.pos.y, w: this.size.w, h: this.size.h };
  }

  attackRect() {
    const range = this.attack.range;
    const h = this.attack.height;
    const w = range;
    const x = (this.facing === 1) ? this.pos.x + this.size.w : this.pos.x - w;
    const y = this.pos.y + (this.size.h - h) * 0.45;
    return { x, y, w, h };
  }

  startAttack(kind) {
    if (this.attack.active) return;
    if (this.state !== 'idle') return;
    this.attack.active = true;
    this.attack.kind = kind;
    this.attack.t = 0;

    if (kind === 'punch') {
      this.attack.windup = 0.05;
      this.attack.activeFor = 0.10;
      this.attack.cooldown = 0.18;
      this.attack.damage = 6;
      this.attack.range = 34;
      this.attack.height = 26;
    } else {
      this.attack.windup = 0.08;
      this.attack.activeFor = 0.12;
      this.attack.cooldown = 0.25;
      this.attack.damage = 10;
      this.attack.range = 46;
      this.attack.height = 30;
    }
  }

  canHitNow() {
    if (!this.attack.active) return false;
    const t = this.attack.t;
    return t >= this.attack.windup && t <= (this.attack.windup + this.attack.activeFor);
  }

  addMeter(amount) {
    this.meter = clamp(this.meter + amount, 0, this.meterMax);
  }

  spendMeter(amount) {
    this.meter = clamp(this.meter - amount, 0, this.meterMax);
  }

  startSpecial() {
    if (this.state !== 'idle') return false;
    if (this.hitstun > 0) return false;
    if (this.meter < this.meterMax) return false;

    // Consume full meter
    this.spendMeter(this.meterMax);

    // Enter special state (brief cast)
    this.state = 'special';
    this.stateT = 0;
    this.specialFired = false;

    return true;
  }

  takeDamage(dmg) {
    this.hp = clamp(this.hp - dmg, 0, this.hpMax);
  }

  takeHit({ damage, knockX, knockY, stun }) {
    this.takeDamage(damage);
    this.hitstun = Math.max(this.hitstun, stun);

    this.vel.x = knockX;
    this.vel.y = Math.min(this.vel.y, knockY);

    // Being hit cancels special cast
    if (this.state === 'special') {
      this.state = 'idle';
      this.stateT = 0;
      this.specialFired = false;
    }
  }

  update(dt, input, arena) {
    const speed = 320;
    const jumpV = -760;
    const gravity = 2100;

    // Count down hitstun
    if (this.hitstun > 0) this.hitstun = Math.max(0, this.hitstun - dt);

    // Special state progression
    if (this.state === 'special') {
      this.stateT += dt;

      // Fire projectile partway through cast
      if (!this.specialFired && this.stateT >= 0.10) {
        this.specialFired = true;
        if (typeof this.onSpecialFire === 'function') {
          this.onSpecialFire(this);
        }
      }

      // End cast
      if (this.stateT >= 0.22) {
        this.state = 'idle';
        this.stateT = 0;
        this.specialFired = false;
      }
    }

    // Horizontal control disabled during hitstun OR special cast
    const controlsLocked = (this.hitstun > 0) || (this.state === 'special');

    if (!controlsLocked) {
      let move = 0;
      if (input.isDown(this.controls.left)) move -= 1;
      if (input.isDown(this.controls.right)) move += 1;
      this.vel.x = move * speed;

      if (move !== 0) this.facing = move > 0 ? 1 : -1;

      if (this.onGround && input.isDown(this.controls.jump)) {
        this.vel.y = jumpV;
        this.onGround = false;
      }

      if (!this._punchHeld && input.isDown(this.controls.punch)) this.startAttack('punch');
      if (!this._kickHeld && input.isDown(this.controls.kick)) this.startAttack('kick');

      this._punchHeld = input.isDown(this.controls.punch);
      this._kickHeld = input.isDown(this.controls.kick);
    } else {
      // friction during lock
      this.vel.x *= 0.92;
      this._punchHeld = input.isDown(this.controls.punch);
      this._kickHeld = input.isDown(this.controls.kick);
    }

    // Attack timer
    if (this.attack.active) {
      this.attack.t += dt;
      const total = this.attack.windup + this.attack.activeFor + this.attack.cooldown;
      if (this.attack.t >= total) {
        this.attack.active = false;
        this.attack.kind = null;
      }
    }

    // Gravity + integrate
    this.vel.y += gravity * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    // Floor collide
    const floorY = arena.floorY - this.size.h;
    if (this.pos.y >= floorY) {
      this.pos.y = floorY;
      this.vel.y = 0;
      this.onGround = true;
    }

    // Walls + wall bounce (only during hitstun)
    const minX = arena.left;
    const maxX = arena.right - this.size.w;

    const beforeX = this.pos.x;
    this.pos.x = clamp(this.pos.x, minX, maxX);

    const hitWall = (this.pos.x !== beforeX);
    if (hitWall && this.hitstun > 0.01) {
      this.vel.x = -this.vel.x * 0.35;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x, this.pos.y, this.size.w, this.size.h);
    ctx.fillRect(this.pos.x + 10, this.pos.y - 18, this.size.w - 20, 18);

    // Attack hitbox
    if (this.canHitNow()) {
      const a = this.attackRect();
      ctx.globalAlpha = 0.35;
      ctx.fillRect(a.x, a.y, a.w, a.h);
      ctx.globalAlpha = 1.0;
    }

    // Special "glow" while casting
    if (this.state === 'special') {
      ctx.globalAlpha = 0.35;
      ctx.fillRect(this.pos.x - 6, this.pos.y - 6, this.size.w + 12, this.size.h + 12);
      ctx.globalAlpha = 1.0;
    }
  }
}
