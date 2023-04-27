import { SDL } from "SDL_ts";

import { clamp, vec, Vector } from "./util.ts";
import { Level, TileFlag, tileHasFlag } from "./level.ts";

const AnimationState = {
  Idle: "Idle",
  Running: "Running",
  Slash: "Slash",
  Stab: "Stab",
} as const;

type AnimationState = (typeof AnimationState)[keyof typeof AnimationState];

interface KeyMap {
  [key: string]: boolean;
}

interface Animation {
  start: Vector;
  size: Vector;
  frames: number;
  hitbox: SDL.Rect;
  once?: boolean;
  delay?: number;
  anchor: Vector;
}

const Animations = {
  [AnimationState.Idle]: {
    start: vec(0, 0),
    size: vec(48, 48),
    frames: 10,
    hitbox: new SDL.Rect(14, 11, 17, 28),
    anchor: vec(14, 8),
  },
  [AnimationState.Running]: {
    start: vec(0, 48),
    size: vec(48, 48),
    frames: 8,
    hitbox: new SDL.Rect(12, 11, 21, 28),
    anchor: vec(14, 8),
  },
  [AnimationState.Slash]: {
    start: vec(0, 96),
    size: vec(64, 64),
    frames: 6,
    once: true,
    delay: 60,
    hitbox: new SDL.Rect(20, 18, 18, 30),
    anchor: vec(22, 0),
  },
  [AnimationState.Stab]: {
    start: vec(0, 160),
    size: vec(96, 48),
    frames: 7,
    once: true,
    hitbox: new SDL.Rect(22, 17, 17, 28),
    anchor: vec(22, 17),
  },
} as const;

const Edge = {
  Left: "Left",
  Right: "Right",
  Top: "Top",
  Bottom: "Bottom",
} as const;

type Edge = keyof typeof Edge;

function detectCollisionEdge(a: SDL.Rect, b: SDL.Rect): Edge | undefined {
  const distanceX = (a.x + a.w / 2) - (b.x + b.w / 2);
  const distanceY = (a.y + a.h / 2) - (b.y + b.h / 2);

  const halfWidth = (a.w + b.w) / 2;
  const halfHeight = (a.h + b.h) / 2;

  if (Math.abs(distanceX) < halfWidth && Math.abs(distanceY) < halfHeight) {
    const overlapX = halfWidth - Math.abs(distanceX);
    const overlapY = halfHeight - Math.abs(distanceY);

    if (overlapX >= overlapY) {
      return distanceY > 0 ? Edge.Top : Edge.Bottom;
    } else {
      return distanceX > 0 ? Edge.Left : Edge.Right;
    }
  }
}

export class Player {
  private animationState: AnimationState = AnimationState.Idle;
  private position = { ...vec(0, 0) };
  private runVelocity = 0;
  private isAttacking = false;
  private isGrounded = false;
  private isJumping = false;
  private jumpHeight = 50;
  private gravityVelocity = 2 * this.jumpHeight / (60 ^ 2);
  private jumpVelocity = Math.sqrt(2 * this.gravityVelocity * this.jumpHeight);
  public collisionRect = new SDL.Rect(0, 0, 0, 0);
  private velocity = vec(0, 0);
  private nextAnimTick = 0;
  public flip: SDL.RendererFlip = SDL.RendererFlip.NONE;
  public readonly animRect: SDL.Rect;
  public readonly worldRect: SDL.Rect;

  constructor(
    public readonly texture: SDL.Texture,
    private readonly keys: KeyMap,
    private readonly level: Level,
  ) {
    this.animRect = new SDL.Rect(
      this.animation.start.x,
      this.animation.start.y,
      this.animation.size.x,
      this.animation.size.y,
    );
    this.worldRect = new SDL.Rect(0, 0, 0, 0);
  }

  get animation(): Animation {
    return Animations[this.animationState];
  }

  calcWorldRect(): void {
    this.worldRect.x = this.position.x - this.animation.anchor.x;
    this.worldRect.y = this.position.y + this.animation.anchor.y;
    this.worldRect.w = this.animRect.w;
    this.worldRect.h = this.animRect.h;
  }

  update(tick: number): void {
    const delay = this.animation.delay ?? 100;

    if (tick >= this.nextAnimTick) {
      this.animRect.x += this.animation.size.x;

      if (this.animRect.x >= this.animation.size.x * this.animation.frames) {
        if (this.animation.once) {
          this.changeAnimation(AnimationState.Idle);
          this.isAttacking = false;
        }
        this.animRect.x = this.animation.start.x;
      }

      this.nextAnimTick = tick + delay;
    }

    if (this.keys.Return) {
      this.attack();
    } else if ((this.keys.D || this.keys.Right) && !this.isAttacking) {
      this.runVelocity = 5;
      this.flip = SDL.RendererFlip.NONE;

      this.changeAnimation(AnimationState.Running);
    } else if ((this.keys.A || this.keys.Left) && !this.isAttacking) {
      this.runVelocity = 5;
      this.flip = SDL.RendererFlip.HORIZONTAL;

      this.changeAnimation(AnimationState.Running);
    } if (this.keys.Space && !this.isAttacking && this.isGrounded && !this.isJumping) {
      this.velocity.y -= this.jumpVelocity;
      this.isJumping = true;
      this.isGrounded = false;
    }

    if (this.runVelocity === 0 && !this.isAttacking) {
      this.changeAnimation(AnimationState.Idle);
    }
    this.calcWorldRect();

    this.velocity.x = this.runVelocity *
      (this.flip === SDL.RendererFlip.HORIZONTAL ? -1 : 1)

    this.velocity.y = clamp(this.velocity.y + this.gravityVelocity, this.jumpVelocity*-1, this.gravityVelocity*2);

    this.checkCollision();

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.runVelocity > 0) {
      this.runVelocity = clamp(this.runVelocity - 2.5, 0, 15);
    }
  }

  get hitbox(): SDL.Rect {
    return new SDL.Rect(
      this.worldRect.x + this.animation.hitbox.x,
      this.worldRect.y + this.animation.hitbox.y,
      this.animation.hitbox.w,
      this.animation.hitbox.h,
    );
  }

  checkCollision(): void {
    const hitbox = this.hitbox;

    hitbox.y += this.velocity.y;
    hitbox.x += this.velocity.x;

    for (const tile of this.level.tiles) {
      if (!tile.dstrect || !tileHasFlag(tile, TileFlag.BOUNDARY)) {
        continue;
      }
      if (SDL.HasIntersection(hitbox, tile.dstrect)) {
        SDL.IntersectRect(hitbox, tile.dstrect, this.collisionRect);

        const edge = detectCollisionEdge(hitbox, tile.dstrect);

        if (edge === Edge.Top && this.velocity.y < 0 && !this.isJumping) {
          this.velocity.y = 0;
        }

        if (edge === Edge.Bottom && this.velocity.y > 0) {
          this.velocity.y = 0;
          this.isGrounded = true;
          this.isJumping = false;

          if (this.hitbox.y + this.hitbox.h > tile.dstrect.y) {
            // Sometimes the velocity causes the y position to round up to the next pixel which causes
            // the player to be stuck in the ground when falling.
            // @todo: this needs to be implemented for left and right velocities as well
            this.position.y += tile.dstrect.y - (this.hitbox.y + this.hitbox.h);
          }
        }

        if (edge === Edge.Left && this.velocity.x < 0) {
          this.velocity.x = 0;
        }

        if (edge === Edge.Right && this.velocity.x > 0) {
          this.velocity.x = 0;
        }
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
