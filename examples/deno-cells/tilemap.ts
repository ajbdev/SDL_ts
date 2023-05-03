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
    console.log('---')
    console.log('Tile: ', target.pos);
    const rules: { [key:string]:[string, string]} = {
      // edge: [open, neighbors]
      NW: ["NW", "E"],
      N: ["N", "EW"],
      NE: ["NE", "W"],
      E: ["E", "SN"],
      SE: ["SE", "N"],
      S: ["S", "EW"],
      SW: ["SW", "N"],
      W: ["W", "SN"],
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

    const adjacent = this.tiles.map(tile => {
      return Object.entries(angles)
        .filter(
          ([dir, angle]) =>
            target.pos.x + angle.x === tile.pos.x &&
            target.pos.y + angle.y === tile.pos.y
        )
        .map(([dir, _]) => dir);
    }).flatMap(a => a);

    console.log('adjacent: ', adjacent.join(''));

    const edges = Object.entries(rules).filter(([edge, [open, neighbors]]) => {
      console.log("  tile: ", edge);
      const isOpen = !adjacent.some((dir) => open.indexOf(dir) > -1);
      console.log(`%c    has none of ${open}: ${isOpen}`, `color: ${isOpen ? 'green' : 'red'}`);
      const hasExactlyNeighbors =
        adjacent.every((dir) => neighbors.indexOf(dir) > -1) &&
        adjacent.length === neighbors.length;
      console.log(
        `%c    has exactly neighbors ${neighbors}: ${hasExactlyNeighbors}`,
        `color: ${hasExactlyNeighbors ? "green" : "red"}`
      );
      if (!isOpen) {
        return false;
      }

      if (!hasExactlyNeighbors) {
        return false;
      }

      return true;
    }).map(([edge, _], ) => {
      return edge;
    })

    console.log('possible edges: ', edges);

    if (edges.length > 0) {
      return edges.shift() as string as Dir;
    }

    return dirs.N;
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
