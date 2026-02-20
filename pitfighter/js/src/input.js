export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();

    // Touch state (virtual controller)
    this.touch = { left:false, right:false, jump:false, punch:false, kick:false, special:false };

    // Gamepad mapping:
    // 0=A, 1=B, 2=X, 3=Y, 9=Start (+)
    this.gpMap = { jump: 0, punch: 1, special: 2, kick: 3, reset: 9 };

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

    // Hook touch controls (if present)
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

    const onDown = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      e.preventDefault();
      const action = el.getAttribute('data-action');
      setAction(action, true);
      try { el.setPointerCapture(e.pointerId); } catch {}
    };

    const onUp = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      e.preventDefault();
      const action = el.getAttribute('data-action');
      setAction(action, false);
    };

    root.addEventListener('pointerdown', onDown, { passive:false });
    root.addEventListener('pointerup', onUp, { passive:false });
    root.addEventListener('pointercancel', onUp, { passive:false });
    root.addEventListener('pointerleave', onUp, { passive:false });
  }

  update() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    this._pads = pads || [];
  }

  // Key query with helpful aliases:
  // - Blue jump: ArrowUp OR W
  isDown(key) {
    // Touch -> keyboard aliases for Player 1 controls
    if (key === 'a') return this.keys.has('a') || this.touch.left;
    if (key === 'd') return this.keys.has('d') || this.touch.right;

    // Jump: support both ArrowUp and W AND touch "up"
    if (key === 'w' || key === 'ArrowUp') {
      return this.keys.has('w') || this.keys.has('ArrowUp') || this.touch.jump;
    }

    // Attacks for Blue (F/G/H) can be driven by touch
    if (key === 'f') return this.keys.has('f') || this.touch.punch;
    if (key === 'g') return this.keys.has('g') || this.touch.kick;
    if (key === 'h') return this.keys.has('h') || this.touch.special;

    return this.keys.has(key);
  }

  _padFor(playerNum) {
    const list = [];
    for (const p of this._pads) if (p && p.connected) list.push(p);
    if (list.length === 0) return null;
    return list[Math.min(list.length - 1, Math.max(0, playerNum - 1))];
  }

  gpDown(playerNum, action) {
    const pad = this._padFor(playerNum);
    if (!pad) return false;

    if (action === 'left')  return pad.axes && pad.axes.length ? pad.axes[0] < -0.35 : false;
    if (action === 'right') return pad.axes && pad.axes.length ? pad.axes[0] >  0.35 : false;

    const idx = this.gpMap[action];
    if (idx == null) return false;
    const b = pad.buttons && pad.buttons[idx];
    return !!(b && (b.pressed || b.value > 0.5));
  }
}
