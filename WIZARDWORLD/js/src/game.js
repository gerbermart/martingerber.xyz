import { Input } from './input.js';
import { Level } from './level.js';
import { Player } from './player.js';
import { Wand } from './wand.js';
import { Fireball } from './fireball.js';
import { Goblin } from './goblin.js';
import { Puff } from './puff.js';
import { Slimeball } from './slimeball.js';

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export class Game {
  constructor({ canvas, ctx }) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.input = new Input();
    this.lastError = '';
    this.reset();
  }

  reset() {
    this.level = new Level();

    const spawnX = 3 * this.level.tile;
    const spawnY = (this.level.h - 3) * this.level.tile - 44;
    this.player = new Player(spawnX, spawnY);

    this.wand = new Wand(this.level.wandSpawn.x, this.level.wandSpawn.y);
    this.hasWand = false;

    this.fireballs = [];
    this.slimeballs = [];
    this.shootCooldown = 0;

    // Hearts / damage system
    this.maxHearts = 5;
    this.hearts = this.maxHearts;
    this.hurtInvTimer = 0;
    this.tick = 0;

    // Enemy: one goblin on the ground
    const floorY = this.level.h - 2;
    const gobTileX = 36;
    const gobX = gobTileX * this.level.tile + (this.level.tile - 34) * 0.5;
    const gobY = (floorY - 1) * this.level.tile + (this.level.tile - 34);
    this.goblins = [new Goblin(gobX, gobY, 240)];

    this.puffs = [];

    this.cameraX = 0;
    this.complete = false;

    this.fixedDt = 1 / 60;
    this.accum = 0;
    this.lastT = null;

    this.lastError = '';
    this.input.beginFrame();
  }

  start() {
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(t) {
    try {
      if (this.lastT === null) this.lastT = t;
      const frameDt = Math.min(0.05, (t - this.lastT) / 1000);
      this.lastT = t;

      // Gamepad polling if present
      if (typeof this.input.update === 'function') this.input.update();

      if (this.input.restartPressed()) {
        this.reset();
      }

      this.accum += frameDt;
      while (this.accum >= this.fixedDt) {
        this.update(this.fixedDt);
        this.accum -= this.fixedDt;
      }

      this.render();
      this.input.beginFrame();

      requestAnimationFrame((tt) => this.loop(tt));
    } catch (e) {
      this.lastError = String(e && e.message ? e.message : e);
      this.render();
      requestAnimationFrame((tt) => this.loop(tt));
    }
  }

  update(dt) {
    if (this.complete) return;

    this.tick++;

    if (this.hurtInvTimer > 0) {
      this.hurtInvTimer -= dt;
      if (this.hurtInvTimer < 0) this.hurtInvTimer = 0;
    }

    this.player.update(dt, this.input, this.level);

    // update goblins
    for (const g of this.goblins) {
      if (g && typeof g.update === 'function') g.update(dt, this.level);
    }

    // camera follow
    const viewW = this.canvas.width;
    const target = (this.player.x + this.player.w * 0.5) - viewW * 0.5;
    this.cameraX = this.level.clampCameraX(target, viewW);

    // pickup wand
    if (!this.hasWand && !this.wand.collected) {
      if (rectsOverlap(this.player.rect(), this.wand.rect())) {
        this.wand.collected = true;
        this.hasWand = true;
      }
    }

    // player shooting
    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    if (this.hasWand && this.input.shootPressed() && this.shootCooldown <= 0) {
      const dir = this.player.facing;
      const sx = this.player.x + (dir === 1 ? this.player.w + 6 : -6);
      const sy = this.player.y + this.player.h * 0.55;
      this.fireballs.push(new Fireball(sx, sy, dir));
      this.shootCooldown = 0.18;
    }

    // update fireballs
    for (const fb of this.fireballs) fb.update(dt, this.level);

    // goblin shooting slimeballs toward player
    for (const g of this.goblins) {
      if (!g || g.dead) continue;
      if (typeof g.canShoot !== 'function' || typeof g.didShoot !== 'function') continue;
      if (!g.canShoot()) continue;

      const gc = g.center ? g.center() : { x: g.x + g.w*0.5, y: g.y + g.h*0.5 };
      const pcx = this.player.x + this.player.w * 0.5;
      const dir = (pcx >= gc.x) ? 1 : -1;

      const sx = gc.x + dir * (g.w * 0.6);
      const sy = gc.y - 6;
      this.slimeballs.push(new Slimeball(sx, sy, dir));
      g.didShoot();
    }

    // update slimeballs
    for (const sb of this.slimeballs) sb.update(dt, this.level);
    this.slimeballs = this.slimeballs.filter(sb => !sb.dead);

    // fireball vs goblin (5 hits)
    for (const fb of this.fireballs) {
      if (fb.dead) continue;
      const fr = fb.rect();

      for (const g of this.goblins) {
        if (!g || g.dead) continue;

        if (rectsOverlap(fr, g.rect())) {
          fb.dead = true;

          if (typeof g.hit === 'function') g.hit();
          else {
            if (typeof g.hp !== 'number') g.hp = 5;
            g.hp -= 1;
            if (g.hp <= 0) g.dead = true;
          }

          const cx = g.x + g.w * 0.5;
          const cy = g.y + g.h * 0.5;
          this.puffs.push(new Puff(cx, cy));

          if (g.dead) {
            this.puffs.push(new Puff(cx + 10, cy - 10));
            this.puffs.push(new Puff(cx - 10, cy + 5));
          }
        }
      }
    }
    this.fireballs = this.fireballs.filter(fb => !fb.dead);

    // slimeball hits player (invincibility gated)
    if (this.hurtInvTimer <= 0) {
      const pr = this.player.rect();

      for (const sb of this.slimeballs) {
        if (sb.dead) continue;
        if (rectsOverlap(pr, sb.rect())) {
          sb.dead = true;

          this.hearts -= 1;
          this.hurtInvTimer = 1.0;

          const fromLeft = (this.player.x + this.player.w * 0.5) < sb.x;
          this.player.vx = fromLeft ? -320 : 320;
          this.player.vy = -380;
          this.player.onGround = false;

          const cx = this.player.x + this.player.w * 0.5;
          const cy = this.player.y + this.player.h * 0.5;
          this.puffs.push(new Puff(cx, cy));
          break;
        }
      }
    }

    // goblin contact hurts player (invincibility gated)
    if (this.hurtInvTimer <= 0) {
      const pr = this.player.rect();
      for (const g of this.goblins) {
        if (!g || g.dead) continue;
        if (rectsOverlap(pr, g.rect())) {
          this.hearts -= 1;
          this.hurtInvTimer = 1.0;

          const fromLeft = (this.player.x + this.player.w * 0.5) < (g.x + g.w * 0.5);
          this.player.vx = fromLeft ? -320 : 320;
          this.player.vy = -420;
          this.player.onGround = false;

          const cx = this.player.x + this.player.w * 0.5;
          const cy = this.player.y + this.player.h * 0.5;
          this.puffs.push(new Puff(cx, cy));
          break;
        }
      }
    }

    // puffs
    for (const p of this.puffs) p.update(dt);
    this.puffs = this.puffs.filter(p => !p.dead);

    if (this.hearts <= 0) {
      this.reset();
      return;
    }

    if (this.level.rectTouchesGoal(this.player.rect())) {
      this.complete = true;
    }

    if (this.player.y > this.level.pixelHeight + 300) {
      this.reset();
    }
  }

  drawHearts(ctx) {
    const x0 = 12;
    const y0 = 76;
    const size = 14;
    const gap = 6;

    for (let i = 0; i < this.maxHearts; i++) {
      const x = x0 + i * (size + gap);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(x + 0.5, y0 + 0.5, size, size);

      if (i < this.hearts) {
        ctx.fillStyle = '#ff3b3b';
        ctx.fillRect(x + 1, y0 + 1, size - 2, size - 2);
      } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 1, y0 + 1, size - 2, size - 2);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    this.level.draw(ctx, this.cameraX, w, h);

    this.wand.draw(ctx, this.cameraX);

    for (const g of this.goblins) if (g && !g.dead) g.draw(ctx, this.cameraX);
    for (const p of this.puffs) p.draw(ctx, this.cameraX);
    for (const fb of this.fireballs) fb.draw(ctx, this.cameraX);
    for (const sb of this.slimeballs) sb.draw(ctx, this.cameraX);

    const blink = (this.hurtInvTimer > 0) && ((this.tick % 8) < 4);
    if (!blink) this.player.draw(ctx, this.cameraX);

    // HUD
    ctx.fillStyle = '#eaeaea';
    ctx.font = '16px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillText('Wizard World v0', 12, 22);

    ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillText(`Wand: ${this.hasWand ? 'FIRE (press X)' : 'none (pick up wand)'}`, 12, 44);

    const g0 = this.goblins[0];
    if (g0 && !g0.dead) ctx.fillText(`Goblin HP: ${g0.hp}/${g0.hpMax}`, 12, 64);
    else ctx.fillText(`Goblin: defeated!`, 12, 64);

    ctx.fillText(`Slime: ${this.slimeballs.length}`, 12, 84);

    this.drawHearts(ctx);

    if (this.lastError) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, h - 40, w, 40);
      ctx.fillStyle = '#ff9090';
      ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillText(`ERROR: ${this.lastError}`, 12, h - 16);
    }

    if (this.complete) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#fff';
      ctx.font = '48px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LEVEL COMPLETE', w/2, h/2 - 10);

      ctx.font = '18px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillText('Press R to restart', w/2, h/2 + 30);
      ctx.textAlign = 'start';
    }
  }
}
