import { TileMap } from "./tilemap.ts";

import { vec } from "./util.ts";

const tileMap = new TileMap();

const { canvas } = tileMap;

canvas.line(vec(0, 3), vec(1, 0), 10);

