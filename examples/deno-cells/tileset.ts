import { SDL } from "SDL_ts";
import { Tile } from "./tilemap.ts";


enum TileSetType {
  AUTOTILE,
}

const dirs = {
  NW: 'NW',
  N: 'N',
  NE: 'NE',
  E: 'E',
  SE: 'SE',
  S: 'S',
  SW: 'SW',
  W: 'W',
  CENTER: 'CENTER'
} as const;

type Dir = keyof typeof dirs;

interface TileSetDefinition {
  type: TileSetType;
  coords: {
    [key in Dir]?: [number, number]
  }
}

const BRICK: TileSetDefinition = {
  type: TileSetType.AUTOTILE,
  coords: {
    CENTER: [2, 2],
    NW: [1, 1],
    N: [2, 1],
    NE: [3, 1],
    E: [3, 2],
    SW: [1, 3],
    W: [1, 2],
    S: [2, 3],
    SE: [3, 3],
  },
};

export const TileSetDefinitions = {
  BRICK: BRICK
} as const;

export type TileSetDefinitions = keyof typeof TileSetDefinitions;

 interface PlacedTile extends Tile {
  def: keyof typeof TileSetDefinitions
  adjacent: {
    [keys in Dir]?: PlacedTile
  }
}

function determineEdge(tile: PlacedTile): Dir {
  const rules = {
    NW: ['N','W'],
    N: ['N'],
    NE: ['N','E'],
    E: ['E'],
    SE: ['S','E'],
    S: ['S']
  }

  const possibilities = Object.values(rules).map((mustNotBe: string[], ix: number) => {
    for (const dir of mustNotBe) {
      const neighbor = tile.adjacent[dir as Dir];

      if (neighbor && neighbor.def === tile.def) {
        return null;
      }
    }
    
    return Object.keys(rules)[ix];
  }).filter(p => p);
  
  if (!possibilities.length) {
    return dirs.CENTER;
  }

  return possibilities.pop() as Dir;
}


export class TileSet {
  public readonly definitions: TileSetDefinitions[];

  constructor(public readonly texture: SDL.Texture) { 
    this.definitions = [
      'BRICK'
    ]
  }
}