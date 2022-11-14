import { LngLatWithAltitude } from "./types";
import { ZFXYTile } from "./zfxy";
import type { Geometry, Polygon } from "geojson";
export declare class Space {
    center: LngLatWithAltitude;
    alt: number;
    zoom: number;
    zfxy: ZFXYTile;
    id: string;
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
    /** Return an array of Space objects at the same zoom level that surround this Space
     * object. This method does not return the Space object itself, so the array will
     * contain 26 Space objects.
     */
    surroundings(): Space[];
    /** Returns true if a point lies within this Space. If the position's altitude is not
     * specified, it is ignored from the calculation.
     */
    contains(position: LngLatWithAltitude): boolean;
    /** Calculates the polygon of this Space and returns a 2D GeoJSON Polygon. */
    toGeoJSON(): Polygon;
    /** Calculates the 3D polygon of this Space and returns the vertices of that polygon. */
    vertices3d(): [number, number, number][];
    static getSpaceById(id: string, zoom?: number): Space;
    static getSpaceByLocation(loc: LngLatWithAltitude, zoom?: number): Space;
    static getSpaceByZFXY(zfxyStr: string): Space;
    /** Calculates the smallest spatial ID to fully contain the polygon. Currently only supports 2D polygons. */
    static boundingSpaceForGeometry(geom: Geometry, minZoom?: number): Space;
    /** Calculate an array of spaces that make up the polygon. Currently only supports 2D polygons. */
    static spacesForGeometry(geom: Geometry, zoom: number): Space[];
    private _regenerateAttributesFromZFXY;
}
