import { TileSet, TileSetDefinitions } from "./tileset.ts";
import { Vector } from "./util.ts";
import { SDL } from "SDL_ts";

export interface Tile {
  pos: Vector;
  definition: TileSetDefinitions;
  srcrect: SDL.Rect;
  dstrect?: SDL.Rect;
}

export class TileMap {
  private tiles: Tile[] = [];

  constructor(public readonly tileset: TileSet) {
  }

  public retrieve(at: Vector): Tile | undefined {
    return this.tiles.find(
      (tile) => tile.pos.x === at.x && tile.pos.y === at.y,
    );
  }

  public add(tile: Tile): void {
    if (!this.retrieve(tile.pos)) {
      this.tiles.push(tile);
    }
  }
}

class TileMapCanvas {
  private definition: TileSetDefinitions;
  constructor(private tileMap: TileMap) {
    this.definition = tileMap.tileset.definitions[0];
  }

  // Imperative function style so you can "draw" the tilemap like a canvas
  setDefinition(def: TileSetDefinitions) {}

  draw(at: Vector) {
    this.tileMap.add({
      at,
      definition: this.definition,
    });
  }

  rect(start: Vector, end: Vector) {}

  line(at: Vector, angle: Vector, amount: number) {
    for (let i = 0; i < amount; i++) {
      const pos = vec(at.x + (angle.x * i), at.y + (angle.y * i));

      this.draw(pos);
    }
  }
}

// Example implementation:
//
