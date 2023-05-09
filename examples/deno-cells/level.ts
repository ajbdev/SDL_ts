import { TileMap } from "./tilemap.ts";
import { TileSetDefinitions } from "./tileset.ts";

import { vec } from "./util.ts";

const tileMap = new TileMap();

const { canvas } = tileMap;

canvas.draw(vec(0,3));

canvas.line(vec(3, 3), vec(1, 0), 10);

canvas.setDefinition('BRICK_WALL_EAST');

canvas.line(vec(12, 4), vec(0, 1), 4);

canvas.setDefinition("BRICK_FLOOR");

canvas.line(vec(3, 8), vec(1, 0), 10);

export const level = tileMap.render();