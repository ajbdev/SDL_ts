
export interface Vector {
  x: number;
  y: number;
}

export const vec = (x: number, y: number): Vector => ({ x, y });

export function clamp(num: number, min: number, max: number): number {
  return num <= min 
    ? min 
    : num >= max 
      ? max 
      : num
}
