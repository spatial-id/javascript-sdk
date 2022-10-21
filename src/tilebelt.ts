import { BBox } from "geojson";

const d2r = Math.PI / 180,
      r2d = 180 / Math.PI,
      MAX_ZOOM = 28;

export function getBboxZoom(bbox: BBox) {
  for (let z = 0; z < MAX_ZOOM; z++) {
    const mask = 1 << (32 - (z + 1));
    if (((bbox[0] & mask) !== (bbox[2] & mask)) ||
        ((bbox[1] & mask) !== (bbox[3] & mask))) {
      return z;
    }
  }

  return MAX_ZOOM;
}

/**
 * Get the smallest tile to cover a bbox
 */
export function bboxToTile(bboxCoords: BBox, minZoom?: number): Array<number> {
  const min = pointToTile(bboxCoords[0], bboxCoords[1], 32);
  const max = pointToTile(bboxCoords[2], bboxCoords[3], 32);
  const bbox: BBox = [min[0], min[1], max[0], max[1]];

  const z = Math.min(getBboxZoom(bbox), typeof minZoom !== 'undefined' ? minZoom : MAX_ZOOM);
  if (z === 0) return [0, 0, 0];
  const x = bbox[0] >>> (32 - z);
  const y = bbox[1] >>> (32 - z);
  return [x, y, z];
}

/**
 * Get the tile for a point at a specified zoom level
 */
export function pointToTile(lon: number, lat: number, z: number) {
  var tile = pointToTileFraction(lon, lat, z);
  tile[0] = Math.floor(tile[0]);
  tile[1] = Math.floor(tile[1]);
  return tile;
}

/**
 * Get the precise fractional tile location for a point at a zoom level
 */
function pointToTileFraction(lon: number, lat: number, z: number) {
  var sin = Math.sin(lat * d2r),
      z2 = Math.pow(2, z),
      x = z2 * (lon / 360 + 0.5),
      y = z2 * (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);

  // Wrap Tile X
  x = x % z2;
  if (x < 0) x = x + z2;
  return [x, y, z];
}
