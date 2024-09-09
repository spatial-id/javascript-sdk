import { ZFXYTile, getChildren, getParent } from "./zfxy";

export function parseZFXYTilehash(th: string): ZFXYTile {
  let negativeF = false;
  if (th[0] === '-') {
    negativeF = true;
    th = th.substring(1);
  }
  let children = getChildren();
  let lastChild: ZFXYTile;
  for (const c of th) {
    lastChild = {...children[parseInt(c, 10) - 1]};
    children = getChildren(lastChild);
  }
  if (negativeF) {
    lastChild.f = -lastChild.f;
  }
  return lastChild;
}

export function generateTilehash(tile: ZFXYTile): string {
  let {f,x,y,z} = tile;
  const originalF = f;
  let out = '';
  while (z>0) {
    const thisTile: ZFXYTile = { f: Math.abs(f), x: x, y: y, z: z };
    const parent = getParent(thisTile);
    const childrenOfParent = getChildren(parent);
    const positionInParent = childrenOfParent.findIndex(
      (child) => child.f === Math.abs(f) && child.x === x && child.y === y && child.z === z
    );
    out = (positionInParent + 1).toString() + out;
    f = parent.f;
    x = parent.x;
    y = parent.y;
    z = parent.z;
  }
  return (originalF < 0 ? '-' : '') + out;
}
