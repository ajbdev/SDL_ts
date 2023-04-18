import { SDL } from "SDL_ts";

import { Vector, vec } from './util.ts';

enum Tiles {
  BLANK,
  FLOOR,
  FLOOR_TL,
  FLOOR_TR
}

interface Tile {
  coords: Vector
  label: Tiles,
  srcrect: SDL.Rect,
  dstrect?: SDL.Rect
}

class Tilemap {
  tiles: Tile[] = [];

  constructor(public readonly tileSize: number) {
    this.tile(0, 0, Tiles.BLANK);
    this.tile(2, 1, Tiles.FLOOR);
  }
  
  tile(coordsX: number, coordsY: number, label: Tiles): void {
    const srcrect = new SDL.Rect(coordsX * this.tileSize, coordsY * this.tileSize, this.tileSize, this.tileSize);

    this.tiles.push({
      coords: vec(coordsX, coordsY),
      label,
      srcrect
    });
  }

  get(label: Tiles): Tile {
    return this.tiles.find(t => t.label === label) ?? this.tiles[0];
  }
}

export class Level {
  public readonly tiles: Tile[] = [];
  private tilemap: Tilemap;
  constructor(public readonly texture: SDL.Texture) { 
    this.tilemap = new Tilemap(16);

    this.draw();
  }

  get tileSize():number {
    return this.tilemap.tileSize;
  }

  draw(): void {
    this.fill(this.tilemap.get(Tiles.FLOOR), vec(0, 3), vec(1, 0), 64);
  }
  
  fill(tile: Tile, at: Vector, dir: Vector, amount: number): void {
    for (let i = 0; i < amount; i++) {
      const pos = vec(at.x + (dir.x * i), at.y + (dir.y * i));

      this.tiles.push(
        {
          ...tile,
          dstrect: new SDL.Rect(
            pos.x * this.tileSize,
            pos.y * this.tileSize,
            this.tileSize,
            this.tileSize
          )
        }
      )
    }
  }
}
