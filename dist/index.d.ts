import { LngLat, LngLatWithAltitude } from "./types";
import { ZFXYTile } from "./zfxy";
export declare class Space {
    center: LngLat;
    alt: number;
    zoom: number;
    zfxy: ZFXYTile;
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
    parent(): Space;
    children(): Space[];
    private _regenerateAttributesFromZFXY;
}
