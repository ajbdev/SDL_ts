import { TileSetDefinitions } from "./tileset.ts";
import { vec, Vector } from "./util.ts";
import { SDL } from "SDL_ts";

const dirs = {
  NW: "NW",
  N: "N",
  NE: "NE",
  E: "E",
  SE: "SE",
  S: "S",
  SW: "SW",
  W: "W",
  CENTER: "CENTER",
} as const;

type Dir = keyof typeof dirs;
export interface BaseTile {
  pos: Vector;
  def: TileSetDefinitions;
}

export interface RenderedTile extends BaseTile {
  edge: Dir;
  srcrect: SDL.Rect;
  dstrect: SDL.Rect;
}

export class TileMap {
  public readonly tiles: BaseTile[] = [];
  public readonly canvas: TileMapCanvas;

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
      const edge = this.determineEdge(tile);

      const def = TileSetDefinitions[tile.def];

      const { coords } = def;

      const srcrect = new SDL.Rect(
        coords[edge]![0] * def.tileSize,
        coords[edge]![1] * def.tileSize,
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
        edge,
        srcrect,
        dstrect,
      };
    });
  }

  public determineEdge(target: BaseTile): Dir {
    const possibilities = {
      NW: ["N", "W"],
      N: ["N"],
      NE: ["N", "E"],
      E: ["E"],
      SE: ["S", "E"],
      S: ["S"],
      SW: ["S", "W"],
      W: ["W"],
    };

    const angles = {
      N: vec(0, -1),
      NE: vec(1, -1),
      E: vec(1, 0),
      SE: vec(1, 1),
      S: vec(0, 1),
      SW: vec(-1, 1),
      W: vec(-1, 0),
      NW: vec(-1, -1),
    };

    for (const tile of this.tiles) {
      for (const [dir, angle] of Object.entries(angles)) {
        if (
          target.pos.x + angle.x === tile.pos.x &&
          target.pos.y + angle.y === tile.pos.y
        ) {
          Object.keys(possibilities).forEach((edge) => {
            if (
              possibilities[edge as keyof typeof possibilities].indexOf(dir) >
              -1
            ) {
              delete possibilities[edge as keyof typeof possibilities];
            }
          });
        }
      }
    }

    const edge = Object.keys(possibilities).pop();

    if (!edge) {
      return "CENTER";
    }

    return edge as Dir;
  }
}

class TileMapCanvas {
  private definition: TileSetDefinitions;
  constructor(private tileMap: TileMap) {
    this.definition = "BRICK";
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
