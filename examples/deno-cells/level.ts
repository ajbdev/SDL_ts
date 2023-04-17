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
  rect: SDL.Rect
}

const tile = (coordsX: number, coordsY: number, label: Tiles, tilesize: number): Tile => {
  const rect = new SDL.Rect(coordsX * tilesize, coordsY * tilesize, tilesize, tilesize)

  return {
    coords: vec(coordsX, coordsY),
    label,
    rect
  }
}

class Tilemap {
  tiles: Tile[];
  public readonly tilesize: number = 16;

  constructor() {
    this.tiles = [
      tile(0, 0, Tiles.BLANK, this.tilesize),
      tile(3, 2, Tiles.FLOOR, this.tilesize)
    ]
  }

  get(label: Tiles): Tile {
    return this.tiles.find(t => t.label === label) ?? this.tiles[0];
  }
}

export class Level {
  public grid: Tile[][] = [];
  private tilemap: Tilemap;
  constructor(public readonly texture: SDL.Texture) { 
    this.tilemap = new Tilemap();

    // Fixed grid size by dividing 1024x768 by 16
    for (let y = 0; y < 48; y++) {
      this.grid[y] = [];
      for (let x = 0; x < 64; x++) {
        this.grid[y][x] = this.tilemap.get(Tiles.BLANK);
      }
    }

    this.draw();
  }

  get tilesize():number {
    return this.tilemap.tilesize;
  }

  draw(): void {
    this.fill(this.tilemap.get(Tiles.FLOOR), vec(0, 2), vec(1, 0), 64);
  }
  
  fill(tile: Tile, at: Vector, dir: Vector, amount: number): void {
    for (let i = 0; i < amount; i++) {
      const step = vec(at.x + (dir.x * i), at.y + (dir.y * i));
      this.grid[at.y + step.y][at.x + step.x] = tile;
    }
  }
}
