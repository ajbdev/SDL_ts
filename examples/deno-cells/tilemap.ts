
enum TileMapType {
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
  W: 'W'
} as const;

type dirs = keyof typeof dirs;

interface TileMapDefinition {
  type: TileMapType;
  coords: {
    [key in dirs]?: [number, number]
  }
}

const BRICK: TileMapDefinition = {
  type: TileMapType.AUTOTILE,
  coords: {
    NW: [1, 1],
    N: [2, 1],
    NE: [3, 1],
    E: [3, 2],
    SW: [1, 3],
    W: [1, 2],
    S: [2, 3],
    SE: [3, 3]
  }
}

const definitions = {
  BRICK: BRICK
}

interface PlacedTile {
  def: keyof typeof definitions
  adjacent: {
    [keys in dirs]?: PlacedTile
  }
}

function determineEdge(tile: PlacedTile) {
  
}