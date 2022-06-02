import { LngLat, LngLatWithAltitude } from "./types";
import { calculateZFXY, getChildren, getFloor, getLngLat, getParent, isZFXYTile, parseZFXYString, ZFXYTile, zfxyWraparound } from "./zfxy";
import { parseZFXYTilehash } from "./zfxy_tilehash";

const DEFAULT_ZOOM = 25 as const;

export default class Space {
  _position: LngLat
  _alt: number
  _zoom: number

  _zfxy: ZFXYTile
  /**
   * Create a new Space
   *
   * @param input A LngLatWithAltitude or string containing either a ZFXY or tilehash-encoded ZFXY.
   * @param zoom Optional. Defaults to 25 when `input` is LngLatWithAltitude. Ignored when ZXFY or tilehash is provided.
   */
  constructor(input: LngLatWithAltitude | ZFXYTile | string, zoom?: number) {
    let lngLat: LngLatWithAltitude;
    if (typeof input === 'string') {
      // parse string
      let zfxy = parseZFXYString(input) || parseZFXYTilehash(input);
      if (zfxy) {
        this._zfxy = zfxy;
        this._regenerateAttributesFromZFXY();
      } else {
        throw new Error(`parse ZFXY failed with input: ${input}`);
      }
      return;
    } else if (isZFXYTile(input)) {
      this._zfxy = input;
      this._regenerateAttributesFromZFXY();
      return;
    }

    lngLat = input;
    this._zoom = zoom;
    this._position = {lng: lngLat.lng, lat: lngLat.lat};
    this._alt = lngLat.alt || 0;
    this._zfxy = calculateZFXY({
      ...lngLat,
      zoom: (typeof zoom !== 'undefined') ? zoom : DEFAULT_ZOOM,
    });
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
    const newSpace = new Space(this._zfxy);
    newSpace._zfxy = zfxyWraparound({
      z: newSpace._zfxy.z,
      f: newSpace._zfxy.f + (by.f || 0),
      x: newSpace._zfxy.x + (by.x || 0),
      y: newSpace._zfxy.y + (by.y || 0),
    });
    newSpace._regenerateAttributesFromZFXY();
    return newSpace;
  }

  parent() {
    return new Space(getParent(this._zfxy));
  }

  children() {
    return getChildren(this._zfxy).map((tile) => new Space(tile));
  }

  private _regenerateAttributesFromZFXY() {
    this._position = getLngLat(this._zfxy);
    this._alt = getFloor(this._zfxy);
    this._zoom = this._zfxy.z;
  }
}
