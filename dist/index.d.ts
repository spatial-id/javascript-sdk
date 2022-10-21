import { LngLat, LngLatWithAltitude } from "./types";
import { ZFXYTile } from "./zfxy";
import type { Geometry, Polygon } from "geojson";
export declare class Space {
    center: LngLat;
    alt: number;
    zoom: number;
    zfxy: ZFXYTile;
    zfxyStr: string;
    tilehash: string;
    /**
     * Create a new Space
     *
     * @param input A LngLatWithAltitude or string containing either a ZFXY or tilehash-encoded ZFXY.
     * @param zoom Optional. Defaults to 25 when `input` is LngLatWithAltitude. Ignored when ZXFY or tilehash is provided.
     */
    constructor(input: LngLatWithAltitude | ZFXYTile | string, zoom?: number);
    up(by?: number): Space;
    down(by?: number): Space;
    north(by?: number): Space;
    south(by?: number): Space;
    east(by?: number): Space;
    west(by?: number): Space;
    move(by: Partial<Omit<ZFXYTile, 'z'>>): Space;
    parent(atZoom?: number): Space;
    children(): Space[];
    /** Calculates the polygon of this Space and returns a 2D GeoJSON Polygon. */
    toGeoJSON(): Polygon;
    /** Calculates the smallest spatial ID to fully contain the polygon. Currently only supports 2D polygons. */
    static boundingSpaceForGeometry(geom: Geometry, minZoom?: number): Space;
    /** Calculate an array of spaces that make up the polygon. Currently only supports 2D polygons. */
    static spacesForGeometry(geom: Geometry, zoom: number): Space[];
    private _regenerateAttributesFromZFXY;
}
