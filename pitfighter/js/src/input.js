export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();

    // Touch (player 1 only)
    this.touch = { left:false, right:false, jump:false, punch:false, kick:false, special:false };

    // Gamepad mapping: 0=A, 1=B, 2=X, 3=Y, 9=Start(+)
    this.gpMap = { jump:0, punch:1, special:2, kick:3, reset:9 };

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
      if (['/', '.', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) e.preventDefault();
    }, { passive:false });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
    });

    if (this.canvas) {
      this.canvas.tabIndex = 0;
      this.canvas.addEventListener('pointerdown', () => { try { this.canvas.focus(); } catch {} });
    }

    this._bindTouchButtons();
    this._pads = [];
  }

  _bindTouchButtons() {
    const root = document.getElementById('touchControls');
    if (!root) return;

    const setAction = (action, on) => {
      if (action === 'left') this.touch.left = on;
      if (action === 'right') this.touch.right = on;
      if (action === 'up') this.touch.jump = on;
      if (action === 'punch') this.touch.punch = on;
      if (action === 'kick') this.touch.kick = on;
      if (action === 'special') this.touch.special = on;
    };

    const down = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      e.preventDefault();
      setAction(el.dataset.action, true);
      try { el.setPointerCapture(e.pointerId); } catch {}
    };

    const up = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      e.preventDefault();
      setAction(el.dataset.action, false);
    };

    root.addEventListener('pointerdown', down, { passive:false });
    root.addEventListener('pointerup', up, { passive:false });
    root.addEventListener('pointercancel', up, { passive:false });
    root.addEventListener('pointerleave', up, { passive:false });
  }

  update() {
    this._pads = navigator.getGamepads ? navigator.getGamepads() : [];
  }

  // REQUIRED by game.js: keyboard-style query
  isDown(key) {
    // Blue aliases (touch -> keys)
    if (key === 'a') return this.keys.has('a') || this.touch.left;
    if (key === 'd') return this.keys.has('d') || this.touch.right;

    // FIX: Blue jump ONLY W (+ touch up), NOT ArrowUp
    if (key === 'w') return this.keys.has('w') || this.touch.jump;

    // Touch actions for blue
    if (key === 'f') return this.keys.has('f') || this.touch.punch;
    if (key === 'g') return this.keys.has('g') || this.touch.kick;
    if (key === 'h') return this.keys.has('h') || this.touch.special;

    // Red jump stays ArrowUp only (no aliasing)
    return this.keys.has(key);
  }

  // Gamepad helper used by game.js
  _padFor(playerNum) {
    const list = [];
    for (const p of this._pads) if (p && p.connected) list.push(p);
    if (list.length === 0) return null;

    // If only one combined pad, return it for both (we'll split by side below)
    if (list.length === 1) return list[0];

    return list[Math.min(list.length - 1, Math.max(0, playerNum - 1))];
  }

  // Split a single "L+R" pad into two virtual players.
  // Player 1 gets left-stick LEFT half + B (punch) + A (jump)
  // Player 2 gets left-stick RIGHT half + Y (kick) + X (special) + A (jump)
  gpDown(playerNum, action) {
    const pad = this._padFor(playerNum);
    if (!pad) return false;

    const axis = (pad.axes && pad.axes.length) ? pad.axes[0] : 0;

    // Movement split by sign
    if (action === 'left') {
      if (playerNum === 1) return axis < -0.35;
      if (playerNum === 2) return axis > 0.05 && axis < 0.35; // nudge-left for P2
      return false;
    }
    if (action === 'right') {
      if (playerNum === 1) return axis > -0.35 && axis < -0.05; // nudge-right for P1
      if (playerNum === 2) return axis > 0.35;
      return false;
    }

    // Buttons
    const idx = this.gpMap[action];
    if (idx == null) return false;
    const b = pad.buttons && pad.buttons[idx];
    const pressed = !!(b && (b.pressed || b.value > 0.5));

    // If we have 2+ pads, don't split: each player uses their own pad normally.
    const connected = (this._pads || []).filter(p => p && p.connected);
    const multiPads = connected.length >= 2;

    if (multiPads) return pressed;

    // Single pad split rules:
    // reset (+) should work for either player
    if (action === 'reset') return pressed;

    // Jump: allow A to jump for both
    if (action === 'jump') return pressed;

    // Punch/Kick/Special split
    if (action === 'punch') return playerNum === 1 ? pressed : false;   // B
    if (action === 'kick') return playerNum === 2 ? pressed : false;    // Y
    if (action === 'special') return playerNum === 2 ? pressed : false; // X

    return false;
  }
}
