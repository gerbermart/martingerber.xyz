import { clamp } from './math.js';

export class Level {
  constructor() {
    this.tile = 48;

    this.w = 80;
    this.h = 12;

    this.tiles = [];
    for (let y = 0; y < this.h; y++) {
      this.tiles.push(new Array(this.w).fill(0));
    }

    const floorY = this.h - 2;
    for (let x = 0; x < this.w; x++) this.tiles[floorY][x] = 1;

    // staircase
    for (let i = 0; i < 6; i++) {
      const stepX = 18 + i;
      const stepH = i + 1;
      for (let j = 0; j < stepH; j++) {
        this.tiles[floorY - j][stepX] = 1;
      }
    }

    // simple platforms
    this.tiles[floorY - 3][30] = 1;
    this.tiles[floorY - 3][31] = 1;
    this.tiles[floorY - 5][38] = 1;
    this.tiles[floorY - 5][39] = 1;
    this.tiles[floorY - 5][40] = 1;

    // goal tile
    this.goalTile = { x: this.w - 4, y: floorY - 1 };
    this.tiles[this.goalTile.y][this.goalTile.x] = 2;

    this.pixelWidth = this.w * this.tile;
    this.pixelHeight = this.h * this.tile;

    // Wand spawn (pixel position)
    // Put it on the ground a bit after the staircase
    const wandTileX = 24;
    const wandTileY = floorY - 1; // one tile above the floor tile row
    this.wandSpawn = {
      x: wandTileX * this.tile + this.tile * 0.25,
      y: wandTileY * this.tile + this.tile * 0.65
    };
  }

  isSolidAtTile(tx, ty) {
    if (ty < 0 || ty >= this.h) return false;
    if (tx < 0 || tx >= this.w) return false;
    return this.tiles[ty][tx] === 1;
  }

  isGoalAtTile(tx, ty) {
    if (ty < 0 || ty >= this.h) return false;
    if (tx < 0 || tx >= this.w) return false;
    return this.tiles[ty][tx] === 2;
  }

  rectHitsSolid(rect) {
    const t = this.tile;
    const left = Math.floor(rect.x / t);
    const right = Math.floor((rect.x + rect.w - 1) / t);
    const top = Math.floor(rect.y / t);
    const bottom = Math.floor((rect.y + rect.h - 1) / t);

    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        if (this.isSolidAtTile(tx, ty)) return true;
      }
    }
    return false;
  }

  rectTouchesGoal(rect) {
    const t = this.tile;
    const left = Math.floor(rect.x / t);
    const right = Math.floor((rect.x + rect.w - 1) / t);
    const top = Math.floor(rect.y / t);
    const bottom = Math.floor((rect.y + rect.h - 1) / t);

    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        if (this.isGoalAtTile(tx, ty)) return true;
      }
    }
    return false;
  }

  clampCameraX(camX, viewW) {
    return clamp(camX, 0, Math.max(0, this.pixelWidth - viewW));
  }

  draw(ctx, camX, viewW, viewH) {
    const t = this.tile;

    // background
    ctx.fillStyle = '#101018';
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.fillStyle = '#141427';
    ctx.fillRect(0, viewH * 0.55, viewW, viewH * 0.45);

    const startX = Math.floor(camX / t);
    const endX = Math.min(this.w - 1, Math.floor((camX + viewW) / t) + 1);

    for (let y = 0; y < this.h; y++) {
      for (let x = startX; x <= endX; x++) {
        const v = this.tiles[y][x];
        if (v === 0) continue;

        const px = x * t - camX;
        const py = y * t;

        if (v === 1) {
          ctx.fillStyle = '#2a2a2a';
          ctx.fillRect(px, py, t, t);
          ctx.strokeStyle = '#444';
          ctx.strokeRect(px + 0.5, py + 0.5, t - 1, t - 1);
          ctx.fillStyle = '#333';
          ctx.fillRect(px + 6, py + 6, t - 12, t - 12);
        } else if (v === 2) {
          ctx.fillStyle = '#2a1a3a';
          ctx.fillRect(px, py, t, t);
          ctx.strokeStyle = '#a060ff';
          ctx.lineWidth = 3;
          ctx.strokeRect(px + 1.5, py + 1.5, t - 3, t - 3);
          ctx.lineWidth = 1;
          ctx.fillStyle = '#a060ff';
          ctx.fillRect(px + t*0.35, py + t*0.35, t*0.30, t*0.30);
        }
      }
    }
  }
}
