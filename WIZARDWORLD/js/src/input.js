export class Input {
  constructor() {
    // Keyboard (codes only; stable)
    this.down = new Set();
    this.pressed = new Set();

    // Gamepad unified state
    this.gp = { left:false, right:false };
    this.gpPressed = { jump:false, shoot:false, restart:false };

    // For edge detection
    this.prev = {
      jump:false,
      shoot:false,
      restart:false,
      upHat:false
    };

    // Debug counters
    this.gamepadsDetected = 0;
    this.debugHat = null;      // last read hat value
    this.debugHatIndex = -1;   // which axis index we used

    window.addEventListener('keydown', (e) => {
      if (!this.down.has(e.code)) this.pressed.add(e.code);
      this.down.add(e.code);

      // prevent scroll
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    }, { passive:false });

    window.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
    });
  }

  // Call after update/render has consumed edges
  beginFrame() {
    this.pressed.clear();
    this.gpPressed.jump = false;
    this.gpPressed.shoot = false;
    this.gpPressed.restart = false;
  }

  // Poll gamepads once per rendered frame (Chrome/Brave)
  update() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let pad = null;

    this.gamepadsDetected = 0;
    for (const p of pads) {
      if (p && p.connected) {
        this.gamepadsDetected++;
        if (!pad) pad = p;
      }
    }

    // defaults
    this.gp.left = false;
    this.gp.right = false;
    this.debugHat = null;
    this.debugHatIndex = -1;

    if (!pad) return;

    // -------------------------
    // LEFT/RIGHT from left stick X (common)
    // -------------------------
    const ax0 = (pad.axes && pad.axes.length > 0) ? pad.axes[0] : 0;
    const dead = 0.25;
    if (ax0 < -dead) this.gp.left = true;
    if (ax0 >  dead) this.gp.right = true;

    // -------------------------
    // DPAD / HAT axis detection (Joy-Con)
    // Many devices put hat on axes[9], but not always.
    // We'll scan a few likely indices and use threshold checks.
    // Up is usually near -1.
    // -------------------------
    const hatCandidates = [9, 7, 5, 3]; // common fallbacks
    let hatVal = null;
    let hatIdx = -1;

    for (const idx of hatCandidates) {
      if (pad.axes && idx < pad.axes.length && pad.axes[idx] !== undefined) {
        const v = pad.axes[idx];
        // If it's hat-style, it tends to be close to -1..1 with discrete steps.
        // We'll accept anything with magnitude > 0.9 as a hat "direction".
        if (Math.abs(v) > 0.9) {
          hatVal = v;
          hatIdx = idx;
          break;
        }
      }
    }

    this.debugHat = hatVal;
    this.debugHatIndex = hatIdx;

    const upHatNow = (hatVal !== null && hatVal < -0.9);

    // Edge trigger for DPAD Up -> Jump
    if (upHatNow && !this.prev.upHat) {
      this.gpPressed.jump = true;
    }
    this.prev.upHat = upHatNow;

    // -------------------------
    // Buttons
    // Joy-Cons often map jump to B (index 1) instead of A (index 0) depending on mode.
    // We'll accept either for jump.
    // -------------------------
    const b = pad.buttons || [];
    const aNow = !!(b[0] && b[0].pressed);
    const bNow = !!(b[1] && b[1].pressed);
    const shootNow = !!(b[2] && b[2].pressed) || !!(b[3] && b[3].pressed);
    const restartNow = !!(b[9] && b[9].pressed);

    const jumpNow = aNow || bNow;

    if (jumpNow && !this.prev.jump) this.gpPressed.jump = true;
    if (shootNow && !this.prev.shoot) this.gpPressed.shoot = true;
    if (restartNow && !this.prev.restart) this.gpPressed.restart = true;

    this.prev.jump = jumpNow;
    this.prev.shoot = shootNow;
    this.prev.restart = restartNow;
  }

  // -------- Unified API --------

  left() {
    return this.gp.left || this.down.has('ArrowLeft') || this.down.has('KeyA');
  }

  right() {
    return this.gp.right || this.down.has('ArrowRight') || this.down.has('KeyD');
  }

  // Jump must be edge-triggered:
  // - keyboard: Space/W/Up edge
  // - gamepad: A/B edge OR DPAD Up edge (hat axis)
  jumpPressed() {
    return (
      this.gpPressed.jump ||
      this.pressed.has('Space') ||
      this.pressed.has('ArrowUp') ||
      this.pressed.has('KeyW')
    );
  }

  shootPressed() {
    return this.gpPressed.shoot || this.pressed.has('KeyX');
  }

  restartPressed() {
    return this.gpPressed.restart || this.pressed.has('KeyR');
  }
}
