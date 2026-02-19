export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();

    // Map actions to typical gamepad indices
    // 0=A, 1=B, 2=X, 3=Y, 9=Start (+ on right Joy-Con)
    this.gpMap = {
      jump: 0,
      punch: 1,   // B
      special: 2, // X
      kick: 3,    // Y
      reset: 9    // +
    };

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
      // prevent quick-find / page stuff for game keys
      if (['/', '.', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) e.preventDefault();
    }, { passive:false });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
    });

    // Make canvas focusable for mobile taps
    if (this.canvas) {
      this.canvas.tabIndex = 0;
      this.canvas.addEventListener('pointerdown', () => {
        try { this.canvas.focus(); } catch {}
      });
    }

    this._pads = [];
  }

  update() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    this._pads = pads || [];
  }

  isDown(key) {
    return this.keys.has(key);
  }

  // playerNum is 1 or 2; currently we just pick first/second pad if present.
  // (Your JoyCons currently appear as one combined pad, so player 1 works.)
  _padFor(playerNum) {
    const list = [];
    for (const p of this._pads) if (p && p.connected) list.push(p);
    if (list.length === 0) return null;
    return list[Math.min(list.length - 1, Math.max(0, playerNum - 1))];
  }

  gpDown(playerNum, action) {
    const pad = this._padFor(playerNum);
    if (!pad) return false;

    // axes: left stick X is axes[0]
    if (action === 'left')  return pad.axes && pad.axes.length ? pad.axes[0] < -0.35 : false;
    if (action === 'right') return pad.axes && pad.axes.length ? pad.axes[0] >  0.35 : false;

    const idx = this.gpMap[action];
    if (idx == null) return false;
    const b = pad.buttons && pad.buttons[idx];
    return !!(b && (b.pressed || b.value > 0.5));
  }
}
