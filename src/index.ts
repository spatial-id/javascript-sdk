import { LngLat, LngLatWithAltitude } from "./types";
import { calculateZFXY, getCenterLngLat, getChildren, getFloor, getParent, isZFXYTile, parseZFXYString, ZFXYTile, zfxyWraparound } from "./zfxy";
import { generateTilehash, parseZFXYTilehash } from "./zfxy_tilehash";

const DEFAULT_ZOOM = 25 as const;

export class Space {
  center: LngLat
  alt: number
  zoom: number

  zfxy: ZFXYTile
  tilehash: string

  /**
   * Create a new Space
   *
   * @param input A LngLatWithAltitude or string containing either a ZFXY or tilehash-encoded ZFXY.
   * @param zoom Optional. Defaults to 25 when `input` is LngLatWithAltitude. Ignored when ZXFY or tilehash is provided.
   */
  constructor(input: LngLatWithAltitude | ZFXYTile | string, zoom?: number) {
    if (typeof input === 'string') {
      // parse string
      let zfxy = parseZFXYString(input) || parseZFXYTilehash(input);
      if (zfxy) {
        this.zfxy = zfxy;
        this._regenerateAttributesFromZFXY();
      } else {
        throw new Error(`parse ZFXY failed with input: ${input}`);
      }
      return;
    } else if (isZFXYTile(input)) {
      this.zfxy = input;
      this._regenerateAttributesFromZFXY();
      return;
    } else {
      this.zfxy = calculateZFXY({
        ...input,
        zoom: (typeof zoom !== 'undefined') ? zoom : DEFAULT_ZOOM,
      });
    }

    this._regenerateAttributesFromZFXY();
  }

  /* - PUBLIC API - */

  up(by: number = 1) {
    return this.move({f: by});
  }

  down(by: number = 1) {
    return this.move({f: -by});
  }

  north(by: number = 1) {
    return this.move({y: by});
  }

  south(by: number = 1) {
    return this.move({y: -by});
  }

  east(by: number = 1) {
    return this.move({x: by});
  }

  west(by: number = 1) {
    return this.move({x: -by});
  }

  move(by: Partial<Omit<ZFXYTile, 'z'>>) {
    const newSpace = new Space(this.zfxy);
    newSpace.zfxy = zfxyWraparound({
      z: newSpace.zfxy.z,
      f: newSpace.zfxy.f + (by.f || 0),
      x: newSpace.zfxy.x + (by.x || 0),
      y: newSpace.zfxy.y + (by.y || 0),
    });
    newSpace._regenerateAttributesFromZFXY();
    return newSpace;
  }

  parent() {
    return new Space(getParent(this.zfxy));
  }

  children() {
    return getChildren(this.zfxy).map((tile) => new Space(tile));
  }

  private _regenerateAttributesFromZFXY() {
    this.center = getCenterLngLat(this.zfxy);
    this.alt = getFloor(this.zfxy);
    this.zoom = this.zfxy.z;
    this.tilehash = generateTilehash(this.zfxy);
  }
}
