// Function 1: Encode (x,y,z) to Hilbert curve index
export function encodeHilbert3D(x: number, y: number, z: number, bits: number): bigint {
  let morton = encodeMorton3D(x, y, z);
  return mortonToHilbertN(morton, bits);
}

// Function 2: Decode Hilbert curve index to (x,y,z)
export function decodeHilbert3D(index: bigint, bits: number): [number, number, number] {
  const morton = hilbertToMortonN(index, bits);
  return decodeMorton3D(morton);
}

// Helper functions: Encode/decode Morton curve using magic bits
// This is a 3D Morton curve implementation, adapted from https://stackoverflow.com/questions/1024754/how-to-compute-a-3d-morton-number-interleave-the-bits-of-3-ints
function encodeMorton3D(x: number, y: number, z: number): bigint {
  let morton = 0n;
  morton = splitBy3(x) | (splitBy3(y) << 1n) | (splitBy3(z) << 2n);
  return morton;
}

function decodeMorton3D(morton: bigint): [number, number, number] {
  let x = compactBy3(morton);
  let y = compactBy3(morton >> 1n);
  let z = compactBy3(morton >> 2n);
  return [x, y, z];
}

function splitBy3(a: number): bigint {
  let x = BigInt(a) & BigInt('0x3ffffffffff');
  x = (x | x << 64n) & BigInt('0x3ff0000000000000000ffffffff');
  x = (x | x << 32n) & BigInt('0x3ff00000000ffff00000000ffff');
  x = (x | x << 16n) & BigInt('0x30000ff0000ff0000ff0000ff0000ff');
  x = (x | x <<  8n) & BigInt('0x300f00f00f00f00f00f00f00f00f00f');
  x = (x | x <<  4n) & BigInt('0x30c30c30c30c30c30c30c30c30c30c3');
  x = (x | x <<  2n) & BigInt('0x9249249249249249249249249249249');
  return x;
}

function compactBy3(a: bigint): number {
  let x = a & BigInt('0x9249249249249249249249249249249');
  x = (x | x >>  2n) & BigInt('0x30c30c30c30c30c30c30c30c30c30c3');
  x = (x | x >>  4n) & BigInt('0x300f00f00f00f00f00f00f00f00f00f');
  x = (x | x >>  8n) & BigInt('0x30000ff0000ff0000ff0000ff0000ff');
  x = (x | x >> 16n) & BigInt('0x3ff00000000ffff00000000ffff');
  x = (x | x >> 32n) & BigInt('0x3ff0000000000000000ffffffff');
  x = (x | x >> 64n) & BigInt('0x3ffffffffff');
  return Number(x);
}

// Helper functions: Translate morton/hilbert codes using a simple lookup table
// This code has been adapted from http://threadlocalmutex.com/?p=149
const mortonToHilbertTable: number[] = [
  48, 33, 27, 34, 47, 78, 28, 77,
  66, 29, 51, 52, 65, 30, 72, 63,
  76, 95, 75, 24, 53, 54, 82, 81,
  18,  3, 17, 80, 61,  4, 62, 15,
   0, 59, 71, 60, 49, 50, 86, 85,
  84, 83,  5, 90, 79, 56,  6, 89,
  32, 23,  1, 94, 11, 12,  2, 93,
  42, 41, 13, 14, 35, 88, 36, 31,
  92, 37, 87, 38, 91, 74,  8, 73,
  46, 45,  9, 10,  7, 20, 64, 19,
  70, 25, 39, 16, 69, 26, 44, 43,
  22, 55, 21, 68, 57, 40, 58, 67,
];

const hilbertToMortonTable: number[] = [
  48, 33, 35, 26, 30, 79, 77, 44,
  78, 68, 64, 50, 51, 25, 29, 63,
  27, 87, 86, 74, 72, 52, 53, 89,
  83, 18, 16,  1,  5, 60, 62, 15,
   0, 52, 53, 57, 59, 87, 86, 66,
  61, 95, 91, 81, 80,  2,  6, 76,
  32,  2,  6, 12, 13, 95, 91, 17,
  93, 41, 40, 36, 38, 10, 11, 31,
  14, 79, 77, 92, 88, 33, 35, 82,
  70, 10, 11, 23, 21, 41, 40,  4,
  19, 25, 29, 47, 46, 68, 64, 34,
  45, 60, 62, 71, 67, 18, 16, 49,
];

function transformCurve(inValue: bigint, bits: number, lookupTable: number[]): bigint {
  let transform = 0;
  let out = 0n;

  for (let i = 3 * (bits - 1); i >= 0; i -= 3) {
    transform = lookupTable[transform | Number((inValue >> BigInt(i)) & 7n)];
    out = (out << 3n) | BigInt(transform & 7);
    transform &= ~7;
  }

  return out;
};

function mortonToHilbertN(mortonIndex: bigint, bits: number): bigint {
  return transformCurve(mortonIndex, bits, mortonToHilbertTable);
}
function hilbertToMortonN(hilbertIndex: bigint, bits: number): bigint {
  return transformCurve(hilbertIndex, bits, hilbertToMortonTable);
}
