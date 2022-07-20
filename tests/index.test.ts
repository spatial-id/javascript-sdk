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
});
