import { SDL } from "SDL_ts";

import { Vector, clamp, vec } from './util.ts';

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
  public flip: SDL.RendererFlip = SDL.RendererFlip.NONE;
  public readonly origin = vec(48, 48);
  public readonly frame: SDL.Rect;

  constructor(public readonly texture: SDL.Texture, private readonly keys: KeyMap) {
    this.frame = new SDL.Rect(
      this.animation.start.x,
      this.animation.start.y,
      this.animation.size.x,
      this.animation.size.y
    );
  }

  get animation(): Animation {
    return Animations[this.animationState];
  }

  get pos(): Vector {
    return this.position;
  }

  update(delta: number): void {
    const delay = this.animation.delay ?? 100;

    if (delta % delay === 0) {
      this.frame.x += this.animation.size.x;

      if (this.frame.x >= this.animation.size.x * this.animation.frames) {
        if (this.animation.once) {
          this.changeAnimation(AnimationState.Idle);
          this.isAttacking = false;
        }
        this.frame.x = this.animation.start.x;
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

    if (this.runVelocity === 0 && !this.isAttacking) {
      this.changeAnimation(AnimationState.Idle);
    }
    if (this.runVelocity > 0) {
      this.runVelocity = clamp(this.runVelocity - 2.5,0,15);
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
    this.frame.x = this.animation.start.x;
    this.frame.y = this.animation.start.y;
    this.frame.w = this.animation.size.x;
    this.frame.h = this.animation.size.y;
  }
}
