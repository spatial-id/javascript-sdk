import { Space } from '../src/index';

describe('Space', () => {
  it('works', () => {
    const space = new Space('1/0/0/0');
    expect(space.zfxy).toStrictEqual({z: 1, f: 0, x: 0, y: 0});
    expect(space.tilehash).toStrictEqual('1');

    expect(space.up(1).zfxy).toStrictEqual({z: 1, f: 1, x: 0, y: 0});
    expect(space.up(1).tilehash).toStrictEqual('5');
    expect(space.down(1).zfxy).toStrictEqual({z: 1, f: -1, x: 0, y: 0});
    expect(space.down(1).tilehash).toStrictEqual('-5');
  });
});
