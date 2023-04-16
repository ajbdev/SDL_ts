import { Box, BoxArray, IMG, Int, int, Pointer, SDL, SDLError } from "SDL_ts";
import { path } from "../../deps.ts";
import { ASSETS_PATH } from "../../shared/constants.ts";
import { Player } from "./player.ts";

const WINDOW_WIDTH = 1024;
const WINDOW_HEIGHT = 768;

interface KeyMap {
  [key: string]: boolean
}


function main(): number {
  SDL.Init(SDL.InitFlags.VIDEO);
  IMG.Init(IMG.InitFlags.PNG);

  const windowBox = new Box<Pointer<SDL.Window>>(Pointer);
  const rendererBox = new Box<Pointer<SDL.Renderer>>(Pointer);

  // Just the keys we care about
  const keys: KeyMap = ['W','A','S','D','Space'].reduce((acc, key) => ({...acc, [key]: false}), {})

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

  const frameRect = new SDL.Rect(0, 0, 48, 48);

  SDL.SetRenderDrawColor(renderer, 0, 0, 0, 255);

  const event = new SDL.Event();

  let done = false;
  let lastDelta;

  const player = new Player(playerTexture, keys);

  while (!done) {
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
      }
    }

    const delta = performance.now(); // Is this the highest resolution method of acquiring delta in deno?

    if (lastDelta != delta) {
      player.update(delta);
      lastDelta = delta;
    }

    SDL.RenderClear(renderer);

    const offsetX = (player.origin.x - player.frame.w) / 2;
    const offsetY = (player.origin.y - player.frame.h) / 2;

    frameRect.x = player.pos.x + offsetX;
    frameRect.y = player.pos.y + offsetY;
    frameRect.w = player.frame.w;
    frameRect.h = player.frame.h;

    const center = new SDL.Point(frameRect.w / 2, frameRect.h / 2)

    SDL.RenderCopyEx(renderer, player.texture, player.frame, frameRect,0,center,player.flip);
    SDL.RenderPresent(renderer);
    SDL.RenderFlush(renderer);
  }

  SDL.DestroyWindow(window);
  SDL.Quit();

  return 0;
}

try {
  Deno.exit(main());
} catch (error) {
  console.error(error);
  Deno.exit(1);
}
