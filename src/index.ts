import { LngLatWithAltitude } from "./types";
import { calculateZFXY, getBBox, getChildren, getFloor, getParent, isZFXYTile, parseZFXYString, ZFXYTile, zfxyWraparound, getSurrounding, getCenterLngLatAlt } from "./zfxy";
import { generateTilehash, parseZFXYTilehash } from "./zfxy_tilehash";
import turfBBox from '@turf/bbox';
import turfBooleanIntersects from '@turf/boolean-intersects';
import type { Geometry, Polygon } from "geojson";
import { bboxToTile, pointToTile } from "./tilebelt";

const DEFAULT_ZOOM = 25 as const;

export class Space {
  center: LngLatWithAltitude
  alt: number
  zoom: number

  zfxy: ZFXYTile

  id: string
  zfxyStr: string
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

  parent(atZoom?: number) {
    const steps = (typeof atZoom === 'undefined') ? 1 : this.zfxy.z - atZoom;
    return new Space(getParent(this.zfxy, steps));
  }

  children() {
    return getChildren(this.zfxy).map((tile) => new Space(tile));
  }

  /** Return an array of Space objects at the same zoom level that surround this Space
   * object. This method does not return the Space object itself, so the array will
   * contain 26 Space objects.
   */
  surroundings(): Space[] {
    return [
      ...(
        getSurrounding(this.zfxy)
        .filter(({z,f,x,y}) => `/${z}/${f}/${x}/${y}` !== this.zfxyStr)
        .map((tile) => new Space(tile))
      ),
      ...(
        getSurrounding(this.up().zfxy)
        .map((tile) => new Space(tile))
      ),
      ...(
        getSurrounding(this.down().zfxy)
        .map((tile) => new Space(tile))
      ),
    ];
  }

  /** Returns true if a point lies within this Space. If the position's altitude is not
   * specified, it is ignored from the calculation.
   */
  contains(position: LngLatWithAltitude) {
    const geom = this.toGeoJSON();
    const point = {
      type: 'Point',
      coordinates: [position.lng, position.lat],
    };
    const floor = this.alt;
    const ceil = getFloor({...this.zfxy, f: this.zfxy.f + 1});
    return (
      turfBooleanIntersects(geom, point) &&
      (typeof position.alt !== 'undefined' === true ?
        position.alt >= floor && position.alt < ceil
        :
        true
      )
    );
  }

  /** Calculates the polygon of this Space and returns a 2D GeoJSON Polygon. */
  toGeoJSON(): Polygon {
    const [nw, se] = getBBox(this.zfxy);
    return {
      type: 'Polygon',
      coordinates: [
        [
          [nw.lng, nw.lat],
          [nw.lng, se.lat],
          [se.lng, se.lat],
          [se.lng, nw.lat],
          [nw.lng, nw.lat],
        ],
      ],
    };
  }

  /** Calculates the 3D polygon of this Space and returns the vertices of that polygon. */
  vertices3d(): [number, number, number][] {
    const [nw, se] = getBBox(this.zfxy);
    const floor = getFloor(this.zfxy);
    const ceil = getFloor({...this.zfxy, f: this.zfxy.f + 1});
    return [
      [nw.lng, nw.lat, floor],
      [nw.lng, se.lat, floor],
      [se.lng, se.lat, floor],
      [se.lng, nw.lat, floor],
      [nw.lng, nw.lat, ceil],
      [nw.lng, se.lat, ceil],
      [se.lng, se.lat, ceil],
      [se.lng, nw.lat, ceil],
    ];
  }

  static getSpaceById(id: string, zoom?: number) {
    return new Space(id, zoom);
  }

  static getSpaceByLocation(loc: LngLatWithAltitude, zoom?: number) {
    return new Space(loc, zoom);
  }

  static getSpaceByZFXY(zfxyStr: string) {
    return new Space(zfxyStr);
  }

  /** Calculates the smallest spatial ID to fully contain the polygon. Currently only supports 2D polygons. */
  static boundingSpaceForGeometry(geom: Geometry, minZoom?: number): Space {
    minZoom = minZoom || 25;
    const bbox = turfBBox(geom);
    const largestTile = bboxToTile(bbox, minZoom);
    const [ x, y, z ] = largestTile;
    return new Space({x, y, z, f: 0});
  }

  /** Calculate an array of spaces that make up the polygon. Currently only supports 2D polygons. */
  static spacesForGeometry(geom: Geometry, zoom: number): Space[] {
    const z = zoom;

    if (z === 0) {
      // not recommended.
      return [new Space('0/0/0/0')];
    }

    if (geom.type === 'GeometryCollection') {
      throw new Error('GeometryCollection not supported');
    }

    // this can be optimized a lot!
    const bbox = turfBBox(geom),
          min = pointToTile(bbox[0], bbox[1], 32),
          max = pointToTile(bbox[2], bbox[3], 32),
          minX = (Math.min(min[0], max[0])) >>> (32 - z),
          minY = (Math.min(min[1], max[1])) >>> (32 - z),
          maxX = (Math.max(max[0], min[0]) >>> (32 - z)) + 1,
          maxY = (Math.max(max[1], min[1]) >>> (32 - z)) + 1,
          spaces: Space[] = [];

    // scanline polygon fill algorithm
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const space = new Space({x, y, z, f: 0});
        if (turfBooleanIntersects(geom, space.toGeoJSON())) {
          spaces.push(space);
        }
      }
    }
    return spaces;
  }

  private _regenerateAttributesFromZFXY() {
    this.alt = getFloor(this.zfxy);
    this.center = getCenterLngLatAlt(this.zfxy);
    this.zoom = this.zfxy.z;
    this.id = this.tilehash = generateTilehash(this.zfxy);
    this.zfxyStr = `/${this.zfxy.z}/${this.zfxy.f}/${this.zfxy.x}/${this.zfxy.y}`;
  }
}
