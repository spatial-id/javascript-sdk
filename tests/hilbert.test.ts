import { encodeHilbert3D, decodeHilbert3D } from "../src/hilbert";

describe('hilbert', () => {
  describe(`round-trip hilbert transformation`, () => {
    const inputs: [number, [number, number, number]][] = [
      [1, [0, 0, 0]],
      [1, [1, 1, 1]],
      [2, [0, 0, 0]],
      [2, [3, 3, 3]],
      [25, [0, 0, 0]], // min of zoom 25
      [25, [33554431, 33554431, 33554431]], // max of zoom 25
    ];
    for (let i = 0; i < 100; i++) {
      const order = Math.floor(Math.random() * 25 + 1);
      const coordMax = Math.pow(2, order) - 1;
      const x = Math.floor(Math.random() * coordMax);
      const y = Math.floor(Math.random() * coordMax);
      const z = Math.floor(Math.random() * coordMax);
      inputs.push([order, [x, y, z]]);
    }

    for (const [order, point] of inputs) {
      const [x, y, z] = point;
      it(`h${order}, (${x}, ${y}, ${z})`, () => {
        const idx = encodeHilbert3D(x, y, z, order);
        const invPoint = decodeHilbert3D(idx, order);
        expect(invPoint).toEqual(point);
      });
    }
  });
});
