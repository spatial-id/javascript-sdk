import { Space } from '../src/index';

describe('Space', () => {
  it('works', () => {
    const space = new Space('1/0/0/0');
    expect(space.zfxy).toStrictEqual({z: 1, f: 0, x: 0, y: 0});
    expect(space.zfxyStr).toStrictEqual('/1/0/0/0');
    expect(space.tilehash).toStrictEqual('1');

    expect(space.up(1).zfxy).toStrictEqual({z: 1, f: 1, x: 0, y: 0});
    expect(space.up(1).tilehash).toStrictEqual('5');
    expect(space.down(1).zfxy).toStrictEqual({z: 1, f: -1, x: 0, y: 0});
    expect(space.down(1).tilehash).toStrictEqual('-5');
  });

  const zfxyToPolygonTruthTable: [string, number[][]][] = [
    ['1/0/0/0', [
      [-180, 85.0511287798066],
      [-180, 0],
      [0, 0],
      [0, 85.0511287798066],
      [-180, 85.0511287798066],
    ]],
    ['25/0/29803304/13212456', [
      [139.75476264953613, 35.68595383239409],
      [139.75476264953613, 35.68594511814803],
      [139.7547733783722, 35.68594511814803],
      [139.7547733783722, 35.68595383239409],
      [139.75476264953613, 35.68595383239409],
    ]],
    ['22/0/3725212/1650923', [
      [139.73751068115234, 35.73014024024556],
      [139.73751068115234, 35.73007056488394],
      [139.73759651184082, 35.73007056488394],
      [139.73759651184082, 35.73014024024556],
      [139.73751068115234, 35.73014024024556],
    ]],
  ];
  for (const [zfxy, polygon] of zfxyToPolygonTruthTable) {
    it(`calculates GeoJSON for ${zfxy}`, () => {
      const space = new Space(zfxy);
      expect(space.toGeoJSON()).toStrictEqual({
        type: 'Polygon',
        coordinates: [
          polygon,
        ]
      });
    });
  }

  describe('parent', () => {
    it('returns the correct parent coordinates with no arguments', () => {
      const space = new Space('25/0/29803304/13212456');
      expect(space.parent().zfxy).toStrictEqual({z: 24, f: 0, x: 14901652, y: 6606228});
    });
    it('returns the correct parent coordinates at a specified zoom level', () => {
      const space = new Space('25/0/29803304/13212456');
      expect(space.parent(23).zfxy).toStrictEqual({z: 23, f: 0, x: 7450826, y: 3303114});
      expect(space.parent(22).zfxy).toStrictEqual({z: 22, f: 0, x: 3725413, y: 1651557});
      expect(space.parent(14).zfxy).toStrictEqual({z: 14, f: 0, x: 14552, y: 6451});
      expect(space.parent(0).zfxy).toStrictEqual({z: 0, f: 0, x: 0, y: 0});
    });
  });
});
