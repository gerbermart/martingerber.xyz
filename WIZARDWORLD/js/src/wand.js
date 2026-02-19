export class Wand {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 22;
    this.h = 10;
    this.collected = false;
  }

  rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  draw(ctx, camX) {
    if (this.collected) return;

    const px = this.x - camX;
    const py = this.y;

    // wood handle
    ctx.fillStyle = '#7a4a2a';
    ctx.fillRect(px, py, this.w, this.h);

    // glowing tip
    ctx.fillStyle = '#ff5a00';
    ctx.fillRect(px + this.w - 6, py - 4, 10, this.h + 8);

    ctx.strokeStyle = '#000';
    ctx.strokeRect(px + 0.5, py + 0.5, this.w - 1, this.h - 1);
  }
}
