import { BaseTile } from "./tilemap.ts";


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

 export interface LinkedTile extends BaseTile {
  def: keyof typeof TileSetDefinitions
  adjacent: {
    [keys in Dir]?: LinkedTile
  }
}


//8-way floodfill using stack
// void floodFill8Stack(int x, int y, int newColor, int oldColor)
// {
//   if(newColor == oldColor) return; //avoid infinite loop

//   static const int dx[8] = {0, 1, 1, 1, 0, -1, -1, -1}; // relative neighbor x coordinates
//   static const int dy[8] = {-1, -1, 0, 1, 1, 1, 0, -1}; // relative neighbor y coordinates

//   std::vector stack;
//   push(stack, x, y);
//   while(pop(stack, x, y))
//   {
//     screenBuffer[y][x] = newColor;
//     for(int i = 0; i < 8; i++) {
//       int nx = x + dx[i];
//       int ny = y + dy[i];
//       if(nx >= 0 && nx < w && ny >= 0 && ny < h && screenBuffer[ny][nx] == oldColor) {
//         push(stack, nx, ny);
//       }
//     }
//   }
// }
function determineEdge(tile: LinkedTile): Dir {
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


export const TileSetDefinitions = {
  BRICK: BRICK,
} as const;

export type TileSetDefinitions = keyof typeof TileSetDefinitions;