export declare function encodeHilbert3D(x: number, y: number, z: number, bits: number): bigint;
export declare function decodeHilbert3D(index: bigint, bits: number): [number, number, number];
export declare function encodeMorton3D(x: number, y: number, z: number): bigint;
export declare function decodeMorton3D(morton: bigint): [number, number, number];
