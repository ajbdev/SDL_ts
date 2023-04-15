import { SDL } from "SDL_ts";

const AnimationState = {
  Idle: "Idle",
  Running: "Running",
  Slash: "Slash",
  Stab: "Stab",
} as const;

type AnimationState = typeof AnimationState[keyof typeof AnimationState];

interface Vector {
  x: number;
  y: number;
}

const vec = (x: number, y: number): Vector => ({ x, y });

interface Animation {
  start: Vector;
  size: Vector;
  frames: number;
}

const Animations = {
  [AnimationState.Idle]: { start: vec(0, 0), size: vec(48, 48), frames: 10 },
  [AnimationState.Running]: { start: vec(0, 48), size: vec(48, 48), frames: 8 },
  [AnimationState.Slash]: { start: vec(0, 96), size: vec(64, 64), frames: 6 },
  [AnimationState.Stab]: { start: vec(0, 160), size: vec(96, 48), frames: 7 },
} as const;

export class Player {
  private animationState: AnimationState = AnimationState.Idle;
  private position = vec(0, 0);
  public readonly frame: SDL.Rect;


  constructor(public readonly texture: SDL.Texture) {
    this.frame = new SDL.Rect(
      this.animation.start.x,
      this.animation.start.y,
      this.animation.size.x,
      this.animation.size.y
    );
  }
  update(delta: number): void {
    if (delta % 100 === 0) {
      this.frame.x += this.animation.size.x;

      if (this.frame.x >= this.animation.size.x * this.animation.frames) {
        this.frame.x = this.animation.start.x;
      }
    }
  }

  get pos(): Vector {
    return this.position;
  }

  changeAnimation(state: AnimationState) {
    if (this.animationState === state) {
      return;
    }
    this.animationState = state;
    this.frame.x = this.animation.start.x;
    this.frame.y = this.animation.start.y;
    this.frame.w = this.animation.size.x;
    this.frame.h = this.animation.size.y;
  }

  get animation(): Animation {
    return Animations[this.animationState];
  }

  input(type: SDL.EventType, key: string): void {
    if (key === "D") {
      this.position.x += 10;
      this.changeAnimation(AnimationState.Running);
    }
    else if (key === "A") {
      this.changeAnimation(AnimationState.Running);
      this.position.x -= 10;
    }
    else if (key === "Space" && type === SDL.EventType.KEYDOWN) {
      const states = Object.keys(AnimationState);
      let i = states.indexOf(this.animationState) + 1;

      if (i >= states.length) {
        i = 0;
      }

      this.changeAnimation(states[i] as AnimationState);
    } else { 

      this.changeAnimation(AnimationState.Idle);
    }
  }
}
