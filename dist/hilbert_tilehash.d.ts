import { ZFXYTile } from "./zfxy";
export declare function hilbert3D(x: number, y: number, z: number, order: number): bigint;
export declare function inverseHilbert3D(hilbertDistance: bigint, order: number): [number, number, number];
export declare function generateHilbertIndex(tile: ZFXYTile): bigint;
export declare function parseHilbertIndex(hilbertDistance: bigint, z: number): ZFXYTile;
export declare function generateHilbertTilehash(tile: ZFXYTile): string;
export declare function parseHilbertTilehash(th: string): undefined | ZFXYTile;
