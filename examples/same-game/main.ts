import { Box, BoxArray, IMG, Int, int, Pointer, SDL, SDLError, TTF, u64 } from "SDL_ts";
import { path } from "../../deps.ts";
import { Board } from "./logic/board.ts";
import { Random } from "./logic/random.ts";
import { drawBoard } from "./rendering/board.ts";
import { ASSETS_PATH } from "../../shared/constants.ts";
import { createFontAtlas, FontAtlas } from "./fonts.ts";
import { join } from "https://deno.land/std@0.173.0/path/win32.ts";

const WINDOW_WIDTH = 1024;
const WINDOW_HEIGHT = 768;
const UPDATE_INTERVAL = 16n; // 1000ms / 60fps

function main(): number {
  SDL.Init(SDL.InitFlags.VIDEO);
  IMG.Init(IMG.InitFlags.PNG);
  TTF.Init();

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

  const blockTexture = IMG.LoadTexture(renderer, path.join(ASSETS_PATH, "blocks.png"));

  if (blockTexture == null) {
    throw new SDLError("Failed to create texture for block.png");
  }

  const font = createFontAtlas(renderer, join(ASSETS_PATH, "Hack.ttf"), 24);

  const board = new Board(new Random(12345));

  const event = new SDL.Event();

  let done = false;
  let lastTime = 0n;

  while (!done) {
    while (SDL.PollEvent(event) != 0) {
      switch (event.type) {
        case SDL.EventType.QUIT:
          done = true;
          break;

        case SDL.EventType.MOUSEBUTTONDOWN: {
          const mouseButtonEvent = event.mousebutton;
          if (event.mousebutton.clicks >= 2) {
            board.onDoubleClick();
          } else {
            board.onClick(mouseButtonEvent.x, mouseButtonEvent.y);
          }
          break;
        }
      }
    }

    const currentTime = SDL.GetTicks64();
    const elapsedTime = currentTime - lastTime;

    if (elapsedTime >= UPDATE_INTERVAL) {
      update(elapsedTime, board);
      draw(renderer, board, blockTexture, font);
      lastTime = currentTime;
    }
  }

  SDL.DestroyWindow(window);
  SDL.Quit();

  return 0;
}

function update(
  elapsed: u64,
  board: Board,
): void {
  board.update(elapsed);
}

function draw(
  renderer: Pointer<SDL.Renderer>,
  board: Board,
  blockTexture: SDL.Texture,
  font: FontAtlas,
): void {
  SDL.SetRenderDrawColor(renderer, 0, 0, 0, 255);
  SDL.RenderClear(renderer);

  drawBoard(renderer, board, blockTexture);

  SDL.RenderCopy(renderer, font.texture, font.glyphs["@"], new SDL.Rect(0, 0, font.glyphs["@"].w, font.glyphs["@"].h));

  SDL.RenderPresent(renderer);
  SDL.RenderFlush(renderer);
}

try {
  Deno.exit(main());
} catch (err) {
  console.error(err);
  Deno.exit(1);
}
