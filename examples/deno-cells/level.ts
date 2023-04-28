import { SDL } from "SDL_ts";

import { Vector, vec } from './util.ts';

const Tiles = {
  BLANK: 'BLANK',
  BRICK_N: 'BRICK_N',
  BRICK_NE: 'BRICK_NE',
  BRICK_E: 'BRICK_E',
  BRICK_SE: 'BRICK_SE',
  BRICK_S: 'BRICK_S',
  BRICK_SW: 'BRICK_SW',
  BRICK_NW: 'BRICK_NW',
  BRICK_W: 'BRICK_W',
  SLAB_N: 'SLAB_N',
} as const;

    // this.tile(0, 0, Tiles.BLANK);
    // this.tile(2, 1, Tiles.BRICK_N);
    // this.tile(3, 1, Tiles.BRICK_NE);
    // this.tile(3, 2, Tiles.BRICK_E);
    // this.tile(1, 3, Tiles.BRICK_SW);
    // this.tile(1, 2, Tiles.BRICK_W);
    // this.tile(2, 5, Tiles.SLAB_N);
const Tiles = {
  BRICK: {
    NW: [1,1],
    N: [2,1],
    NE: [3,1],
    E: [3,2],
    SW: [1,3],
    W: [1,2],
    S: [2,3],
    SE: [3,3]
  }
}

type Tiles = keyof typeof Tiles;

export enum TileFlag {
  BOUNDARY
}

const TileFlags: { [key in Tiles]?: TileFlag[] } = {
  [Tiles.BRICK_N]: [TileFlag.BOUNDARY],
  [Tiles.BRICK_NE]: [TileFlag.BOUNDARY],
  [Tiles.BRICK_E]: [TileFlag.BOUNDARY],
  [Tiles.BRICK_W]: [TileFlag.BOUNDARY],
  [Tiles.SLAB_N]: [TileFlag.BOUNDARY],
};

export function getTileFlags(tile: Tile): TileFlag[] | null {
  return TileFlags[tile.label] ?? null;
}

export function tileHasFlag(tile: Tile, flag: TileFlag): boolean {
  const flags = getTileFlags(tile);

  return !!flags && flags.indexOf(flag) > -1;
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
    this.tile(2, 1, Tiles.BRICK_N);
    this.tile(3, 1, Tiles.BRICK_NE);
    this.tile(3, 2, Tiles.BRICK_E);
    this.tile(1, 3, Tiles.BRICK_SW);
    this.tile(1, 2, Tiles.BRICK_W);
    this.tile(2, 5, Tiles.SLAB_N);
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
    this.fill(this.tilemap.get(Tiles.BRICK_N), vec(0, 3), vec(1, 0), 10);
    this.place(this.tilemap.get(Tiles.BRICK_NE), vec(10, 3));
    this.fill(this.tilemap.get(Tiles.BRICK_E), vec(10, 4), vec(0, 1), 3);
    this.fill(this.tilemap.get(Tiles.SLAB_N), vec(10, 7), vec(1, 0), 8);
    this.fill(this.tilemap.get(Tiles.BRICK_W), vec(17, 4), vec(0, 1), 3);
  }

  place(tile: Tile, at: Vector): void {
    this.tiles.push({
      ...tile,
      dstrect: new SDL.Rect(
        at.x * this.tileSize,
        at.y * this.tileSize,
        this.tileSize,
        this.tileSize
      )
    })
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
