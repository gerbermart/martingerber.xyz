import { Input } from './input.js?v=menu5';
import { rectsOverlap } from './math.js';
import { Fighter } from './fighter.js';
import { AIController } from './ai.js?v=menu3';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(this.canvas);

    this.arena = {
      left: 80,
      right: canvas.width - 80,
      floorY: canvas.height - 70
    };

    // Mode / progression
    this.mode = '2p';             // '2p' | '1p'
    this.baseDifficulty = 'easy'; // easy|medium|hard for 1p
    this.level = 1;
    this.ai = null;

    // Match end state
    this.winner = null;  // 'Blue' | 'Red'
    this.endT = 0;

    // Impact polish
    this.sparks = [];
    this.shakeT = 0;
    this.shakeMag = 0;

    // Projectiles
    this.projectiles = [];

    // Special edge-trigger
    this._specHeld = { p1: false, p2: false };

    this._lastTs = null;
    this.reset();
  }

  setMode({ mode, difficulty }) {
    this.mode = mode;

    if (mode === '1p') {
      this.baseDifficulty = difficulty || 'easy';
      this.level = 1;
      this.ai = new AIController(this.baseDifficulty);
      this.ai.setDifficulty(this.baseDifficulty, this.level);
    } else {
      this.ai = null;
    }

    this.reset();
  }

  // New round, same mode/level
  reset() {
    this.p1 = new Fighter({
      name: 'Blue',
      color: '#3aa0ff',
      x: 240,
      y: this.arena.floorY - 96,
      facing: 1,
      controls: { left: 'a', right: 'd', jump: 'w', punch: 'f', kick: 'g', special: 'h' }
    });

    this.p2 = new Fighter({
      name: 'Red',
      color: '#ff4b4b',
      x: 640,
      y: this.arena.floorY - 96,
      facing: -1,
      controls: { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', punch: '/', kick: '.', special: 'l' }
    });

    this.p1.onSpecialFire = (fighter) => this._spawnHadoken(fighter, 1);
    this.p2.onSpecialFire = (fighter) => this._spawnHadoken(fighter, 2);

    this.hitLock = { p1: false, p2: false };
    this.sparks = [];
    this.shakeT = 0;
    this.shakeMag = 0;
    this.projectiles = [];
    this._specHeld = { p1: false, p2: false };

    this.winner = null;
    this.endT = 0;

    if (this.mode === '1p') {
      if (!this.ai) this.ai = new AIController(this.baseDifficulty);
      this.ai.setDifficulty(this.baseDifficulty, this.level);
    }

    // Important: reset timing so dt doesn't get weird after level transitions
    this._lastTs = null;

    this._updateHud();
  }

  _startNextLevelRound() {
    this.level += 1;
    if (this.ai) this.ai.setDifficulty(this.baseDifficulty, this.level);
    this.reset();
  }

  tick(ts) {
    if (this._lastTs == null) this._lastTs = ts;
    const dt = Math.min(0.033, (ts - this._lastTs) / 1000);
    this._lastTs = ts;

    this.input.update();

    // If match ended, run end screen timer and (in 1p) auto-advance safely
    if (this.winner) {
      this.endT += dt;

      // decay shake/sparks/projectiles a little so it still feels alive
      this._decayFX(dt);
      this._updateSparks(dt);
      this._updateProjectiles(dt, /*allowHits=*/false);

      // Auto-next in 1p only when Blue wins
      if (this.mode === '1p' && this.winner === 'Blue' && this.endT >= 1.25) {
        this._startNextLevelRound();
        return;
      }

      this._render();
      this._updateHud();
      return;
    }

    // Normal play
    this._update(dt);

    this._decayFX(dt);
    this._updateSparks(dt);
    this._updateProjectiles(dt, /*allowHits=*/true);

    this._render();
    this._updateHud();
  }

  _decayFX(dt) {
    if (this.shakeT > 0) {
      this.shakeT = Math.max(0, this.shakeT - dt);
      this.shakeMag *= 0.90;
    }
  }

  _mergedInputFor(playerNum, fighterControls) {
    return {
      isDown: (key) => {
        if (this.input.isDown(key)) return true;

        if (key === fighterControls.left)    return this.input.gpDown(playerNum, 'left');
        if (key === fighterControls.right)   return this.input.gpDown(playerNum, 'right');
        if (key === fighterControls.jump)    return this.input.gpDown(playerNum, 'jump');
        if (key === fighterControls.punch)   return this.input.gpDown(playerNum, 'punch');
        if (key === fighterControls.kick)    return this.input.gpDown(playerNum, 'kick');
        if (key === fighterControls.special) return this.input.gpDown(playerNum, 'special');
        return false;
      }
    };
  }

  _trySpecial(playerNum, fighter, inMerged) {
    const key = fighter.controls.special;
    const heldKey = (playerNum === 1) ? 'p1' : 'p2';
    const nowDown = inMerged.isDown(key);
    const wasDown = this._specHeld[heldKey];
    if (!wasDown && nowDown) fighter.startSpecial();
    this._specHeld[heldKey] = nowDown;
  }

  _spawnHadoken(fighter, ownerNum) {
    const speed = 560;
    const w = 28, h = 18;

    const x = (fighter.facing === 1)
      ? fighter.pos.x + fighter.size.w + 6
      : fighter.pos.x - w - 6;

    const y = fighter.pos.y + fighter.size.h * 0.45;

    this.projectiles.push({
      owner: ownerNum,
      x, y, w, h,
      vx: fighter.facing * speed,
      life: 1.2,
      damage: 12,
      knockX: fighter.facing * 520,
      knockY: -240
    });
  }

  _update(dt) {
    const in1 = this._mergedInputFor(1, this.p1.controls);

    let in2;
    if (this.mode === '1p' && this.ai) {
      this.ai.update(dt, this.p2, this.p1);
      in2 = this.ai.asInput(this.p2.controls);
    } else {
      in2 = this._mergedInputFor(2, this.p2.controls);
    }

    this._trySpecial(1, this.p1, in1);
    this._trySpecial(2, this.p2, in2);

    this.p1.update(dt, in1, this.arena);
    this.p2.update(dt, in2, this.arena);

    // Face each other if close-ish
    const mid1 = this.p1.pos.x + this.p1.size.w * 0.5;
    const mid2 = this.p2.pos.x + this.p2.size.w * 0.5;
    if (Math.abs(mid1 - mid2) < 280) {
      this.p1.facing = mid2 >= mid1 ? 1 : -1;
      this.p2.facing = mid1 >= mid2 ? 1 : -1;
    }

    // NEW: prevent walking through each other (simple push-apart)
    this._resolveBodyCollision();

    this._handleHits();

    if (this.p1.hp <= 0) this._endMatch('Red');
    if (this.p2.hp <= 0) this._endMatch('Blue');
  }

  _resolveBodyCollision() {
    const a = this.p1.bodyRect();
    const b = this.p2.bodyRect();
    if (!rectsOverlap(a, b)) return;

    // Overlap on X axis
    const aCenter = a.x + a.w * 0.5;
    const bCenter = b.x + b.w * 0.5;
    const dx = bCenter - aCenter;

    const overlap = (a.w * 0.5 + b.w * 0.5) - Math.abs(dx);
    if (overlap <= 0) return;

    const push = overlap * 0.5 + 0.5; // tiny bias so it separates

    if (dx >= 0) {
      this.p1.pos.x -= push;
      this.p2.pos.x += push;
    } else {
      this.p1.pos.x += push;
      this.p2.pos.x -= push;
    }

    // Clamp to arena bounds
    const minX = this.arena.left;
    const maxX = this.arena.right - this.p1.size.w;
    this.p1.pos.x = Math.max(minX, Math.min(maxX, this.p1.pos.x));
    this.p2.pos.x = Math.max(minX, Math.min(maxX, this.p2.pos.x));

    // Reduce velocity so they don't "vibrate" through each other
    this.p1.vel.x *= 0.2;
    this.p2.vel.x *= 0.2;
  }

  _endMatch(winnerName) {
    this.winner = winnerName;
    this.endT = 0;
  }

  _impactFX(x, y, strength) {
    this.shakeT = Math.max(this.shakeT, 0.12);
    this.shakeMag = Math.max(this.shakeMag, strength);

    const n = 8;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (strength * 40) + Math.random() * (strength * 40);
      this.sparks.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 80,
        life: 0.18 + Math.random() * 0.10,
        size: 3 + Math.random() * 3
      });
    }
  }

  _updateSparks(dt) {
    const gravity = 900;
    for (const s of this.sparks) {
      s.life -= dt;
      s.vy += gravity * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.94;
      s.vy *= 0.98;
    }
    this.sparks = this.sparks.filter(s => s.life > 0);
  }

  _handleHits() {
    if (!this.p1.canHitNow()) this.hitLock.p1 = false;
    if (!this.p2.canHitNow()) this.hitLock.p2 = false;

    if (this.p1.canHitNow() && !this.hitLock.p1) {
      if (rectsOverlap(this.p1.attackRect(), this.p2.bodyRect())) {
        const isKick = (this.p1.attack.kind === 'kick');
        const force = isKick ? 650 : 420;

        this.p2.takeHit({ damage: this.p1.attack.damage, knockX: this.p1.facing * force, knockY: -320, stun: 0.14 });
        this.p1.addMeter(isKick ? 18 : 12);

        const x = this.p2.pos.x + this.p2.size.w * 0.5;
        const y = this.p2.pos.y + this.p2.size.h * 0.45;
        this._impactFX(x, y, isKick ? 10 : 6);

        this.hitLock.p1 = true;
      }
    }

    if (this.p2.canHitNow() && !this.hitLock.p2) {
      if (rectsOverlap(this.p2.attackRect(), this.p1.bodyRect())) {
        const isKick = (this.p2.attack.kind === 'kick');
        const force = isKick ? 650 : 420;

        this.p1.takeHit({ damage: this.p2.attack.damage, knockX: this.p2.facing * force, knockY: -320, stun: 0.14 });
        this.p2.addMeter(isKick ? 18 : 12);

        const x = this.p1.pos.x + this.p1.size.w * 0.5;
        const y = this.p1.pos.y + this.p1.size.h * 0.45;
        this._impactFX(x, y, isKick ? 10 : 6);

        this.hitLock.p2 = true;
      }
    }
  }

  _updateProjectiles(dt, allowHits=true) {
    for (const p of this.projectiles) {
      p.life -= dt;
      p.x += p.vx * dt;
    }

    const next = [];
    for (const p of this.projectiles) {
      if (p.life <= 0) continue;

      if (allowHits) {
        const rect = { x: p.x, y: p.y, w: p.w, h: p.h };
        const target = (p.owner === 1) ? this.p2 : this.p1;

        if (rectsOverlap(rect, target.bodyRect())) {
          target.takeHit({ damage: p.damage, knockX: p.knockX, knockY: p.knockY, stun: 0.16 });
          const caster = (p.owner === 1) ? this.p1 : this.p2;
          caster.addMeter(14);

          const x = target.pos.x + target.size.w * 0.5;
          const y = target.pos.y + target.size.h * 0.45;
          this._impactFX(x, y, 9);

          continue;
        }
      }

      if (p.x < -120 || p.x > this.canvas.width + 120) continue;
      next.push(p);
    }
    this.projectiles = next;
  }

  _renderWorld(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, this.arena.floorY, w, h - this.arena.floorY);

    ctx.fillStyle = '#303030';
    ctx.fillRect(this.arena.left - 6, 0, 6, h);
    ctx.fillRect(this.arena.right, 0, 6, h);

    ctx.fillStyle = '#7cff8a';
    for (const p of this.projectiles) ctx.fillRect(p.x, p.y, p.w, p.h);

    this.p1.render(ctx);
    this.p2.render(ctx);

    ctx.fillStyle = '#ffd34d';
    for (const s of this.sparks) {
      ctx.globalAlpha = Math.max(0, Math.min(1, s.life / 0.25));
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1.0;
  }

  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let sx = 0, sy = 0;
    if (this.shakeT > 0) {
      sx = (Math.random() * 2 - 1) * this.shakeMag;
      sy = (Math.random() * 2 - 1) * this.shakeMag;
    }

    ctx.save();
    ctx.translate(sx, sy);
    this._renderWorld(ctx);
    ctx.restore();

    // Top-left info
    ctx.fillStyle = '#bbb';
    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    if (this.mode === '1p') {
      ctx.fillText(`mode: 1p  diff: ${this.baseDifficulty}  level: ${this.level}`, 12, 16);
    } else {
      ctx.fillText(`mode: 2p`, 12, 16);
    }

    // Winner screen (always)
    if (this.winner) {
      ctx.fillStyle = '#ddd';
      ctx.font = 'bold 44px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.winner} WINS!`, this.canvas.width / 2, 120);

      ctx.font = '18px system-ui';
      if (this.mode === '1p' && this.winner === 'Blue') {
        const remain = Math.max(0, 1.25 - this.endT);
        ctx.fillText(`Level up in ${remain.toFixed(1)}...`, this.canvas.width / 2, 155);
      } else if (this.mode === '1p' && this.winner === 'Red') {
        ctx.fillText(`Press R to try again (same level)`, this.canvas.width / 2, 155);
      } else {
        ctx.fillText(`Press R to restart`, this.canvas.width / 2, 155);
      }
      ctx.textAlign = 'left';
    }
  }

  _updateHud() {
    const p1hp = document.getElementById('p1hp');
    const p2hp = document.getElementById('p2hp');
    const p1hpText = document.getElementById('p1hpText');
    const p2hpText = document.getElementById('p2hpText');

    const p1m = document.getElementById('p1m');
    const p2m = document.getElementById('p2m');
    const p1mText = document.getElementById('p1mText');
    const p2mText = document.getElementById('p2mText');

    if (!p1hp || !p2hp || !p1hpText || !p2hpText) return;
    if (!p1m || !p2m || !p1mText || !p2mText) return;

    const p1pct = (this.p1.hp / this.p1.hpMax) * 100;
    const p2pct = (this.p2.hp / this.p2.hpMax) * 100;

    p1hp.style.width = `${p1pct}%`;
    p2hp.style.width = `${p2pct}%`;
    p1hpText.textContent = `${this.p1.hp}`;
    p2hpText.textContent = `${this.p2.hp}`;

    const m1pct = (this.p1.meter / this.p1.meterMax) * 100;
    const m2pct = (this.p2.meter / this.p2.meterMax) * 100;
    p1m.style.width = `${m1pct}%`;
    p2m.style.width = `${m2pct}%`;
    p1mText.textContent = `${this.p1.meter}`;
    p2mText.textContent = `${this.p2.meter}`;
  }
}
