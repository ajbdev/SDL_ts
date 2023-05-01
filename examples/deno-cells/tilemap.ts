import { TileSetDefinitions } from "./tileset.ts";
import { Vector, vec } from "./util.ts";

export interface BaseTile {
  pos: Vector;
  def: TileSetDefinitions;
}

export class TileMap {
  public readonly tiles: BaseTile[] = [];

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
}

export class TileMapCanvas {
  private definition: TileSetDefinitions;
  constructor(private tileMap: TileMap) {
    this.definition = 'BRICK';
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
      const pos = vec(at.x + (angle.x * i), at.y + (angle.y * i));

      this.draw(pos);
    }
  }
}
