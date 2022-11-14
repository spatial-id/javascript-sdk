import * as zfxy from "../src/zfxy";

describe('zfxy', () => {
  describe('getCenterLngLatAlt', () => {
    it('works', () => {
      const center1 = zfxy.getCenterLngLatAlt({z: 25, f: 0, x: 16777216, y: 16777216});
      expect(center1.alt).toStrictEqual(0.5);

      const center2 = zfxy.getCenterLngLatAlt({z: 25, f: 1, x: 16777216, y: 16777216});
      expect(center2.alt).toStrictEqual(1.5);

      const center3 = zfxy.getCenterLngLatAlt({z: 20, f: 0, x: 524288, y: 524288});
      expect(center3.alt).toStrictEqual(16);

      const center4 = zfxy.getCenterLngLatAlt({z: 20, f: 1, x: 524288, y: 524288});
      expect(center4.alt).toStrictEqual(32 + 16);

      const center5 = zfxy.getCenterLngLatAlt({z: 20, f: 10, x: 524288, y: 524288});
      expect(center5.alt).toStrictEqual((32 * 10) + 16);
    });
  });
});
