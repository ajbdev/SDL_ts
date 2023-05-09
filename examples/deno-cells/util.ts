
export interface Vector {
  x: number;
  y: number;
}

const Cardinals = {
  NW: "NW",
  N: "N",
  NE: "NE",
  E: "E",
  SE: "SE",
  S: "S",
  SW: "SW",
  W: "W",
} as const;

const Relative = {
  LEFT: "LEFT",
  TOP: "TOP",
  RIGHT: "RIGHT",
  BOTTOM: "BOTTOM",
} as const;

export const Dir = { ...Cardinals, ...Relative, CENTER: "CENTER" } as const;

export type Dir = keyof typeof Dir;

export const vec = (x: number, y: number): Vector => ({ x, y });

export function clamp(num: number, min: number, max: number): number {
  return num <= min 
    ? min 
    : num >= max 
      ? max 
      : num
}
