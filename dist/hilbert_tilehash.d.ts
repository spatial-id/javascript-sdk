import { ZFXYTile } from "./zfxy";
export declare function generateHilbertIndex(tile: ZFXYTile): bigint;
export declare function parseHilbertIndex(hilbertDistance: bigint, z: number): ZFXYTile;
export declare function generateHilbertTilehash(hilbertIndex: bigint, order: number): string;
export declare function parseHilbertTilehash(th: string): undefined | ZFXYTile;
