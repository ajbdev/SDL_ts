
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
  tileSize: number;
  coords: {
    [key in Dir]?: [number, number]
  }
}

const BRICK: TileSetDefinition = {
  type: TileSetType.AUTOTILE,
  tileSize: 16,
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
  BRICK: BRICK,
} as const;

export type TileSetDefinitions = keyof typeof TileSetDefinitions;