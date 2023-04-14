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
  animationState: AnimationState = AnimationState.Idle;
  public readonly frame: SDL.Rect;

  constructor(private readonly texture: SDL.Texture) {
    this.frame = this.getInitialFrame(this.animationState);
  }
  update(delta: number): void {
    if (delta % 100 === 0) {
      this.frame.x += this.animation.size.x;

      if (this.frame.x >= this.animation.size.x * this.animation.frames) {
        this.frame.x = this.animation.start.x;
      }
    }
  }

  getInitialFrame(state: AnimationState) {
    return new SDL.Rect(
      this.animation.start.x,
      this.animation.start.y,
      this.animation.size.x,
      this.animation.size.y
    );
  }

  get animation(): Animation {
    return Animations[this.animationState];
  }
  input(type: SDL.EventType, key: string): void {
    if (key === "Space" && type === SDL.EventType.KEYDOWN) {
      const states = Object.keys(AnimationState);
      let i = states.indexOf(this.animationState) + 1;

      if (i >= states.length) {
        i = 0;
      }

      this.animationState = states[i] as AnimationState;
    }
  }
}
