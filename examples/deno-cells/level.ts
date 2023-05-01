import { BaseTile, TileMap, TileMapCanvas } from "./tilemap.ts";
import { LinkedTile } from "./tileset.ts";
import { vec } from "./util.ts";



const canvas = new TileMapCanvas(new TileMap());

canvas.line(vec(0, 3), vec(1, 0), 10);

const angles = {
  N: vec(0, -1),
  NE: vec(1, -1),
  E: vec(1, 0),
  SE: vec(1, 1),
  S: vec(0, 1),
  SW: vec(-1, 1),
  W: vec(-1, 0),
  NW: vec(-1, -1)
}

function linkTiles(tileMap: TileMap): LinkedTile[] {
  return tileMap.tiles.map<LinkedTile>((tile: BaseTile) => {
    

    return {
      ...tile,
      adjacent: {}
    }
  })
}

