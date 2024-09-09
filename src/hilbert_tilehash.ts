// Functions to encode/decode 3D xyz coordinates to/from a Hilbert distance
// Uses Skilling's algorithm because it was the easiest to adapt to 3D coordinates
// (it's actually able to handle any number of dimensions, but we only need 3 right now)

import { ZFXYTile } from "./zfxy";
// import { HilbertCurve } from "./hilbert";
import { encodeHilbert3D, decodeHilbert3D } from "./hilbert";

export function hilbert3D(x: number, y: number, z: number, order: number): bigint {
  // const curve = new HilbertCurve(order, 3);
  // return curve.index(BigInt(x), BigInt(y), BigInt(z));
  return encodeHilbert3D(x, y, z, order);
}

export function inverseHilbert3D(hilbertDistance: bigint, order: number): [number, number, number] {
  // const curve = new HilbertCurve(order, 3);
  // const [x, y, z] = curve.point(hilbertDistance);
  // return [Number(x), Number(y), Number(z)];
  return decodeHilbert3D(hilbertDistance, order);
}

export function generateHilbertIndex(tile: ZFXYTile): bigint {
  // normalize the f attribute to be positive
  // this allows negative f values to be encoded in the hilbert index
  const f = tile.z > 0 ? tile.f + (2 ** (tile.z - 1)) : 0;
  return hilbert3D(tile.x, tile.y, f, tile.z);
}

export function parseHilbertIndex(hilbertDistance: bigint, z: number): ZFXYTile {
  if (z === 0) { return { z: 0, f: 0, x: 0, y: 0 }; }

  const [x, y, originalF] = inverseHilbert3D(hilbertDistance, z);
  // denormalize the f attribute
  const f = originalF - (2 ** (z - 1));
  return { f, x, y, z };
}

export function generateHilbertTilehash(tile: ZFXYTile): string {
  // radix 8 compresses 3 bits into 1 character (0-7)
  // we want 1-8, so we add 1 to each digit of the string
  return 'H' + generateHilbertIndex(tile).toString(8).padStart(tile.z, '0').split('').map((c) => (parseInt(c) + 1).toString()).join('');
}

export function parseHilbertTilehash(th: string): undefined | ZFXYTile {
  if (th[0] !== 'H') {
    return undefined;
  }
  // need to subtract 1 from each digit to convert back to radix 8
  const thDigits = th.substring(1).split('').map((c) => (parseInt(c) - 1).toString()).join('');
  const hilbertDistance = BigInt("0o" + thDigits); // thDigits is in radix 8, so we can parse it as an octal
  return parseHilbertIndex(hilbertDistance, thDigits.length);
}
