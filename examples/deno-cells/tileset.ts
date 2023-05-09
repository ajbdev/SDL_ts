import { Dir, Vector, vec } from "./util.ts";

export const TileSetType = {
  HORIZONTAL_BOUNDARY: "HORIZONTAL_BOUNDARY",
  VERTICAL_BOUNDARY: "VERTICAL_BOUNDARY",
} as const;

export type TileSetType = keyof typeof TileSetType;
interface TileSetHorizontalBoundary  {
  type: "HORIZONTAL_BOUNDARY";
  tileSize: number;
  coords: Record<keyof Pick<typeof Dir, "LEFT" | "RIGHT" | "CENTER">, Vector>;
}

interface TileSetVerticalBoundary  {
  type: "VERTICAL_BOUNDARY";
  tileSize: number;
  coords: Record<keyof Pick<typeof Dir, "TOP" | "CENTER" | "BOTTOM">, Vector>;
}

export type TileSetDefinition = TileSetHorizontalBoundary | TileSetVerticalBoundary;

const BRICK_WALL_EAST: TileSetDefinition = {
  type: TileSetType.VERTICAL_BOUNDARY,
  tileSize: 16,
  coords: { 
    TOP: vec(3, 2),
    CENTER: vec(3, 2),
    BOTTOM: vec(3, 2)
  }
}

const BRICK_WALL_WEST: TileSetDefinition = {
  type: TileSetType.VERTICAL_BOUNDARY,
  tileSize: 16,
  coords: {
    TOP: vec(1, 2),
    CENTER: vec(1, 2),
    BOTTOM: vec(1, 2),
  },
};

const BRICK_FLOOR: TileSetDefinition = {
  type: TileSetType.HORIZONTAL_BOUNDARY,
  tileSize: 16,
  coords: {
    LEFT: vec(1, 1),
    CENTER: vec(2, 1),
    RIGHT: vec(3, 1),
  },
};

export const TileSetDefinitions = {
  BRICK_FLOOR,
  BRICK_WALL_EAST,
  BRICK_WALL_WEST,
} as const;

export type TileSetDefinitions = keyof typeof TileSetDefinitions;