import { SDL } from "SDL_ts";

import { Vector, clamp, vec } from './util.ts';
import { TileFlag, Level, tileHasFlag } from "./level.ts";

const AnimationState = {
  Idle: "Idle",
  Running: "Running",
  Slash: "Slash",
  Stab: "Stab",
} as const;

type AnimationState = typeof AnimationState[keyof typeof AnimationState];

interface KeyMap {
  [key: string]: boolean
}

interface Animation {
  start: Vector;
  size: Vector;
  frames: number;
  once?: boolean;
  delay?: number;
}

const Animations = {
  [AnimationState.Idle]: { start: vec(0, 0), size: vec(48, 48), frames: 10 },
  [AnimationState.Running]: { start: vec(0, 48), size: vec(48, 48), frames: 8 },
  [AnimationState.Slash]: {
    start: vec(0, 96),
    size: vec(64, 64),
    frames: 6,
    once: true,
    delay: 60
  },
  [AnimationState.Stab]: {
    start: vec(0, 160),
    size: vec(96, 48),
    frames: 7,
    once: true,
  },
} as const;

export class Player {
  private animationState: AnimationState = AnimationState.Idle;
  private position = vec(0, 0);
  private runVelocity = 0;
  private isAttacking = false;
  private gravityVelocity = 0.5;
  public flip: SDL.RendererFlip = SDL.RendererFlip.NONE;
  public readonly origin = vec(48, 48);
  public readonly animRect: SDL.Rect;
  public readonly worldRect: SDL.Rect;

  constructor(public readonly texture: SDL.Texture, private readonly keys: KeyMap, private readonly level: Level) {
    this.animRect = new SDL.Rect(
      this.animation.start.x,
      this.animation.start.y,
      this.animation.size.x,
      this.animation.size.y
    );

    this.worldRect = new SDL.Rect(0, 0, 0, 0);
  }

  get animation(): Animation {
    return Animations[this.animationState];
  }

  calcWorldRect(): void {
    const offsetX = (this.origin.x - this.animRect.w) / 2;
    const offsetY = (this.origin.y - this.animRect.h) / 2;

    const snapToGrid = 6;

    this.worldRect.x = this.position.x + offsetX + snapToGrid;
    this.worldRect.y = this.position.y + offsetY + snapToGrid;
    this.worldRect.w = this.animRect.w;
    this.worldRect.h = this.animRect.h;
  }

  update(tick: number): void {
    const delay = this.animation.delay ?? 100;

    if (tick % delay === 0) {
      this.animRect.x += this.animation.size.x;

      if (this.animRect.x >= this.animation.size.x * this.animation.frames) {
        if (this.animation.once) {
          this.changeAnimation(AnimationState.Idle);
          this.isAttacking = false;
        }
        this.animRect.x = this.animation.start.x;
      }
    }

    if (this.keys.Space) {
      this.attack();
    } else if ((this.keys.D || this.keys.Right) && !this.isAttacking) {
      this.runVelocity = 5;
      this.flip = SDL.RendererFlip.NONE;

      this.changeAnimation(AnimationState.Running);
    } else if ((this.keys.A || this.keys.Left) && !this.isAttacking) {
      this.runVelocity = 5;
      this.flip = SDL.RendererFlip.HORIZONTAL;

      this.changeAnimation(AnimationState.Running);
    } 

    this.position.x += this.runVelocity * (this.flip === SDL.RendererFlip.HORIZONTAL ? -1 : 1) * .1;

    this.position.y += this.gravityVelocity;

    this.checkCollisionAndBounce();

    this.calcWorldRect();

    if (this.runVelocity === 0 && !this.isAttacking) {
      this.changeAnimation(AnimationState.Idle);
    }
    if (this.runVelocity > 0) {
      this.runVelocity = clamp(this.runVelocity - 2.5, 0, 15);
    }
  }

  checkCollisionAndBounce(): void {
    for (const tile of this.level.tiles) {
      if (!tile.dstrect || !tileHasFlag(tile, TileFlag.BOUNDARY)) {
        continue;
      }
      if (SDL.HasIntersection(this.worldRect, tile.dstrect)) {
        if (this.worldRect.y + this.worldRect.h > tile.dstrect.y) {
          this.position.y = tile.dstrect.y - this.worldRect.h;
        }

        if (this.worldRect.x + this.worldRect.w > tile.dstrect.x) {

        }

        return;
      }
    }
  }

  attack(): void {
      this.changeAnimation(AnimationState.Slash);
      this.runVelocity = 0;
      this.isAttacking = true;
  }

  changeAnimation(state: AnimationState): void {
    if (this.animationState === state) {
      return;
    }
    this.animationState = state;
    this.animRect.x = this.animation.start.x;
    this.animRect.y = this.animation.start.y;
    this.animRect.w = this.animation.size.x;
    this.animRect.h = this.animation.size.y;
  }
}
