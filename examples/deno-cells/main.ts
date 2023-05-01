import { Box, BoxArray, IMG, Int, int, Pointer, SDL, SDLError } from "SDL_ts";
import { path } from "../../deps.ts";
import { ASSETS_PATH } from "../../shared/constants.ts";
import { Player } from "./player.ts";
import { Level } from "./level.ts";

const WINDOW_WIDTH = 1024;
const WINDOW_HEIGHT = 768;

const FPS = 60;
const SKIP_TICKS = 1000 / FPS;

interface KeyMap {
  [key: string]: boolean;
}

async function main(): Promise<number> {
  SDL.Init(SDL.InitFlags.VIDEO);
  IMG.Init(IMG.InitFlags.PNG);

  const windowBox = new Box<Pointer<SDL.Window>>(Pointer);
  const rendererBox = new Box<Pointer<SDL.Renderer>>(Pointer);

  // Just the keys we care about
  const keys: KeyMap = [
    "W",
    "A",
    "S",
    "D",
    "T",
    "C",
    "Space",
    "Left",
    "Right",
    "Return",
  ].reduce((acc, key) => ({ ...acc, [key]: false }), {});

  SDL.CreateWindowAndRenderer(
    WINDOW_WIDTH,
    WINDOW_HEIGHT,
    SDL.WindowFlags.SHOWN,
    windowBox,
    rendererBox
  );

  const window = windowBox.unboxNotNull(
    () => `Failed to create window: ${SDL.GetError()}`
  );
  const renderer = rendererBox.unboxNotNull(
    () => `Failed to create renderer: ${SDL.GetError()}`
  );

  SDL.SetWindowTitle(window, "Deno Cells");

  const playerTexture = IMG.LoadTexture(
    renderer,
    path.join(ASSETS_PATH, "denoCellsPlayer.png")
  )!;

  const levelTexture = IMG.LoadTexture(
    renderer,
    path.join(ASSETS_PATH, "denoCellsLevel.png")
  )!;

  SDL.SetRenderDrawColor(renderer, 0, 0, 0, 255);

  const event = new SDL.Event();

  let done = false;
  let showHitBox = false;
  let showTileRect = false;
  let showCollisionRect = false;

  const level = new Level(levelTexture);

  const player = new Player(playerTexture, keys, level);

  while (!done) {
    const tick = performance.now();

    player.update(tick);

    lastTick = tick;

    while (SDL.PollEvent(event) != 0) {
      if (event.type === SDL.EventType.QUIT) {
        done = true;
      }
      if (
        event.type === SDL.EventType.KEYDOWN ||
        event.type === SDL.EventType.KEYUP
      ) {
        const k = SDL.GetScancodeName(event.key.keysym.scancode);

        if (Object.hasOwn(keys, k)) {
          keys[k] = event.type === SDL.EventType.KEYDOWN ? true : false;
        }

        if (event.type === SDL.EventType.KEYDOWN && k === "L") {
          showHitBox = !showHitBox;
        }

        if (event.type === SDL.EventType.KEYDOWN && k === "T") {
          showTileRect = !showTileRect;
        }

        if (event.type === SDL.EventType.KEYDOWN && k === "C") {
          showCollisionRect = !showCollisionRect;
        }
      }
    }

    SDL.RenderClear(renderer);

    SDL.SetRenderDrawColor(renderer, 0, 255, 0, 255);
    for (const tile of level.tiles) {
      if (!tile.dstrect) {
        continue;
      }

      SDL.RenderCopy(renderer, level.texture, tile.srcrect, tile.dstrect);
      if (showTileRect) {
        SDL.RenderDrawRect(renderer, tile.dstrect);
      }
    }

    const center = new SDL.Point(
      player.worldRect.w / 2,
      player.worldRect.h / 2
    );

    SDL.RenderCopyEx(
      renderer,
      player.texture,
      player.animRect,
      player.worldRect,
      0,
      center,
      player.flip
    );
    SDL.SetRenderDrawColor(renderer, 255, 0, 0, 255);

    const hitbox = player.hitbox;

    if (showHitBox) {
      SDL.RenderDrawLine(renderer, 0, hitbox.y, WINDOW_WIDTH, hitbox.y);
      SDL.RenderDrawLine(
        renderer,
        0,
        hitbox.y + hitbox.h,
        WINDOW_WIDTH,
        hitbox.y + hitbox.h
      );
      SDL.RenderDrawLine(
        renderer,
        hitbox.x + hitbox.w,
        0,
        hitbox.x + hitbox.w,
        WINDOW_HEIGHT
      );
      SDL.RenderDrawLine(renderer, hitbox.x, 0, hitbox.x, WINDOW_HEIGHT);
    }

    if (showCollisionRect) {
      SDL.SetRenderDrawColor(renderer, 255, 255, 0, 255);
      SDL.RenderDrawRect(renderer, player.collisionRect);
    }

    SDL.SetRenderDrawColor(renderer, 0, 0, 0, 255);
    SDL.RenderPresent(renderer);
    SDL.RenderFlush(renderer);
    
    const skip = tick + SKIP_TICKS - performance.now();

    sleep(skip);
  }

  SDL.DestroyWindow(window);
  SDL.Quit();

  return 0;
}

// Non CPU blocking sleep method, more accurate than `await setTimeout` in testing
function sleep(ms: number): void {
  const sab = new SharedArrayBuffer(4);
  const view = new Int32Array(sab);
  Atomics.wait(view, 0, 0, ms);
}

try {
  Deno.exit(await main());
} catch (error) {
  console.error(error);
  Deno.exit(1);
}
