import { TileSetDefinition, TileSetDefinitions, TileSetType } from "./tileset.ts";
import { vec, Vector, Dir } from "./util.ts";
import { SDL } from "SDL_ts";

export interface BaseTile {
  pos: Vector;
  def: TileSetDefinitions;
}

export interface RenderedTile extends BaseTile {
  srcrect: SDL.Rect;
  dstrect: SDL.Rect;
}

type Neighbors = Partial<Record<keyof typeof Dir, boolean>>;

// const hasOpenNeighbors = (dirs: Dir[], neighbors: Set<Dir>): boolean =>
//   !dirs.some((dir) => neighbors.has(dir));

// const hasNeighbors = (dirs: Dir[], neighbors: Set<Dir>): boolean =>
//   dirs.every((dir) => neighbors.has(dir));

export class TileMap {
  public readonly tiles: BaseTile[] = [];
  public readonly canvas: TileMapCanvas;
  // readonly edgeRules: Map<Dir[], Dir> = new Map();

  readonly angles: Record<keyof Omit<typeof Dir, "CENTER">, Vector> = {
    N: vec(0, -1),
    NE: vec(1, -1),
    E: vec(1, 0),
    SE: vec(1, 1),
    S: vec(0, 1),
    SW: vec(-1, 1),
    W: vec(-1, 0),
    NW: vec(-1, -1),
    LEFT: vec(-1, 0),
    TOP: vec(0, -1),
    RIGHT: vec(1, 0),
    BOTTOM: vec(0, 1),
  };

  constructor() {
    this.canvas = new TileMapCanvas(this);
  }

  public retrieve(at: Vector): BaseTile | undefined {
    return this.tiles.find(
      (tile) => tile.pos.x === at.x && tile.pos.y === at.y
    );
  }

  public add(tile: BaseTile): void {
    if (!this.retrieve(tile.pos)) {
      this.tiles.push(tile);
    }
  }

  public render(): RenderedTile[] {
    return this.tiles.map((tile) => {
      const def = TileSetDefinitions[tile.def];

      const coords = this.getTileTextureCoords(tile);

      const srcrect = new SDL.Rect(
        coords.x * def.tileSize,
        coords.y * def.tileSize,
        def.tileSize,
        def.tileSize
      );

      const dstrect = new SDL.Rect(
        tile.pos.x * def.tileSize,
        tile.pos.y * def.tileSize,
        def.tileSize,
        def.tileSize
      );

      return {
        ...tile,
        srcrect,
        dstrect,
      };
    });
  }

  public getTileTextureCoords(tile: BaseTile): Vector {
    const { TOP, LEFT, CENTER, RIGHT, BOTTOM, N, NW, W, SW, S, SE, E, NE } =
      this.neighbors(tile);

    const def: TileSetDefinition = TileSetDefinitions[tile.def];

    switch (def.type) {
      case "VERTICAL_BOUNDARY":
        return TOP && BOTTOM
          ? def.coords.CENTER
          : BOTTOM
          ? def.coords.TOP
          : def.coords.BOTTOM;
      case "HORIZONTAL_BOUNDARY":
        return LEFT && RIGHT
          ? def.coords.CENTER
          : LEFT
          ? def.coords.RIGHT
          : def.coords.LEFT;
      default:
        return vec(0,0);
    }
  }

  public neighbors(target: BaseTile): Neighbors {
    return this.tiles
      .map((tile) => {
        return Object.entries(this.angles)
          .filter(
            ([dir, angle]) =>
              target.pos.x + angle.x === tile.pos.x &&
              target.pos.y + angle.y === tile.pos.y
          )
          .map(([dir, _]) => dir as Dir);
      })
      .flatMap((a) => a)
      .reduce(
        (obj, dir) => ({
          ...obj,
          [dir]: true,
        }),
        {}
      );
  }
}

class TileMapCanvas {
  private definition: TileSetDefinitions;
  constructor(private tileMap: TileMap) {
    this.definition = "BRICK_FLOOR";
  }

  // Imperative function style so you can "draw" the tilemap like a canvas
  setDefinition(def: TileSetDefinitions): void {
    this.definition = def;
  }

  draw(at: Vector): void {
    this.tileMap.add({
      pos: at,
      def: this.definition,
    });
  }

  // rect(start: Vector, end: Vector): void {}

  line(at: Vector, angle: Vector, amount: number): void {
    for (let i = 0; i < amount; i++) {
      const pos = vec(at.x + angle.x * i, at.y + angle.y * i);

      this.draw(pos);
    }
  }
}
