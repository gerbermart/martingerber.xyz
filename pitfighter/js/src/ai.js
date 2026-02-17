export class AIController {
  constructor(baseDifficulty='easy') {
    this.baseDifficulty = baseDifficulty;
    this.setDifficulty(baseDifficulty, 1);

    this.t = 0;
    this.nextThink = 0;

    this.hold = { left:0, right:0, jump:0, punch:0, kick:0, special:0 };
  }

  // level starts at 1
  setDifficulty(base, level=1) {
    this.baseDifficulty = base;
    this.level = Math.max(1, level);

    // Level ramp: gentle at first, grows slowly.
    // level=1 => 0.00, level=5 => ~0.18, level=10 => ~0.30
    const L = Math.min(0.40, (this.level - 1) * 0.035);

    if (base === 'easy') {
      this.reaction   = 0.22 - L * 0.10;   // slightly faster
      this.aggression = 0.35 + L * 0.45;
      this.attackRate = 0.65 + L * 0.60;
      this.kickBias   = 0.15 + L * 0.25;
      this.specialBias= 0.25 + L * 0.35;
      this.preferDist = 84 - L * 18;
    } else if (base === 'medium') {
      this.reaction   = 0.14 - L * 0.08;
      this.aggression = 0.55 + L * 0.30;
      this.attackRate = 0.85 + L * 0.55;
      this.kickBias   = 0.30 + L * 0.20;
      this.specialBias= 0.45 + L * 0.30;
      this.preferDist = 74 - L * 14;
    } else { // hard
      this.reaction   = 0.08 - L * 0.05;
      this.aggression = 0.75 + L * 0.20;
      this.attackRate = 1.05 + L * 0.50;
      this.kickBias   = 0.42 + L * 0.18;
      this.specialBias= 0.70 + L * 0.20;
      this.preferDist = 66 - L * 10;
    }

    // Clamp reaction so it never hits 0
    this.reaction = Math.max(0.03, this.reaction);
  }

  asInput(fighterControls) {
    return {
      isDown: (key) => {
        if (key === fighterControls.left)    return this.hold.left  > 0;
        if (key === fighterControls.right)   return this.hold.right > 0;
        if (key === fighterControls.jump)    return this.hold.jump  > 0;
        if (key === fighterControls.punch)   return this.hold.punch > 0;
        if (key === fighterControls.kick)    return this.hold.kick  > 0;
        if (key === fighterControls.special) return this.hold.special > 0;
        return false;
      }
    };
  }

  update(dt, selfF, oppF) {
    this.t += dt;

    // decay holds
    for (const k of Object.keys(this.hold)) {
      this.hold[k] = Math.max(0, this.hold[k] - dt);
    }

    if (this.t < this.nextThink) return;
    this.nextThink = this.t + this.reaction;

    const selfMid = selfF.pos.x + selfF.size.w * 0.5;
    const oppMid  = oppF.pos.x + oppF.size.w * 0.5;
    const dx = oppMid - selfMid;
    const adx = Math.abs(dx);

    // Movement resets
    this.hold.left = 0;
    this.hold.right = 0;

    const wantEngage = Math.random() < this.aggression;

    if (wantEngage) {
      if (adx > this.preferDist + 18) {
        if (dx > 0) this.hold.right = 0.10;
        else this.hold.left = 0.10;
      } else if (adx < this.preferDist - 14) {
        if (dx > 0) this.hold.left = 0.08;
        else this.hold.right = 0.08;
      }
    } else {
      if (adx < this.preferDist) {
        if (dx > 0) this.hold.left = 0.10;
        else this.hold.right = 0.10;
      }
    }

    // Occasional jump (scales slightly with level)
    const jumpP = (this.baseDifficulty === 'hard' ? 0.08 : this.baseDifficulty === 'medium' ? 0.05 : 0.03)
                + Math.min(0.06, (this.level - 1) * 0.005);
    if (selfF.onGround && Math.random() < jumpP) {
      this.hold.jump = 0.06;
    }

    // If meter full, sometimes special
    if (selfF.meter >= selfF.meterMax && Math.random() < this.specialBias) {
      this.hold.special = 0.08;
      return;
    }

    // Attacks when in range
    const inRange = adx < 92;
    if (inRange && Math.random() < (this.attackRate * 0.55)) {
      const useKick = Math.random() < this.kickBias;
      if (useKick) this.hold.kick = 0.10;
      else this.hold.punch = 0.10;
    }
  }
}
