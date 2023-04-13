import { Box, BoxArray, IMG, Int, int, Pointer, SDL, SDLError } from "SDL_ts";
import { path } from "../../deps.ts";
import { ASSETS_PATH } from "../../shared/constants.ts";

const WINDOW_WIDTH = 1024;
const WINDOW_HEIGHT = 768;


function main(): number {
  SDL.Init(SDL.InitFlags.VIDEO);
  IMG.Init(IMG.InitFlags.PNG);

  const windowBox = new Box<Pointer<SDL.Window>>(Pointer);
  const rendererBox = new Box<Pointer<SDL.Renderer>>(Pointer);

  SDL.CreateWindowAndRenderer(
    WINDOW_WIDTH,
    WINDOW_HEIGHT,
    SDL.WindowFlags.SHOWN,
    windowBox,
    rendererBox,
  );

  const window = windowBox.unboxNotNull(() => `Failed to create window: ${SDL.GetError()}`);
  const renderer = rendererBox.unboxNotNull(() => `Failed to create renderer: ${SDL.GetError()}`);

  SDL.SetWindowTitle(window, "Same Game");

  const blockTexture = IMG.LoadTexture(renderer, path.join(ASSETS_PATH, "PlayerWalk48x48.png"));

  if (blockTexture == null) {
    throw new SDLError("Failed to create texture for block.png");
  }

  const textureSizeBox = new BoxArray<int>(Int, 2);
  SDL.QueryTexture(blockTexture, null, null, textureSizeBox.pointers.at(0), textureSizeBox.pointers.at(1));

  const textureWidth = textureSizeBox.at(0);

  const frameRect = new SDL.Rect(0, 0, 48, 48);
  const current = new SDL.Rect(0, 0, 48, 48);

  SDL.SetRenderDrawColor(renderer, 0, 0, 0, 255);

  const event = new SDL.Event();

  let done = false;
  let lastDelta;

  while (!done) {
    while (SDL.PollEvent(event) != 0) {
      if (event.type === SDL.EventType.QUIT) {
        done = true;
      }
    }

    const delta = performance.now(); // Is this the highest resolution method of acquiring delta in deno?

    if (delta % 100 === 0 && lastDelta != delta) { 
      current.x += 48;
      
      if (current.x >= textureWidth) {
        current.x = 0;
      }

      lastDelta = delta;
    }

    SDL.RenderClear(renderer);
    SDL.RenderCopy(renderer, blockTexture, current, frameRect);
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
