import { Polygon } from 'geojson';
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

const testPolygons: { [key: string]: Polygon } = {
  SIMPLE: {"coordinates":[[[139.7404337636242,35.676005522333085],[139.7404337636242,35.67374730758844],[139.7427432114959,35.67374730758844],[139.7427432114959,35.676005522333085],[139.7404337636242,35.676005522333085]]],"type":"Polygon"},
  DETAILED: {"coordinates":[[[139.73132532824928,35.66657408663923],[139.7308657092451,35.66613900145083],[139.73099702895985,35.66602897953335],[139.73108320752306,35.666103994493525],[139.7309847177366,35.666184010373385],[139.7312986539318,35.666487403189706],[139.7314894778924,35.66635737783834],[139.7310544813364,35.665987304525416],[139.73134174321268,35.665758925093],[139.73141561055252,35.66583560731111],[139.73118169730958,35.66599897352954],[139.73124940903864,35.66605398452789],[139.73146280357656,35.66589061842207],[139.73154487839815,35.665950630499836],[139.73131506889678,35.66610232749561],[139.73142586990656,35.666199013341924],[139.73170287243033,35.66614900343582],[139.7315941232913,35.66622901927059],[139.73171107991362,35.66633403993197],[139.73132532824928,35.66657408663923]]],"type":"Polygon"},
};

describe('boundingSpaceForGeometry', () => {
  it('automatically detects the smallest tile that contains the polygon', () => {
    const space = Space.boundingSpaceForGeometry(testPolygons.SIMPLE);
    expect(space.zfxy).toStrictEqual({z: 11, f: 0, x: 1818, y: 806});
  });

  it('respects the minimum zoom level', () => {
    const space = Space.boundingSpaceForGeometry(testPolygons.SIMPLE, 8);
    expect(space.zfxy).toStrictEqual({z: 8, f: 0, x: 227, y: 100});
  });
});

describe('spacesForGeometry', () => {
  it('returns the correct spaces for a simple polygon', () => {
    const spaces = Space.spacesForGeometry(testPolygons.SIMPLE, 15);
    expect(spaces.map(s => s.zfxy)).toStrictEqual([
      {z: 15, f: 0, x: 29103, y: 12903},
      {z: 15, f: 0, x: 29103, y: 12904},
    ]);
  });

  it('returns the correct spaces for a detailed polygon', () => {
    const spaces = Space.spacesForGeometry(testPolygons.DETAILED, 20);
    expect(spaces.map(s => s.zfxy)).toStrictEqual([
      { f: 0,    x: 931283,    y: 412959,    z: 20,  },
      { f: 0,    x: 931283,    y: 412960,    z: 20,  },
      { f: 0,    x: 931284,    y: 412958,    z: 20,  },
      { f: 0,    x: 931284,    y: 412959,    z: 20,  },
      { f: 0,    x: 931284,    y: 412960,    z: 20,  },
      { f: 0,    x: 931284,    y: 412961,    z: 20,  },
      { f: 0,    x: 931285,    y: 412958,    z: 20,  },
      { f: 0,    x: 931285,    y: 412959,    z: 20,  },
      { f: 0,    x: 931285,    y: 412960,    z: 20,  },
      { f: 0,    x: 931285,    y: 412961,    z: 20,  },
      { f: 0,    x: 931286,    y: 412959,    z: 20,  },
      { f: 0,    x: 931286,    y: 412960,    z: 20,  },
    ]);
  });
});
