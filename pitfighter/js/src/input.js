export class Input {
  constructor(canvas) {
    this.down = new Set();
    this.canvas = canvas;

    this.gp = {
      enabled: true,
      p1Index: 0,
      p2Index: 1,
      deadzone: 0.25,

      // Common mapping: buttons 0=A,1=B,2=X,3=Y
      map: {
        axisX: 0,
        jump: 0,     // A
        punch: 1,    // B
        special: 2,  // X  ✅ SPECIAL
        kick: 3      // Y
      },

      p1: { left:false, right:false, jump:false, punch:false, kick:false, special:false, id:"" },
      p2: { left:false, right:false, jump:false, punch:false, kick:false, special:false, id:"" }
    };

    canvas.setAttribute('tabindex', '0');
    canvas.addEventListener('click', () => canvas.focus());

    window.addEventListener('keydown', (e) => {
      if (this._isGameKey(e.key)) e.preventDefault();
      this.down.add(e.key);
    });
    window.addEventListener('keyup', (e) => {
      this.down.delete(e.key);
    });
  }

  update() {
    if (!this.gp.enabled) return;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    this._samplePadInto(pads[this.gp.p1Index], this.gp.p1);
    this._samplePadInto(pads[this.gp.p2Index], this.gp.p2);
  }

  isDown(key) { return this.down.has(key); }

  gpDown(playerNum, action) {
    const s = (playerNum === 1) ? this.gp.p1 : this.gp.p2;
    return !!s[action];
  }

  gpDebugLine() {
    const a = this.gp.p1.id ? `P1[${this.gp.p1Index}]: ${this.gp.p1.id}` : `P1[${this.gp.p1Index}]: (none)`;
    const b = this.gp.p2.id ? `P2[${this.gp.p2Index}]: ${this.gp.p2.id}` : `P2[${this.gp.p2Index}]: (none)`;
    return `${a}   |   ${b}`;
  }

  _samplePadInto(pad, out) {
    out.left = out.right = out.jump = out.punch = out.kick = out.special = false;
    out.id = "";
    if (!pad) return;
    out.id = pad.id || "(unknown)";

    const ax = (pad.axes && pad.axes.length > this.gp.map.axisX) ? pad.axes[this.gp.map.axisX] : 0;
    if (ax < -this.gp.deadzone) out.left = true;
    if (ax >  this.gp.deadzone) out.right = true;

    out.jump    = this._btn(pad, this.gp.map.jump);
    out.punch   = this._btn(pad, this.gp.map.punch);
    out.kick    = this._btn(pad, this.gp.map.kick);
    out.special = this._btn(pad, this.gp.map.special);
  }

  _btn(pad, idx) {
    if (!pad || !pad.buttons || pad.buttons.length <= idx) return false;
    const b = pad.buttons[idx];
    return (typeof b === 'number') ? b > 0.5 : !!b.pressed;
  }

  _isGameKey(key) {
    return [
      'a','d','w','f','g','h',
      'ArrowLeft','ArrowRight','ArrowUp','/','.', 'l',
      'r'
    ].includes(key.toLowerCase ? key.toLowerCase() : key);
  }
}
