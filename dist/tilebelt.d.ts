import { BBox } from "geojson";
export declare function getBboxZoom(bbox: BBox): number;
/**
 * Get the smallest tile to cover a bbox
 */
export declare function bboxToTile(bboxCoords: BBox, minZoom?: number): Array<number>;
/**
 * Get the tile for a point at a specified zoom level
 */
export declare function pointToTile(lon: number, lat: number, z: number): number[];
