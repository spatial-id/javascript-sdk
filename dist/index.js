(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SpatialId = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    function isZFXYTile(tile) {
        return ('z' in tile && 'f' in tile && 'x' in tile && 'y' in tile);
    }
    var ZFXY_1M_ZOOM_BASE = 25;
    var ZFXY_ROOT_TILE = { f: 0, x: 0, y: 0, z: 0 };
    var rad2deg = 180 / Math.PI;
    function getParent(tile, steps) {
        if (steps === void 0) { steps = 1; }
        var f = tile.f, x = tile.x, y = tile.y, z = tile.z;
        if (steps <= 0) {
            throw new Error('steps must be greater than 0');
        }
        if (steps > z) {
            throw new Error("Getting parent tile of ".concat(tile, ", ").concat(steps, " steps is not possible because it would go beyond the root tile (z=0)"));
        }
        return {
            f: f >> steps,
            x: x >> steps,
            y: y >> steps,
            z: z - steps,
        };
    }
    function getChildren(tile) {
        if (tile === void 0) { tile = ZFXY_ROOT_TILE; }
        var f = tile.f, x = tile.x, y = tile.y, z = tile.z;
        return [
            { f: f * 2, x: x * 2, y: y * 2, z: z + 1 },
            { f: f * 2, x: x * 2 + 1, y: y * 2, z: z + 1 },
            { f: f * 2, x: x * 2, y: y * 2 + 1, z: z + 1 },
            { f: f * 2, x: x * 2 + 1, y: y * 2 + 1, z: z + 1 },
            { f: f * 2 + 1, x: x * 2, y: y * 2, z: z + 1 },
            { f: f * 2 + 1, x: x * 2 + 1, y: y * 2, z: z + 1 },
            { f: f * 2 + 1, x: x * 2, y: y * 2 + 1, z: z + 1 },
            { f: f * 2 + 1, x: x * 2 + 1, y: y * 2 + 1, z: z + 1 }, // f +1, x +1, y +1
        ];
    }
    function getSurrounding(tile) {
        if (tile === void 0) { tile = ZFXY_ROOT_TILE; }
        var f = tile.f, x = tile.x, y = tile.y, z = tile.z;
        return [
            zfxyWraparound({ f: f, x: x, y: y, z: z }),
            zfxyWraparound({ f: f, x: x + 1, y: y, z: z }),
            zfxyWraparound({ f: f, x: x, y: y + 1, z: z }),
            zfxyWraparound({ f: f, x: x + 1, y: y + 1, z: z }),
            zfxyWraparound({ f: f, x: x - 1, y: y, z: z }),
            zfxyWraparound({ f: f, x: x, y: y - 1, z: z }),
            zfxyWraparound({ f: f, x: x - 1, y: y - 1, z: z }),
            zfxyWraparound({ f: f, x: x + 1, y: y - 1, z: z }),
            zfxyWraparound({ f: f, x: x - 1, y: y + 1, z: z }), // f +0, x -1, y +1
        ];
    }
    function parseZFXYString(str) {
        var match = str.match(/^\/?(\d+)\/(?:(\d+)\/)?(\d+)\/(\d+)$/);
        if (!match) {
            return undefined;
        }
        return {
            z: parseInt(match[1], 10),
            f: parseInt(match[2] || '0', 10),
            x: parseInt(match[3], 10),
            y: parseInt(match[4], 10),
        };
    }
    /** Returns the lng,lat of the northwest corner of the provided tile */
    function getLngLat(tile) {
        var n = Math.PI - 2 * Math.PI * tile.y / Math.pow(2, tile.z);
        return {
            lng: tile.x / Math.pow(2, tile.z) * 360 - 180,
            lat: rad2deg * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))),
        };
    }
    function getCenterLngLat(tile) {
        var x = tile.x * 2 + 1, y = tile.y * 2 + 1, z = tile.z + 1;
        return getLngLat({ x: x, y: y, z: z, f: 0 });
    }
    function getCenterLngLatAlt(tile) {
        return __assign(__assign({}, getCenterLngLat(tile)), { alt: getFloor(tile) + ((Math.pow(2, ZFXY_1M_ZOOM_BASE)) / (Math.pow(2, (tile.z + 1)))) });
    }
    function getBBox(tile) {
        var nw = getLngLat(tile), se = getLngLat(__assign(__assign({}, tile), { y: tile.y + 1, x: tile.x + 1 }));
        return [nw, se];
    }
    /** Returns the floor of the voxel, in meters */
    function getFloor(tile) {
        return tile.f * (Math.pow(2, ZFXY_1M_ZOOM_BASE)) / (Math.pow(2, tile.z));
    }
    function calculateZFXY(input) {
        var meters = typeof input.alt !== 'undefined' ? input.alt : 0;
        if (meters <= -(Math.pow(2, ZFXY_1M_ZOOM_BASE)) || meters >= (Math.pow(2, ZFXY_1M_ZOOM_BASE))) {
            // TODO: make altitude unlimited?
            throw new Error("ZFXY only supports altitude between -2^".concat(ZFXY_1M_ZOOM_BASE, " and +2^").concat(ZFXY_1M_ZOOM_BASE, "."));
        }
        var f = Math.floor(((Math.pow(2, input.zoom)) * meters) / (Math.pow(2, ZFXY_1M_ZOOM_BASE)));
        // Algorithm adapted from tilebelt.js
        var d2r = Math.PI / 180;
        var sin = Math.sin(input.lat * d2r);
        var z2 = Math.pow(2, input.zoom);
        var x = z2 * (input.lng / 360 + 0.5);
        var y = z2 * (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);
        // Wrap Tile X
        x = x % z2;
        if (x < 0)
            x = x + z2;
        return {
            f: f,
            x: Math.floor(x),
            y: Math.floor(y),
            z: input.zoom,
        };
    }
    /**
     * Fix a tile that has out-of-bounds coordinates by:
     * for the x and y coordinates: wrapping the coordinates around.
     * for the f coordinate: limiting to maximum or minimum.
     */
    function zfxyWraparound(tile) {
        var z = tile.z, f = tile.f, x = tile.x, y = tile.y;
        return {
            z: z,
            f: Math.max(Math.min(f, (Math.pow(2, z))), -(Math.pow(2, z))),
            x: (x < 0) ? x + Math.pow(2, z) : x % Math.pow(2, z),
            y: (y < 0) ? y + Math.pow(2, z) : y % Math.pow(2, z),
        };
    }

    function parseZFXYTilehash(th) {
        var e_1, _a;
        var negativeF = false;
        if (th[0] === '-') {
            negativeF = true;
            th = th.substring(1);
        }
        var children = getChildren();
        var lastChild;
        try {
            for (var th_1 = __values(th), th_1_1 = th_1.next(); !th_1_1.done; th_1_1 = th_1.next()) {
                var c = th_1_1.value;
                lastChild = __assign({}, children[parseInt(c, 10) - 1]);
                children = getChildren(lastChild);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (th_1_1 && !th_1_1.done && (_a = th_1.return)) _a.call(th_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (negativeF) {
            lastChild.f = -lastChild.f;
        }
        return lastChild;
    }
    function generateTilehash(tile) {
        var f = tile.f, x = tile.x, y = tile.y, z = tile.z;
        var originalF = f;
        var out = '';
        while (z > 0) {
            var thisTile = { f: Math.abs(f), x: x, y: y, z: z };
            var parent_1 = getParent(thisTile);
            var childrenOfParent = getChildren(parent_1);
            var positionInParent = childrenOfParent.findIndex(function (child) { return child.f === Math.abs(f) && child.x === x && child.y === y && child.z === z; });
            out = (positionInParent + 1).toString() + out;
            f = parent_1.f;
            x = parent_1.x;
            y = parent_1.y;
            z = parent_1.z;
        }
        return (originalF < 0 ? '-' : '') + out;
    }

    /**
     * @module helpers
     */
    /**
     * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
     *
     * @name feature
     * @param {Geometry} geometry input geometry
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature} a GeoJSON Feature
     * @example
     * var geometry = {
     *   "type": "Point",
     *   "coordinates": [110, 50]
     * };
     *
     * var feature = turf.feature(geometry);
     *
     * //=feature
     */
    function feature(geom, properties, options) {
        if (options === void 0) { options = {}; }
        var feat = { type: "Feature" };
        if (options.id === 0 || options.id) {
            feat.id = options.id;
        }
        if (options.bbox) {
            feat.bbox = options.bbox;
        }
        feat.properties = properties || {};
        feat.geometry = geom;
        return feat;
    }
    /**
     * Creates a {@link Point} {@link Feature} from a Position.
     *
     * @name point
     * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<Point>} a Point feature
     * @example
     * var point = turf.point([-75.343, 39.984]);
     *
     * //=point
     */
    function point(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        if (!coordinates) {
            throw new Error("coordinates is required");
        }
        if (!Array.isArray(coordinates)) {
            throw new Error("coordinates must be an Array");
        }
        if (coordinates.length < 2) {
            throw new Error("coordinates must be at least 2 numbers long");
        }
        if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) {
            throw new Error("coordinates must contain numbers");
        }
        var geom = {
            type: "Point",
            coordinates: coordinates,
        };
        return feature(geom, properties, options);
    }
    /**
     * Creates a {@link LineString} {@link Feature} from an Array of Positions.
     *
     * @name lineString
     * @param {Array<Array<number>>} coordinates an array of Positions
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<LineString>} LineString Feature
     * @example
     * var linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
     * var linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
     *
     * //=linestring1
     * //=linestring2
     */
    function lineString(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        if (coordinates.length < 2) {
            throw new Error("coordinates must be an array of two or more positions");
        }
        var geom = {
            type: "LineString",
            coordinates: coordinates,
        };
        return feature(geom, properties, options);
    }
    /**
     * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
     *
     * @name featureCollection
     * @param {Feature[]} features input features
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {FeatureCollection} FeatureCollection of Features
     * @example
     * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
     * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
     * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
     *
     * var collection = turf.featureCollection([
     *   locationA,
     *   locationB,
     *   locationC
     * ]);
     *
     * //=collection
     */
    function featureCollection$1(features, options) {
        if (options === void 0) { options = {}; }
        var fc = { type: "FeatureCollection" };
        if (options.id) {
            fc.id = options.id;
        }
        if (options.bbox) {
            fc.bbox = options.bbox;
        }
        fc.features = features;
        return fc;
    }
    /**
     * Creates a {@link Feature<MultiLineString>} based on a
     * coordinate array. Properties can be added optionally.
     *
     * @name multiLineString
     * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<MultiLineString>} a MultiLineString feature
     * @throws {Error} if no coordinates are passed
     * @example
     * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
     *
     * //=multiLine
     */
    function multiLineString(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        var geom = {
            type: "MultiLineString",
            coordinates: coordinates,
        };
        return feature(geom, properties, options);
    }
    /**
     * isNumber
     *
     * @param {*} num Number to validate
     * @returns {boolean} true/false
     * @example
     * turf.isNumber(123)
     * //=true
     * turf.isNumber('foo')
     * //=false
     */
    function isNumber(num) {
        return !isNaN(num) && num !== null && !Array.isArray(num);
    }

    /**
     * Callback for coordEach
     *
     * @callback coordEachCallback
     * @param {Array<number>} currentCoord The current coordinate being processed.
     * @param {number} coordIndex The current index of the coordinate being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     * @param {number} geometryIndex The current index of the Geometry being processed.
     */

    /**
     * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
     *
     * @name coordEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, multiFeatureIndex)
     * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {"foo": "bar"}),
     *   turf.point([36, 53], {"hello": "world"})
     * ]);
     *
     * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
     *   //=currentCoord
     *   //=coordIndex
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     * });
     */
    function coordEach$1(geojson, callback, excludeWrapCoord) {
      // Handles null Geometry -- Skips this GeoJSON
      if (geojson === null) return;
      var j,
        k,
        l,
        geometry,
        stopG,
        coords,
        geometryMaybeCollection,
        wrapShrink = 0,
        coordIndex = 0,
        isGeometryCollection,
        type = geojson.type,
        isFeatureCollection = type === "FeatureCollection",
        isFeature = type === "Feature",
        stop = isFeatureCollection ? geojson.features.length : 1;

      // This logic may look a little weird. The reason why it is that way
      // is because it's trying to be fast. GeoJSON supports multiple kinds
      // of objects at its root: FeatureCollection, Features, Geometries.
      // This function has the responsibility of handling all of them, and that
      // means that some of the `for` loops you see below actually just don't apply
      // to certain inputs. For instance, if you give this just a
      // Point geometry, then both loops are short-circuited and all we do
      // is gradually rename the input until it's called 'geometry'.
      //
      // This also aims to allocate as few resources as possible: just a
      // few numbers and booleans, rather than any temporary arrays as would
      // be required with the normalization approach.
      for (var featureIndex = 0; featureIndex < stop; featureIndex++) {
        geometryMaybeCollection = isFeatureCollection
          ? geojson.features[featureIndex].geometry
          : isFeature
          ? geojson.geometry
          : geojson;
        isGeometryCollection = geometryMaybeCollection
          ? geometryMaybeCollection.type === "GeometryCollection"
          : false;
        stopG = isGeometryCollection
          ? geometryMaybeCollection.geometries.length
          : 1;

        for (var geomIndex = 0; geomIndex < stopG; geomIndex++) {
          var multiFeatureIndex = 0;
          var geometryIndex = 0;
          geometry = isGeometryCollection
            ? geometryMaybeCollection.geometries[geomIndex]
            : geometryMaybeCollection;

          // Handles null Geometry -- Skips this geometry
          if (geometry === null) continue;
          coords = geometry.coordinates;
          var geomType = geometry.type;

          wrapShrink =
            excludeWrapCoord &&
            (geomType === "Polygon" || geomType === "MultiPolygon")
              ? 1
              : 0;

          switch (geomType) {
            case null:
              break;
            case "Point":
              if (
                callback(
                  coords,
                  coordIndex,
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex
                ) === false
              )
                return false;
              coordIndex++;
              multiFeatureIndex++;
              break;
            case "LineString":
            case "MultiPoint":
              for (j = 0; j < coords.length; j++) {
                if (
                  callback(
                    coords[j],
                    coordIndex,
                    featureIndex,
                    multiFeatureIndex,
                    geometryIndex
                  ) === false
                )
                  return false;
                coordIndex++;
                if (geomType === "MultiPoint") multiFeatureIndex++;
              }
              if (geomType === "LineString") multiFeatureIndex++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (j = 0; j < coords.length; j++) {
                for (k = 0; k < coords[j].length - wrapShrink; k++) {
                  if (
                    callback(
                      coords[j][k],
                      coordIndex,
                      featureIndex,
                      multiFeatureIndex,
                      geometryIndex
                    ) === false
                  )
                    return false;
                  coordIndex++;
                }
                if (geomType === "MultiLineString") multiFeatureIndex++;
                if (geomType === "Polygon") geometryIndex++;
              }
              if (geomType === "Polygon") multiFeatureIndex++;
              break;
            case "MultiPolygon":
              for (j = 0; j < coords.length; j++) {
                geometryIndex = 0;
                for (k = 0; k < coords[j].length; k++) {
                  for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                    if (
                      callback(
                        coords[j][k][l],
                        coordIndex,
                        featureIndex,
                        multiFeatureIndex,
                        geometryIndex
                      ) === false
                    )
                      return false;
                    coordIndex++;
                  }
                  geometryIndex++;
                }
                multiFeatureIndex++;
              }
              break;
            case "GeometryCollection":
              for (j = 0; j < geometry.geometries.length; j++)
                if (
                  coordEach$1(geometry.geometries[j], callback, excludeWrapCoord) ===
                  false
                )
                  return false;
              break;
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
      }
    }

    /**
     * Callback for featureEach
     *
     * @callback featureEachCallback
     * @param {Feature<any>} currentFeature The current Feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Iterate over features in any GeoJSON object, similar to
     * Array.forEach.
     *
     * @name featureEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentFeature, featureIndex)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {foo: 'bar'}),
     *   turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.featureEach(features, function (currentFeature, featureIndex) {
     *   //=currentFeature
     *   //=featureIndex
     * });
     */
    function featureEach$2(geojson, callback) {
      if (geojson.type === "Feature") {
        callback(geojson, 0);
      } else if (geojson.type === "FeatureCollection") {
        for (var i = 0; i < geojson.features.length; i++) {
          if (callback(geojson.features[i], i) === false) break;
        }
      }
    }

    /**
     * Callback for geomEach
     *
     * @callback geomEachCallback
     * @param {Geometry} currentGeometry The current Geometry being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {Object} featureProperties The current Feature Properties being processed.
     * @param {Array<number>} featureBBox The current Feature BBox being processed.
     * @param {number|string} featureId The current Feature Id being processed.
     */

    /**
     * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
     *
     * @name geomEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.geomEach(features, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
     *   //=currentGeometry
     *   //=featureIndex
     *   //=featureProperties
     *   //=featureBBox
     *   //=featureId
     * });
     */
    function geomEach$1(geojson, callback) {
      var i,
        j,
        g,
        geometry,
        stopG,
        geometryMaybeCollection,
        isGeometryCollection,
        featureProperties,
        featureBBox,
        featureId,
        featureIndex = 0,
        isFeatureCollection = geojson.type === "FeatureCollection",
        isFeature = geojson.type === "Feature",
        stop = isFeatureCollection ? geojson.features.length : 1;

      // This logic may look a little weird. The reason why it is that way
      // is because it's trying to be fast. GeoJSON supports multiple kinds
      // of objects at its root: FeatureCollection, Features, Geometries.
      // This function has the responsibility of handling all of them, and that
      // means that some of the `for` loops you see below actually just don't apply
      // to certain inputs. For instance, if you give this just a
      // Point geometry, then both loops are short-circuited and all we do
      // is gradually rename the input until it's called 'geometry'.
      //
      // This also aims to allocate as few resources as possible: just a
      // few numbers and booleans, rather than any temporary arrays as would
      // be required with the normalization approach.
      for (i = 0; i < stop; i++) {
        geometryMaybeCollection = isFeatureCollection
          ? geojson.features[i].geometry
          : isFeature
          ? geojson.geometry
          : geojson;
        featureProperties = isFeatureCollection
          ? geojson.features[i].properties
          : isFeature
          ? geojson.properties
          : {};
        featureBBox = isFeatureCollection
          ? geojson.features[i].bbox
          : isFeature
          ? geojson.bbox
          : undefined;
        featureId = isFeatureCollection
          ? geojson.features[i].id
          : isFeature
          ? geojson.id
          : undefined;
        isGeometryCollection = geometryMaybeCollection
          ? geometryMaybeCollection.type === "GeometryCollection"
          : false;
        stopG = isGeometryCollection
          ? geometryMaybeCollection.geometries.length
          : 1;

        for (g = 0; g < stopG; g++) {
          geometry = isGeometryCollection
            ? geometryMaybeCollection.geometries[g]
            : geometryMaybeCollection;

          // Handle null Geometry
          if (geometry === null) {
            if (
              callback(
                null,
                featureIndex,
                featureProperties,
                featureBBox,
                featureId
              ) === false
            )
              return false;
            continue;
          }
          switch (geometry.type) {
            case "Point":
            case "LineString":
            case "MultiPoint":
            case "Polygon":
            case "MultiLineString":
            case "MultiPolygon": {
              if (
                callback(
                  geometry,
                  featureIndex,
                  featureProperties,
                  featureBBox,
                  featureId
                ) === false
              )
                return false;
              break;
            }
            case "GeometryCollection": {
              for (j = 0; j < geometry.geometries.length; j++) {
                if (
                  callback(
                    geometry.geometries[j],
                    featureIndex,
                    featureProperties,
                    featureBBox,
                    featureId
                  ) === false
                )
                  return false;
              }
              break;
            }
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
        // Only increase `featureIndex` per each feature
        featureIndex++;
      }
    }

    /**
     * Callback for flattenEach
     *
     * @callback flattenEachCallback
     * @param {Feature} currentFeature The current flattened feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     */

    /**
     * Iterate over flattened features in any GeoJSON object, similar to
     * Array.forEach.
     *
     * @name flattenEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentFeature, featureIndex, multiFeatureIndex)
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
     * ]);
     *
     * turf.flattenEach(features, function (currentFeature, featureIndex, multiFeatureIndex) {
     *   //=currentFeature
     *   //=featureIndex
     *   //=multiFeatureIndex
     * });
     */
    function flattenEach$1(geojson, callback) {
      geomEach$1(geojson, function (geometry, featureIndex, properties, bbox, id) {
        // Callback for single geometry
        var type = geometry === null ? null : geometry.type;
        switch (type) {
          case null:
          case "Point":
          case "LineString":
          case "Polygon":
            if (
              callback(
                feature(geometry, properties, { bbox: bbox, id: id }),
                featureIndex,
                0
              ) === false
            )
              return false;
            return;
        }

        var geomType;

        // Callback for multi-geometry
        switch (type) {
          case "MultiPoint":
            geomType = "Point";
            break;
          case "MultiLineString":
            geomType = "LineString";
            break;
          case "MultiPolygon":
            geomType = "Polygon";
            break;
        }

        for (
          var multiFeatureIndex = 0;
          multiFeatureIndex < geometry.coordinates.length;
          multiFeatureIndex++
        ) {
          var coordinate = geometry.coordinates[multiFeatureIndex];
          var geom = {
            type: geomType,
            coordinates: coordinate,
          };
          if (
            callback(feature(geom, properties), featureIndex, multiFeatureIndex) ===
            false
          )
            return false;
        }
      });
    }

    /**
     * Takes a set of features, calculates the bbox of all input features, and returns a bounding box.
     *
     * @name bbox
     * @param {GeoJSON} geojson any GeoJSON object
     * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
     * @example
     * var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]]);
     * var bbox = turf.bbox(line);
     * var bboxPolygon = turf.bboxPolygon(bbox);
     *
     * //addToMap
     * var addToMap = [line, bboxPolygon]
     */
    function bbox$2(geojson) {
        var result = [Infinity, Infinity, -Infinity, -Infinity];
        coordEach$1(geojson, function (coord) {
            if (result[0] > coord[0]) {
                result[0] = coord[0];
            }
            if (result[1] > coord[1]) {
                result[1] = coord[1];
            }
            if (result[2] < coord[0]) {
                result[2] = coord[0];
            }
            if (result[3] < coord[1]) {
                result[3] = coord[1];
            }
        });
        return result;
    }
    bbox$2["default"] = bbox$2;

    /**
     * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
     *
     * @name getCoord
     * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
     * @returns {Array<number>} coordinates
     * @example
     * var pt = turf.point([10, 10]);
     *
     * var coord = turf.getCoord(pt);
     * //= [10, 10]
     */
    function getCoord(coord) {
        if (!coord) {
            throw new Error("coord is required");
        }
        if (!Array.isArray(coord)) {
            if (coord.type === "Feature" &&
                coord.geometry !== null &&
                coord.geometry.type === "Point") {
                return coord.geometry.coordinates;
            }
            if (coord.type === "Point") {
                return coord.coordinates;
            }
        }
        if (Array.isArray(coord) &&
            coord.length >= 2 &&
            !Array.isArray(coord[0]) &&
            !Array.isArray(coord[1])) {
            return coord;
        }
        throw new Error("coord must be GeoJSON Point or an Array of numbers");
    }
    /**
     * Unwrap coordinates from a Feature, Geometry Object or an Array
     *
     * @name getCoords
     * @param {Array<any>|Geometry|Feature} coords Feature, Geometry Object or an Array
     * @returns {Array<any>} coordinates
     * @example
     * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
     *
     * var coords = turf.getCoords(poly);
     * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
     */
    function getCoords(coords) {
        if (Array.isArray(coords)) {
            return coords;
        }
        // Feature
        if (coords.type === "Feature") {
            if (coords.geometry !== null) {
                return coords.geometry.coordinates;
            }
        }
        else {
            // Geometry
            if (coords.coordinates) {
                return coords.coordinates;
            }
        }
        throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array");
    }
    /**
     * Get Geometry from Feature or Geometry Object
     *
     * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
     * @returns {Geometry|null} GeoJSON Geometry Object
     * @throws {Error} if geojson is not a Feature or Geometry Object
     * @example
     * var point = {
     *   "type": "Feature",
     *   "properties": {},
     *   "geometry": {
     *     "type": "Point",
     *     "coordinates": [110, 40]
     *   }
     * }
     * var geom = turf.getGeom(point)
     * //={"type": "Point", "coordinates": [110, 40]}
     */
    function getGeom(geojson) {
        if (geojson.type === "Feature") {
            return geojson.geometry;
        }
        return geojson;
    }

    // http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
    // modified from: https://github.com/substack/point-in-polygon/blob/master/index.js
    // which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    /**
     * Takes a {@link Point} and a {@link Polygon} or {@link MultiPolygon} and determines if the point
     * resides inside the polygon. The polygon can be convex or concave. The function accounts for holes.
     *
     * @name booleanPointInPolygon
     * @param {Coord} point input point
     * @param {Feature<Polygon|MultiPolygon>} polygon input polygon or multipolygon
     * @param {Object} [options={}] Optional parameters
     * @param {boolean} [options.ignoreBoundary=false] True if polygon boundary should be ignored when determining if
     * the point is inside the polygon otherwise false.
     * @returns {boolean} `true` if the Point is inside the Polygon; `false` if the Point is not inside the Polygon
     * @example
     * var pt = turf.point([-77, 44]);
     * var poly = turf.polygon([[
     *   [-81, 41],
     *   [-81, 47],
     *   [-72, 47],
     *   [-72, 41],
     *   [-81, 41]
     * ]]);
     *
     * turf.booleanPointInPolygon(pt, poly);
     * //= true
     */
    function booleanPointInPolygon(point, polygon, options) {
        if (options === void 0) { options = {}; }
        // validation
        if (!point) {
            throw new Error("point is required");
        }
        if (!polygon) {
            throw new Error("polygon is required");
        }
        var pt = getCoord(point);
        var geom = getGeom(polygon);
        var type = geom.type;
        var bbox = polygon.bbox;
        var polys = geom.coordinates;
        // Quick elimination if point is not inside bbox
        if (bbox && inBBox(pt, bbox) === false) {
            return false;
        }
        // normalize to multipolygon
        if (type === "Polygon") {
            polys = [polys];
        }
        var insidePoly = false;
        for (var i = 0; i < polys.length && !insidePoly; i++) {
            // check if it is in the outer ring first
            if (inRing(pt, polys[i][0], options.ignoreBoundary)) {
                var inHole = false;
                var k = 1;
                // check for the point in any of the holes
                while (k < polys[i].length && !inHole) {
                    if (inRing(pt, polys[i][k], !options.ignoreBoundary)) {
                        inHole = true;
                    }
                    k++;
                }
                if (!inHole) {
                    insidePoly = true;
                }
            }
        }
        return insidePoly;
    }
    /**
     * inRing
     *
     * @private
     * @param {Array<number>} pt [x,y]
     * @param {Array<Array<number>>} ring [[x,y], [x,y],..]
     * @param {boolean} ignoreBoundary ignoreBoundary
     * @returns {boolean} inRing
     */
    function inRing(pt, ring, ignoreBoundary) {
        var isInside = false;
        if (ring[0][0] === ring[ring.length - 1][0] &&
            ring[0][1] === ring[ring.length - 1][1]) {
            ring = ring.slice(0, ring.length - 1);
        }
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var xi = ring[i][0];
            var yi = ring[i][1];
            var xj = ring[j][0];
            var yj = ring[j][1];
            var onBoundary = pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0 &&
                (xi - pt[0]) * (xj - pt[0]) <= 0 &&
                (yi - pt[1]) * (yj - pt[1]) <= 0;
            if (onBoundary) {
                return !ignoreBoundary;
            }
            var intersect = yi > pt[1] !== yj > pt[1] &&
                pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi;
            if (intersect) {
                isInside = !isInside;
            }
        }
        return isInside;
    }
    /**
     * inBBox
     *
     * @private
     * @param {Position} pt point [x,y]
     * @param {BBox} bbox BBox [west, south, east, north]
     * @returns {boolean} true/false if point is inside BBox
     */
    function inBBox(pt, bbox) {
        return (bbox[0] <= pt[0] && bbox[1] <= pt[1] && bbox[2] >= pt[0] && bbox[3] >= pt[1]);
    }

    /**
     * Creates a {@link FeatureCollection} of 2-vertex {@link LineString} segments from a
     * {@link LineString|(Multi)LineString} or {@link Polygon|(Multi)Polygon}.
     *
     * @name lineSegment
     * @param {GeoJSON} geojson GeoJSON Polygon or LineString
     * @returns {FeatureCollection<LineString>} 2-vertex line segments
     * @example
     * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
     * var segments = turf.lineSegment(polygon);
     *
     * //addToMap
     * var addToMap = [polygon, segments]
     */
    function lineSegment(geojson) {
        if (!geojson) {
            throw new Error("geojson is required");
        }
        var results = [];
        flattenEach$1(geojson, function (feature) {
            lineSegmentFeature(feature, results);
        });
        return featureCollection$1(results);
    }
    /**
     * Line Segment
     *
     * @private
     * @param {Feature<LineString|Polygon>} geojson Line or polygon feature
     * @param {Array} results push to results
     * @returns {void}
     */
    function lineSegmentFeature(geojson, results) {
        var coords = [];
        var geometry = geojson.geometry;
        if (geometry !== null) {
            switch (geometry.type) {
                case "Polygon":
                    coords = getCoords(geometry);
                    break;
                case "LineString":
                    coords = [getCoords(geometry)];
            }
            coords.forEach(function (coord) {
                var segments = createSegments(coord, geojson.properties);
                segments.forEach(function (segment) {
                    segment.id = results.length;
                    results.push(segment);
                });
            });
        }
    }
    /**
     * Create Segments from LineString coordinates
     *
     * @private
     * @param {Array<Array<number>>} coords LineString coordinates
     * @param {*} properties GeoJSON properties
     * @returns {Array<Feature<LineString>>} line segments
     */
    function createSegments(coords, properties) {
        var segments = [];
        coords.reduce(function (previousCoords, currentCoords) {
            var segment = lineString([previousCoords, currentCoords], properties);
            segment.bbox = bbox$1(previousCoords, currentCoords);
            segments.push(segment);
            return currentCoords;
        });
        return segments;
    }
    /**
     * Create BBox between two coordinates (faster than @turf/bbox)
     *
     * @private
     * @param {Array<number>} coords1 Point coordinate
     * @param {Array<number>} coords2 Point coordinate
     * @returns {BBox} [west, south, east, north]
     */
    function bbox$1(coords1, coords2) {
        var x1 = coords1[0];
        var y1 = coords1[1];
        var x2 = coords2[0];
        var y2 = coords2[1];
        var west = x1 < x2 ? x1 : x2;
        var south = y1 < y2 ? y1 : y2;
        var east = x1 > x2 ? x1 : x2;
        var north = y1 > y2 ? y1 : y2;
        return [west, south, east, north];
    }

    var geojsonRbush$1 = {exports: {}};

    function quickselect(arr, k, left, right, compare) {
        quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
    }

    function quickselectStep(arr, k, left, right, compare) {

        while (right > left) {
            if (right - left > 600) {
                var n = right - left + 1;
                var m = k - left + 1;
                var z = Math.log(n);
                var s = 0.5 * Math.exp(2 * z / 3);
                var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
                var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
                var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
                quickselectStep(arr, k, newLeft, newRight, compare);
            }

            var t = arr[k];
            var i = left;
            var j = right;

            swap(arr, left, k);
            if (compare(arr[right], t) > 0) swap(arr, left, right);

            while (i < j) {
                swap(arr, i, j);
                i++;
                j--;
                while (compare(arr[i], t) < 0) i++;
                while (compare(arr[j], t) > 0) j--;
            }

            if (compare(arr[left], t) === 0) swap(arr, left, j);
            else {
                j++;
                swap(arr, j, right);
            }

            if (j <= k) left = j + 1;
            if (k <= j) right = j - 1;
        }
    }

    function swap(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    function defaultCompare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    class RBush {
        constructor(maxEntries = 9) {
            // max entries in a node is 9 by default; min node fill is 40% for best performance
            this._maxEntries = Math.max(4, maxEntries);
            this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
            this.clear();
        }

        all() {
            return this._all(this.data, []);
        }

        search(bbox) {
            let node = this.data;
            const result = [];

            if (!intersects$1(bbox, node)) return result;

            const toBBox = this.toBBox;
            const nodesToSearch = [];

            while (node) {
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childBBox = node.leaf ? toBBox(child) : child;

                    if (intersects$1(bbox, childBBox)) {
                        if (node.leaf) result.push(child);
                        else if (contains(bbox, childBBox)) this._all(child, result);
                        else nodesToSearch.push(child);
                    }
                }
                node = nodesToSearch.pop();
            }

            return result;
        }

        collides(bbox) {
            let node = this.data;

            if (!intersects$1(bbox, node)) return false;

            const nodesToSearch = [];
            while (node) {
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childBBox = node.leaf ? this.toBBox(child) : child;

                    if (intersects$1(bbox, childBBox)) {
                        if (node.leaf || contains(bbox, childBBox)) return true;
                        nodesToSearch.push(child);
                    }
                }
                node = nodesToSearch.pop();
            }

            return false;
        }

        load(data) {
            if (!(data && data.length)) return this;

            if (data.length < this._minEntries) {
                for (let i = 0; i < data.length; i++) {
                    this.insert(data[i]);
                }
                return this;
            }

            // recursively build the tree with the given data from scratch using OMT algorithm
            let node = this._build(data.slice(), 0, data.length - 1, 0);

            if (!this.data.children.length) {
                // save as is if tree is empty
                this.data = node;

            } else if (this.data.height === node.height) {
                // split root if trees have the same height
                this._splitRoot(this.data, node);

            } else {
                if (this.data.height < node.height) {
                    // swap trees if inserted one is bigger
                    const tmpNode = this.data;
                    this.data = node;
                    node = tmpNode;
                }

                // insert the small tree into the large tree at appropriate level
                this._insert(node, this.data.height - node.height - 1, true);
            }

            return this;
        }

        insert(item) {
            if (item) this._insert(item, this.data.height - 1);
            return this;
        }

        clear() {
            this.data = createNode([]);
            return this;
        }

        remove(item, equalsFn) {
            if (!item) return this;

            let node = this.data;
            const bbox = this.toBBox(item);
            const path = [];
            const indexes = [];
            let i, parent, goingUp;

            // depth-first iterative tree traversal
            while (node || path.length) {

                if (!node) { // go up
                    node = path.pop();
                    parent = path[path.length - 1];
                    i = indexes.pop();
                    goingUp = true;
                }

                if (node.leaf) { // check current node
                    const index = findItem(item, node.children, equalsFn);

                    if (index !== -1) {
                        // item found, remove the item and condense tree upwards
                        node.children.splice(index, 1);
                        path.push(node);
                        this._condense(path);
                        return this;
                    }
                }

                if (!goingUp && !node.leaf && contains(node, bbox)) { // go down
                    path.push(node);
                    indexes.push(i);
                    i = 0;
                    parent = node;
                    node = node.children[0];

                } else if (parent) { // go right
                    i++;
                    node = parent.children[i];
                    goingUp = false;

                } else node = null; // nothing found
            }

            return this;
        }

        toBBox(item) { return item; }

        compareMinX(a, b) { return a.minX - b.minX; }
        compareMinY(a, b) { return a.minY - b.minY; }

        toJSON() { return this.data; }

        fromJSON(data) {
            this.data = data;
            return this;
        }

        _all(node, result) {
            const nodesToSearch = [];
            while (node) {
                if (node.leaf) result.push(...node.children);
                else nodesToSearch.push(...node.children);

                node = nodesToSearch.pop();
            }
            return result;
        }

        _build(items, left, right, height) {

            const N = right - left + 1;
            let M = this._maxEntries;
            let node;

            if (N <= M) {
                // reached leaf level; return leaf
                node = createNode(items.slice(left, right + 1));
                calcBBox(node, this.toBBox);
                return node;
            }

            if (!height) {
                // target height of the bulk-loaded tree
                height = Math.ceil(Math.log(N) / Math.log(M));

                // target number of root entries to maximize storage utilization
                M = Math.ceil(N / Math.pow(M, height - 1));
            }

            node = createNode([]);
            node.leaf = false;
            node.height = height;

            // split the items into M mostly square tiles

            const N2 = Math.ceil(N / M);
            const N1 = N2 * Math.ceil(Math.sqrt(M));

            multiSelect(items, left, right, N1, this.compareMinX);

            for (let i = left; i <= right; i += N1) {

                const right2 = Math.min(i + N1 - 1, right);

                multiSelect(items, i, right2, N2, this.compareMinY);

                for (let j = i; j <= right2; j += N2) {

                    const right3 = Math.min(j + N2 - 1, right2);

                    // pack each entry recursively
                    node.children.push(this._build(items, j, right3, height - 1));
                }
            }

            calcBBox(node, this.toBBox);

            return node;
        }

        _chooseSubtree(bbox, node, level, path) {
            while (true) {
                path.push(node);

                if (node.leaf || path.length - 1 === level) break;

                let minArea = Infinity;
                let minEnlargement = Infinity;
                let targetNode;

                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const area = bboxArea(child);
                    const enlargement = enlargedArea(bbox, child) - area;

                    // choose entry with the least area enlargement
                    if (enlargement < minEnlargement) {
                        minEnlargement = enlargement;
                        minArea = area < minArea ? area : minArea;
                        targetNode = child;

                    } else if (enlargement === minEnlargement) {
                        // otherwise choose one with the smallest area
                        if (area < minArea) {
                            minArea = area;
                            targetNode = child;
                        }
                    }
                }

                node = targetNode || node.children[0];
            }

            return node;
        }

        _insert(item, level, isNode) {
            const bbox = isNode ? item : this.toBBox(item);
            const insertPath = [];

            // find the best node for accommodating the item, saving all nodes along the path too
            const node = this._chooseSubtree(bbox, this.data, level, insertPath);

            // put the item into the node
            node.children.push(item);
            extend(node, bbox);

            // split on node overflow; propagate upwards if necessary
            while (level >= 0) {
                if (insertPath[level].children.length > this._maxEntries) {
                    this._split(insertPath, level);
                    level--;
                } else break;
            }

            // adjust bboxes along the insertion path
            this._adjustParentBBoxes(bbox, insertPath, level);
        }

        // split overflowed node into two
        _split(insertPath, level) {
            const node = insertPath[level];
            const M = node.children.length;
            const m = this._minEntries;

            this._chooseSplitAxis(node, m, M);

            const splitIndex = this._chooseSplitIndex(node, m, M);

            const newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
            newNode.height = node.height;
            newNode.leaf = node.leaf;

            calcBBox(node, this.toBBox);
            calcBBox(newNode, this.toBBox);

            if (level) insertPath[level - 1].children.push(newNode);
            else this._splitRoot(node, newNode);
        }

        _splitRoot(node, newNode) {
            // split root node
            this.data = createNode([node, newNode]);
            this.data.height = node.height + 1;
            this.data.leaf = false;
            calcBBox(this.data, this.toBBox);
        }

        _chooseSplitIndex(node, m, M) {
            let index;
            let minOverlap = Infinity;
            let minArea = Infinity;

            for (let i = m; i <= M - m; i++) {
                const bbox1 = distBBox(node, 0, i, this.toBBox);
                const bbox2 = distBBox(node, i, M, this.toBBox);

                const overlap = intersectionArea(bbox1, bbox2);
                const area = bboxArea(bbox1) + bboxArea(bbox2);

                // choose distribution with minimum overlap
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    index = i;

                    minArea = area < minArea ? area : minArea;

                } else if (overlap === minOverlap) {
                    // otherwise choose distribution with minimum area
                    if (area < minArea) {
                        minArea = area;
                        index = i;
                    }
                }
            }

            return index || M - m;
        }

        // sorts node children by the best axis for split
        _chooseSplitAxis(node, m, M) {
            const compareMinX = node.leaf ? this.compareMinX : compareNodeMinX;
            const compareMinY = node.leaf ? this.compareMinY : compareNodeMinY;
            const xMargin = this._allDistMargin(node, m, M, compareMinX);
            const yMargin = this._allDistMargin(node, m, M, compareMinY);

            // if total distributions margin value is minimal for x, sort by minX,
            // otherwise it's already sorted by minY
            if (xMargin < yMargin) node.children.sort(compareMinX);
        }

        // total margin of all possible split distributions where each node is at least m full
        _allDistMargin(node, m, M, compare) {
            node.children.sort(compare);

            const toBBox = this.toBBox;
            const leftBBox = distBBox(node, 0, m, toBBox);
            const rightBBox = distBBox(node, M - m, M, toBBox);
            let margin = bboxMargin(leftBBox) + bboxMargin(rightBBox);

            for (let i = m; i < M - m; i++) {
                const child = node.children[i];
                extend(leftBBox, node.leaf ? toBBox(child) : child);
                margin += bboxMargin(leftBBox);
            }

            for (let i = M - m - 1; i >= m; i--) {
                const child = node.children[i];
                extend(rightBBox, node.leaf ? toBBox(child) : child);
                margin += bboxMargin(rightBBox);
            }

            return margin;
        }

        _adjustParentBBoxes(bbox, path, level) {
            // adjust bboxes along the given tree path
            for (let i = level; i >= 0; i--) {
                extend(path[i], bbox);
            }
        }

        _condense(path) {
            // go through the path, removing empty nodes and updating bboxes
            for (let i = path.length - 1, siblings; i >= 0; i--) {
                if (path[i].children.length === 0) {
                    if (i > 0) {
                        siblings = path[i - 1].children;
                        siblings.splice(siblings.indexOf(path[i]), 1);

                    } else this.clear();

                } else calcBBox(path[i], this.toBBox);
            }
        }
    }

    function findItem(item, items, equalsFn) {
        if (!equalsFn) return items.indexOf(item);

        for (let i = 0; i < items.length; i++) {
            if (equalsFn(item, items[i])) return i;
        }
        return -1;
    }

    // calculate node's bbox from bboxes of its children
    function calcBBox(node, toBBox) {
        distBBox(node, 0, node.children.length, toBBox, node);
    }

    // min bounding rectangle of node children from k to p-1
    function distBBox(node, k, p, toBBox, destNode) {
        if (!destNode) destNode = createNode(null);
        destNode.minX = Infinity;
        destNode.minY = Infinity;
        destNode.maxX = -Infinity;
        destNode.maxY = -Infinity;

        for (let i = k; i < p; i++) {
            const child = node.children[i];
            extend(destNode, node.leaf ? toBBox(child) : child);
        }

        return destNode;
    }

    function extend(a, b) {
        a.minX = Math.min(a.minX, b.minX);
        a.minY = Math.min(a.minY, b.minY);
        a.maxX = Math.max(a.maxX, b.maxX);
        a.maxY = Math.max(a.maxY, b.maxY);
        return a;
    }

    function compareNodeMinX(a, b) { return a.minX - b.minX; }
    function compareNodeMinY(a, b) { return a.minY - b.minY; }

    function bboxArea(a)   { return (a.maxX - a.minX) * (a.maxY - a.minY); }
    function bboxMargin(a) { return (a.maxX - a.minX) + (a.maxY - a.minY); }

    function enlargedArea(a, b) {
        return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
               (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY));
    }

    function intersectionArea(a, b) {
        const minX = Math.max(a.minX, b.minX);
        const minY = Math.max(a.minY, b.minY);
        const maxX = Math.min(a.maxX, b.maxX);
        const maxY = Math.min(a.maxY, b.maxY);

        return Math.max(0, maxX - minX) *
               Math.max(0, maxY - minY);
    }

    function contains(a, b) {
        return a.minX <= b.minX &&
               a.minY <= b.minY &&
               b.maxX <= a.maxX &&
               b.maxY <= a.maxY;
    }

    function intersects$1(a, b) {
        return b.minX <= a.maxX &&
               b.minY <= a.maxY &&
               b.maxX >= a.minX &&
               b.maxY >= a.minY;
    }

    function createNode(children) {
        return {
            children,
            height: 1,
            leaf: true,
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        };
    }

    // sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
    // combines selection algorithm with binary divide & conquer approach

    function multiSelect(arr, left, right, n, compare) {
        const stack = [left, right];

        while (stack.length) {
            right = stack.pop();
            left = stack.pop();

            if (right - left <= n) continue;

            const mid = left + Math.ceil((right - left) / n / 2) * n;
            quickselect(arr, mid, left, right, compare);

            stack.push(left, mid, mid, right);
        }
    }

    var js$2 = {};

    (function (exports) {
    	Object.defineProperty(exports, "__esModule", { value: true });
    	/**
    	 * @module helpers
    	 */
    	/**
    	 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
    	 *
    	 * @memberof helpers
    	 * @type {number}
    	 */
    	exports.earthRadius = 6371008.8;
    	/**
    	 * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
    	 *
    	 * @memberof helpers
    	 * @type {Object}
    	 */
    	exports.factors = {
    	    centimeters: exports.earthRadius * 100,
    	    centimetres: exports.earthRadius * 100,
    	    degrees: exports.earthRadius / 111325,
    	    feet: exports.earthRadius * 3.28084,
    	    inches: exports.earthRadius * 39.37,
    	    kilometers: exports.earthRadius / 1000,
    	    kilometres: exports.earthRadius / 1000,
    	    meters: exports.earthRadius,
    	    metres: exports.earthRadius,
    	    miles: exports.earthRadius / 1609.344,
    	    millimeters: exports.earthRadius * 1000,
    	    millimetres: exports.earthRadius * 1000,
    	    nauticalmiles: exports.earthRadius / 1852,
    	    radians: 1,
    	    yards: exports.earthRadius * 1.0936,
    	};
    	/**
    	 * Units of measurement factors based on 1 meter.
    	 *
    	 * @memberof helpers
    	 * @type {Object}
    	 */
    	exports.unitsFactors = {
    	    centimeters: 100,
    	    centimetres: 100,
    	    degrees: 1 / 111325,
    	    feet: 3.28084,
    	    inches: 39.37,
    	    kilometers: 1 / 1000,
    	    kilometres: 1 / 1000,
    	    meters: 1,
    	    metres: 1,
    	    miles: 1 / 1609.344,
    	    millimeters: 1000,
    	    millimetres: 1000,
    	    nauticalmiles: 1 / 1852,
    	    radians: 1 / exports.earthRadius,
    	    yards: 1.0936133,
    	};
    	/**
    	 * Area of measurement factors based on 1 square meter.
    	 *
    	 * @memberof helpers
    	 * @type {Object}
    	 */
    	exports.areaFactors = {
    	    acres: 0.000247105,
    	    centimeters: 10000,
    	    centimetres: 10000,
    	    feet: 10.763910417,
    	    hectares: 0.0001,
    	    inches: 1550.003100006,
    	    kilometers: 0.000001,
    	    kilometres: 0.000001,
    	    meters: 1,
    	    metres: 1,
    	    miles: 3.86e-7,
    	    millimeters: 1000000,
    	    millimetres: 1000000,
    	    yards: 1.195990046,
    	};
    	/**
    	 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
    	 *
    	 * @name feature
    	 * @param {Geometry} geometry input geometry
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the Feature
    	 * @returns {Feature} a GeoJSON Feature
    	 * @example
    	 * var geometry = {
    	 *   "type": "Point",
    	 *   "coordinates": [110, 50]
    	 * };
    	 *
    	 * var feature = turf.feature(geometry);
    	 *
    	 * //=feature
    	 */
    	function feature(geom, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    var feat = { type: "Feature" };
    	    if (options.id === 0 || options.id) {
    	        feat.id = options.id;
    	    }
    	    if (options.bbox) {
    	        feat.bbox = options.bbox;
    	    }
    	    feat.properties = properties || {};
    	    feat.geometry = geom;
    	    return feat;
    	}
    	exports.feature = feature;
    	/**
    	 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
    	 * For GeometryCollection type use `helpers.geometryCollection`
    	 *
    	 * @name geometry
    	 * @param {string} type Geometry Type
    	 * @param {Array<any>} coordinates Coordinates
    	 * @param {Object} [options={}] Optional Parameters
    	 * @returns {Geometry} a GeoJSON Geometry
    	 * @example
    	 * var type = "Point";
    	 * var coordinates = [110, 50];
    	 * var geometry = turf.geometry(type, coordinates);
    	 * // => geometry
    	 */
    	function geometry(type, coordinates, _options) {
    	    if (_options === void 0) { _options = {}; }
    	    switch (type) {
    	        case "Point":
    	            return point(coordinates).geometry;
    	        case "LineString":
    	            return lineString(coordinates).geometry;
    	        case "Polygon":
    	            return polygon(coordinates).geometry;
    	        case "MultiPoint":
    	            return multiPoint(coordinates).geometry;
    	        case "MultiLineString":
    	            return multiLineString(coordinates).geometry;
    	        case "MultiPolygon":
    	            return multiPolygon(coordinates).geometry;
    	        default:
    	            throw new Error(type + " is invalid");
    	    }
    	}
    	exports.geometry = geometry;
    	/**
    	 * Creates a {@link Point} {@link Feature} from a Position.
    	 *
    	 * @name point
    	 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the Feature
    	 * @returns {Feature<Point>} a Point feature
    	 * @example
    	 * var point = turf.point([-75.343, 39.984]);
    	 *
    	 * //=point
    	 */
    	function point(coordinates, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    if (!coordinates) {
    	        throw new Error("coordinates is required");
    	    }
    	    if (!Array.isArray(coordinates)) {
    	        throw new Error("coordinates must be an Array");
    	    }
    	    if (coordinates.length < 2) {
    	        throw new Error("coordinates must be at least 2 numbers long");
    	    }
    	    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) {
    	        throw new Error("coordinates must contain numbers");
    	    }
    	    var geom = {
    	        type: "Point",
    	        coordinates: coordinates,
    	    };
    	    return feature(geom, properties, options);
    	}
    	exports.point = point;
    	/**
    	 * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
    	 *
    	 * @name points
    	 * @param {Array<Array<number>>} coordinates an array of Points
    	 * @param {Object} [properties={}] Translate these properties to each Feature
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
    	 * associated with the FeatureCollection
    	 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
    	 * @returns {FeatureCollection<Point>} Point Feature
    	 * @example
    	 * var points = turf.points([
    	 *   [-75, 39],
    	 *   [-80, 45],
    	 *   [-78, 50]
    	 * ]);
    	 *
    	 * //=points
    	 */
    	function points(coordinates, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    return featureCollection(coordinates.map(function (coords) {
    	        return point(coords, properties);
    	    }), options);
    	}
    	exports.points = points;
    	/**
    	 * Creates a {@link Polygon} {@link Feature} from an Array of LinearRings.
    	 *
    	 * @name polygon
    	 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the Feature
    	 * @returns {Feature<Polygon>} Polygon Feature
    	 * @example
    	 * var polygon = turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
    	 *
    	 * //=polygon
    	 */
    	function polygon(coordinates, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
    	        var ring = coordinates_1[_i];
    	        if (ring.length < 4) {
    	            throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
    	        }
    	        for (var j = 0; j < ring[ring.length - 1].length; j++) {
    	            // Check if first point of Polygon contains two numbers
    	            if (ring[ring.length - 1][j] !== ring[0][j]) {
    	                throw new Error("First and last Position are not equivalent.");
    	            }
    	        }
    	    }
    	    var geom = {
    	        type: "Polygon",
    	        coordinates: coordinates,
    	    };
    	    return feature(geom, properties, options);
    	}
    	exports.polygon = polygon;
    	/**
    	 * Creates a {@link Polygon} {@link FeatureCollection} from an Array of Polygon coordinates.
    	 *
    	 * @name polygons
    	 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygon coordinates
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
    	 * @returns {FeatureCollection<Polygon>} Polygon FeatureCollection
    	 * @example
    	 * var polygons = turf.polygons([
    	 *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
    	 *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
    	 * ]);
    	 *
    	 * //=polygons
    	 */
    	function polygons(coordinates, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    return featureCollection(coordinates.map(function (coords) {
    	        return polygon(coords, properties);
    	    }), options);
    	}
    	exports.polygons = polygons;
    	/**
    	 * Creates a {@link LineString} {@link Feature} from an Array of Positions.
    	 *
    	 * @name lineString
    	 * @param {Array<Array<number>>} coordinates an array of Positions
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the Feature
    	 * @returns {Feature<LineString>} LineString Feature
    	 * @example
    	 * var linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
    	 * var linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
    	 *
    	 * //=linestring1
    	 * //=linestring2
    	 */
    	function lineString(coordinates, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    if (coordinates.length < 2) {
    	        throw new Error("coordinates must be an array of two or more positions");
    	    }
    	    var geom = {
    	        type: "LineString",
    	        coordinates: coordinates,
    	    };
    	    return feature(geom, properties, options);
    	}
    	exports.lineString = lineString;
    	/**
    	 * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
    	 *
    	 * @name lineStrings
    	 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
    	 * associated with the FeatureCollection
    	 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
    	 * @returns {FeatureCollection<LineString>} LineString FeatureCollection
    	 * @example
    	 * var linestrings = turf.lineStrings([
    	 *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
    	 *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
    	 * ]);
    	 *
    	 * //=linestrings
    	 */
    	function lineStrings(coordinates, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    return featureCollection(coordinates.map(function (coords) {
    	        return lineString(coords, properties);
    	    }), options);
    	}
    	exports.lineStrings = lineStrings;
    	/**
    	 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
    	 *
    	 * @name featureCollection
    	 * @param {Feature[]} features input features
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the Feature
    	 * @returns {FeatureCollection} FeatureCollection of Features
    	 * @example
    	 * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
    	 * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
    	 * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
    	 *
    	 * var collection = turf.featureCollection([
    	 *   locationA,
    	 *   locationB,
    	 *   locationC
    	 * ]);
    	 *
    	 * //=collection
    	 */
    	function featureCollection(features, options) {
    	    if (options === void 0) { options = {}; }
    	    var fc = { type: "FeatureCollection" };
    	    if (options.id) {
    	        fc.id = options.id;
    	    }
    	    if (options.bbox) {
    	        fc.bbox = options.bbox;
    	    }
    	    fc.features = features;
    	    return fc;
    	}
    	exports.featureCollection = featureCollection;
    	/**
    	 * Creates a {@link Feature<MultiLineString>} based on a
    	 * coordinate array. Properties can be added optionally.
    	 *
    	 * @name multiLineString
    	 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the Feature
    	 * @returns {Feature<MultiLineString>} a MultiLineString feature
    	 * @throws {Error} if no coordinates are passed
    	 * @example
    	 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
    	 *
    	 * //=multiLine
    	 */
    	function multiLineString(coordinates, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    var geom = {
    	        type: "MultiLineString",
    	        coordinates: coordinates,
    	    };
    	    return feature(geom, properties, options);
    	}
    	exports.multiLineString = multiLineString;
    	/**
    	 * Creates a {@link Feature<MultiPoint>} based on a
    	 * coordinate array. Properties can be added optionally.
    	 *
    	 * @name multiPoint
    	 * @param {Array<Array<number>>} coordinates an array of Positions
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the Feature
    	 * @returns {Feature<MultiPoint>} a MultiPoint feature
    	 * @throws {Error} if no coordinates are passed
    	 * @example
    	 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
    	 *
    	 * //=multiPt
    	 */
    	function multiPoint(coordinates, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    var geom = {
    	        type: "MultiPoint",
    	        coordinates: coordinates,
    	    };
    	    return feature(geom, properties, options);
    	}
    	exports.multiPoint = multiPoint;
    	/**
    	 * Creates a {@link Feature<MultiPolygon>} based on a
    	 * coordinate array. Properties can be added optionally.
    	 *
    	 * @name multiPolygon
    	 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the Feature
    	 * @returns {Feature<MultiPolygon>} a multipolygon feature
    	 * @throws {Error} if no coordinates are passed
    	 * @example
    	 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
    	 *
    	 * //=multiPoly
    	 *
    	 */
    	function multiPolygon(coordinates, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    var geom = {
    	        type: "MultiPolygon",
    	        coordinates: coordinates,
    	    };
    	    return feature(geom, properties, options);
    	}
    	exports.multiPolygon = multiPolygon;
    	/**
    	 * Creates a {@link Feature<GeometryCollection>} based on a
    	 * coordinate array. Properties can be added optionally.
    	 *
    	 * @name geometryCollection
    	 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
    	 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
    	 * @param {Object} [options={}] Optional Parameters
    	 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
    	 * @param {string|number} [options.id] Identifier associated with the Feature
    	 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
    	 * @example
    	 * var pt = turf.geometry("Point", [100, 0]);
    	 * var line = turf.geometry("LineString", [[101, 0], [102, 1]]);
    	 * var collection = turf.geometryCollection([pt, line]);
    	 *
    	 * // => collection
    	 */
    	function geometryCollection(geometries, properties, options) {
    	    if (options === void 0) { options = {}; }
    	    var geom = {
    	        type: "GeometryCollection",
    	        geometries: geometries,
    	    };
    	    return feature(geom, properties, options);
    	}
    	exports.geometryCollection = geometryCollection;
    	/**
    	 * Round number to precision
    	 *
    	 * @param {number} num Number
    	 * @param {number} [precision=0] Precision
    	 * @returns {number} rounded number
    	 * @example
    	 * turf.round(120.4321)
    	 * //=120
    	 *
    	 * turf.round(120.4321, 2)
    	 * //=120.43
    	 */
    	function round(num, precision) {
    	    if (precision === void 0) { precision = 0; }
    	    if (precision && !(precision >= 0)) {
    	        throw new Error("precision must be a positive number");
    	    }
    	    var multiplier = Math.pow(10, precision || 0);
    	    return Math.round(num * multiplier) / multiplier;
    	}
    	exports.round = round;
    	/**
    	 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
    	 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
    	 *
    	 * @name radiansToLength
    	 * @param {number} radians in radians across the sphere
    	 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
    	 * meters, kilometres, kilometers.
    	 * @returns {number} distance
    	 */
    	function radiansToLength(radians, units) {
    	    if (units === void 0) { units = "kilometers"; }
    	    var factor = exports.factors[units];
    	    if (!factor) {
    	        throw new Error(units + " units is invalid");
    	    }
    	    return radians * factor;
    	}
    	exports.radiansToLength = radiansToLength;
    	/**
    	 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
    	 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
    	 *
    	 * @name lengthToRadians
    	 * @param {number} distance in real units
    	 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
    	 * meters, kilometres, kilometers.
    	 * @returns {number} radians
    	 */
    	function lengthToRadians(distance, units) {
    	    if (units === void 0) { units = "kilometers"; }
    	    var factor = exports.factors[units];
    	    if (!factor) {
    	        throw new Error(units + " units is invalid");
    	    }
    	    return distance / factor;
    	}
    	exports.lengthToRadians = lengthToRadians;
    	/**
    	 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
    	 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
    	 *
    	 * @name lengthToDegrees
    	 * @param {number} distance in real units
    	 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
    	 * meters, kilometres, kilometers.
    	 * @returns {number} degrees
    	 */
    	function lengthToDegrees(distance, units) {
    	    return radiansToDegrees(lengthToRadians(distance, units));
    	}
    	exports.lengthToDegrees = lengthToDegrees;
    	/**
    	 * Converts any bearing angle from the north line direction (positive clockwise)
    	 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
    	 *
    	 * @name bearingToAzimuth
    	 * @param {number} bearing angle, between -180 and +180 degrees
    	 * @returns {number} angle between 0 and 360 degrees
    	 */
    	function bearingToAzimuth(bearing) {
    	    var angle = bearing % 360;
    	    if (angle < 0) {
    	        angle += 360;
    	    }
    	    return angle;
    	}
    	exports.bearingToAzimuth = bearingToAzimuth;
    	/**
    	 * Converts an angle in radians to degrees
    	 *
    	 * @name radiansToDegrees
    	 * @param {number} radians angle in radians
    	 * @returns {number} degrees between 0 and 360 degrees
    	 */
    	function radiansToDegrees(radians) {
    	    var degrees = radians % (2 * Math.PI);
    	    return (degrees * 180) / Math.PI;
    	}
    	exports.radiansToDegrees = radiansToDegrees;
    	/**
    	 * Converts an angle in degrees to radians
    	 *
    	 * @name degreesToRadians
    	 * @param {number} degrees angle between 0 and 360 degrees
    	 * @returns {number} angle in radians
    	 */
    	function degreesToRadians(degrees) {
    	    var radians = degrees % 360;
    	    return (radians * Math.PI) / 180;
    	}
    	exports.degreesToRadians = degreesToRadians;
    	/**
    	 * Converts a length to the requested unit.
    	 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
    	 *
    	 * @param {number} length to be converted
    	 * @param {Units} [originalUnit="kilometers"] of the length
    	 * @param {Units} [finalUnit="kilometers"] returned unit
    	 * @returns {number} the converted length
    	 */
    	function convertLength(length, originalUnit, finalUnit) {
    	    if (originalUnit === void 0) { originalUnit = "kilometers"; }
    	    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    	    if (!(length >= 0)) {
    	        throw new Error("length must be a positive number");
    	    }
    	    return radiansToLength(lengthToRadians(length, originalUnit), finalUnit);
    	}
    	exports.convertLength = convertLength;
    	/**
    	 * Converts a area to the requested unit.
    	 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeters, acres, miles, yards, feet, inches, hectares
    	 * @param {number} area to be converted
    	 * @param {Units} [originalUnit="meters"] of the distance
    	 * @param {Units} [finalUnit="kilometers"] returned unit
    	 * @returns {number} the converted area
    	 */
    	function convertArea(area, originalUnit, finalUnit) {
    	    if (originalUnit === void 0) { originalUnit = "meters"; }
    	    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    	    if (!(area >= 0)) {
    	        throw new Error("area must be a positive number");
    	    }
    	    var startFactor = exports.areaFactors[originalUnit];
    	    if (!startFactor) {
    	        throw new Error("invalid original units");
    	    }
    	    var finalFactor = exports.areaFactors[finalUnit];
    	    if (!finalFactor) {
    	        throw new Error("invalid final units");
    	    }
    	    return (area / startFactor) * finalFactor;
    	}
    	exports.convertArea = convertArea;
    	/**
    	 * isNumber
    	 *
    	 * @param {*} num Number to validate
    	 * @returns {boolean} true/false
    	 * @example
    	 * turf.isNumber(123)
    	 * //=true
    	 * turf.isNumber('foo')
    	 * //=false
    	 */
    	function isNumber(num) {
    	    return !isNaN(num) && num !== null && !Array.isArray(num);
    	}
    	exports.isNumber = isNumber;
    	/**
    	 * isObject
    	 *
    	 * @param {*} input variable to validate
    	 * @returns {boolean} true/false
    	 * @example
    	 * turf.isObject({elevation: 10})
    	 * //=true
    	 * turf.isObject('foo')
    	 * //=false
    	 */
    	function isObject(input) {
    	    return !!input && input.constructor === Object;
    	}
    	exports.isObject = isObject;
    	/**
    	 * Validate BBox
    	 *
    	 * @private
    	 * @param {Array<number>} bbox BBox to validate
    	 * @returns {void}
    	 * @throws Error if BBox is not valid
    	 * @example
    	 * validateBBox([-180, -40, 110, 50])
    	 * //=OK
    	 * validateBBox([-180, -40])
    	 * //=Error
    	 * validateBBox('Foo')
    	 * //=Error
    	 * validateBBox(5)
    	 * //=Error
    	 * validateBBox(null)
    	 * //=Error
    	 * validateBBox(undefined)
    	 * //=Error
    	 */
    	function validateBBox(bbox) {
    	    if (!bbox) {
    	        throw new Error("bbox is required");
    	    }
    	    if (!Array.isArray(bbox)) {
    	        throw new Error("bbox must be an Array");
    	    }
    	    if (bbox.length !== 4 && bbox.length !== 6) {
    	        throw new Error("bbox must be an Array of 4 or 6 numbers");
    	    }
    	    bbox.forEach(function (num) {
    	        if (!isNumber(num)) {
    	            throw new Error("bbox must only contain numbers");
    	        }
    	    });
    	}
    	exports.validateBBox = validateBBox;
    	/**
    	 * Validate Id
    	 *
    	 * @private
    	 * @param {string|number} id Id to validate
    	 * @returns {void}
    	 * @throws Error if Id is not valid
    	 * @example
    	 * validateId([-180, -40, 110, 50])
    	 * //=Error
    	 * validateId([-180, -40])
    	 * //=Error
    	 * validateId('Foo')
    	 * //=OK
    	 * validateId(5)
    	 * //=OK
    	 * validateId(null)
    	 * //=Error
    	 * validateId(undefined)
    	 * //=Error
    	 */
    	function validateId(id) {
    	    if (!id) {
    	        throw new Error("id is required");
    	    }
    	    if (["string", "number"].indexOf(typeof id) === -1) {
    	        throw new Error("id must be a number or a string");
    	    }
    	}
    	exports.validateId = validateId;
    } (js$2));

    var js$1 = {};

    Object.defineProperty(js$1, '__esModule', { value: true });

    var helpers$1 = js$2;

    /**
     * Callback for coordEach
     *
     * @callback coordEachCallback
     * @param {Array<number>} currentCoord The current coordinate being processed.
     * @param {number} coordIndex The current index of the coordinate being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     * @param {number} geometryIndex The current index of the Geometry being processed.
     */

    /**
     * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
     *
     * @name coordEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, multiFeatureIndex)
     * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {"foo": "bar"}),
     *   turf.point([36, 53], {"hello": "world"})
     * ]);
     *
     * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
     *   //=currentCoord
     *   //=coordIndex
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     * });
     */
    function coordEach(geojson, callback, excludeWrapCoord) {
      // Handles null Geometry -- Skips this GeoJSON
      if (geojson === null) return;
      var j,
        k,
        l,
        geometry,
        stopG,
        coords,
        geometryMaybeCollection,
        wrapShrink = 0,
        coordIndex = 0,
        isGeometryCollection,
        type = geojson.type,
        isFeatureCollection = type === "FeatureCollection",
        isFeature = type === "Feature",
        stop = isFeatureCollection ? geojson.features.length : 1;

      // This logic may look a little weird. The reason why it is that way
      // is because it's trying to be fast. GeoJSON supports multiple kinds
      // of objects at its root: FeatureCollection, Features, Geometries.
      // This function has the responsibility of handling all of them, and that
      // means that some of the `for` loops you see below actually just don't apply
      // to certain inputs. For instance, if you give this just a
      // Point geometry, then both loops are short-circuited and all we do
      // is gradually rename the input until it's called 'geometry'.
      //
      // This also aims to allocate as few resources as possible: just a
      // few numbers and booleans, rather than any temporary arrays as would
      // be required with the normalization approach.
      for (var featureIndex = 0; featureIndex < stop; featureIndex++) {
        geometryMaybeCollection = isFeatureCollection
          ? geojson.features[featureIndex].geometry
          : isFeature
          ? geojson.geometry
          : geojson;
        isGeometryCollection = geometryMaybeCollection
          ? geometryMaybeCollection.type === "GeometryCollection"
          : false;
        stopG = isGeometryCollection
          ? geometryMaybeCollection.geometries.length
          : 1;

        for (var geomIndex = 0; geomIndex < stopG; geomIndex++) {
          var multiFeatureIndex = 0;
          var geometryIndex = 0;
          geometry = isGeometryCollection
            ? geometryMaybeCollection.geometries[geomIndex]
            : geometryMaybeCollection;

          // Handles null Geometry -- Skips this geometry
          if (geometry === null) continue;
          coords = geometry.coordinates;
          var geomType = geometry.type;

          wrapShrink =
            excludeWrapCoord &&
            (geomType === "Polygon" || geomType === "MultiPolygon")
              ? 1
              : 0;

          switch (geomType) {
            case null:
              break;
            case "Point":
              if (
                callback(
                  coords,
                  coordIndex,
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex
                ) === false
              )
                return false;
              coordIndex++;
              multiFeatureIndex++;
              break;
            case "LineString":
            case "MultiPoint":
              for (j = 0; j < coords.length; j++) {
                if (
                  callback(
                    coords[j],
                    coordIndex,
                    featureIndex,
                    multiFeatureIndex,
                    geometryIndex
                  ) === false
                )
                  return false;
                coordIndex++;
                if (geomType === "MultiPoint") multiFeatureIndex++;
              }
              if (geomType === "LineString") multiFeatureIndex++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (j = 0; j < coords.length; j++) {
                for (k = 0; k < coords[j].length - wrapShrink; k++) {
                  if (
                    callback(
                      coords[j][k],
                      coordIndex,
                      featureIndex,
                      multiFeatureIndex,
                      geometryIndex
                    ) === false
                  )
                    return false;
                  coordIndex++;
                }
                if (geomType === "MultiLineString") multiFeatureIndex++;
                if (geomType === "Polygon") geometryIndex++;
              }
              if (geomType === "Polygon") multiFeatureIndex++;
              break;
            case "MultiPolygon":
              for (j = 0; j < coords.length; j++) {
                geometryIndex = 0;
                for (k = 0; k < coords[j].length; k++) {
                  for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                    if (
                      callback(
                        coords[j][k][l],
                        coordIndex,
                        featureIndex,
                        multiFeatureIndex,
                        geometryIndex
                      ) === false
                    )
                      return false;
                    coordIndex++;
                  }
                  geometryIndex++;
                }
                multiFeatureIndex++;
              }
              break;
            case "GeometryCollection":
              for (j = 0; j < geometry.geometries.length; j++)
                if (
                  coordEach(geometry.geometries[j], callback, excludeWrapCoord) ===
                  false
                )
                  return false;
              break;
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
      }
    }

    /**
     * Callback for coordReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback coordReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Array<number>} currentCoord The current coordinate being processed.
     * @param {number} coordIndex The current index of the coordinate being processed.
     * Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     * @param {number} geometryIndex The current index of the Geometry being processed.
     */

    /**
     * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
     *
     * @name coordReduce
     * @param {FeatureCollection|Geometry|Feature} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentCoord, coordIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {"foo": "bar"}),
     *   turf.point([36, 53], {"hello": "world"})
     * ]);
     *
     * turf.coordReduce(features, function (previousValue, currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
     *   //=previousValue
     *   //=currentCoord
     *   //=coordIndex
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     *   return currentCoord;
     * });
     */
    function coordReduce(geojson, callback, initialValue, excludeWrapCoord) {
      var previousValue = initialValue;
      coordEach(
        geojson,
        function (
          currentCoord,
          coordIndex,
          featureIndex,
          multiFeatureIndex,
          geometryIndex
        ) {
          if (coordIndex === 0 && initialValue === undefined)
            previousValue = currentCoord;
          else
            previousValue = callback(
              previousValue,
              currentCoord,
              coordIndex,
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            );
        },
        excludeWrapCoord
      );
      return previousValue;
    }

    /**
     * Callback for propEach
     *
     * @callback propEachCallback
     * @param {Object} currentProperties The current Properties being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Iterate over properties in any GeoJSON object, similar to Array.forEach()
     *
     * @name propEach
     * @param {FeatureCollection|Feature} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentProperties, featureIndex)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.propEach(features, function (currentProperties, featureIndex) {
     *   //=currentProperties
     *   //=featureIndex
     * });
     */
    function propEach(geojson, callback) {
      var i;
      switch (geojson.type) {
        case "FeatureCollection":
          for (i = 0; i < geojson.features.length; i++) {
            if (callback(geojson.features[i].properties, i) === false) break;
          }
          break;
        case "Feature":
          callback(geojson.properties, 0);
          break;
      }
    }

    /**
     * Callback for propReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback propReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {*} currentProperties The current Properties being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Reduce properties in any GeoJSON object into a single value,
     * similar to how Array.reduce works. However, in this case we lazily run
     * the reduction, so an array of all properties is unnecessary.
     *
     * @name propReduce
     * @param {FeatureCollection|Feature} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentProperties, featureIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.propReduce(features, function (previousValue, currentProperties, featureIndex) {
     *   //=previousValue
     *   //=currentProperties
     *   //=featureIndex
     *   return currentProperties
     * });
     */
    function propReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      propEach(geojson, function (currentProperties, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined)
          previousValue = currentProperties;
        else
          previousValue = callback(previousValue, currentProperties, featureIndex);
      });
      return previousValue;
    }

    /**
     * Callback for featureEach
     *
     * @callback featureEachCallback
     * @param {Feature<any>} currentFeature The current Feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Iterate over features in any GeoJSON object, similar to
     * Array.forEach.
     *
     * @name featureEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentFeature, featureIndex)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {foo: 'bar'}),
     *   turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.featureEach(features, function (currentFeature, featureIndex) {
     *   //=currentFeature
     *   //=featureIndex
     * });
     */
    function featureEach$1(geojson, callback) {
      if (geojson.type === "Feature") {
        callback(geojson, 0);
      } else if (geojson.type === "FeatureCollection") {
        for (var i = 0; i < geojson.features.length; i++) {
          if (callback(geojson.features[i], i) === false) break;
        }
      }
    }

    /**
     * Callback for featureReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback featureReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Feature} currentFeature The current Feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Reduce features in any GeoJSON object, similar to Array.reduce().
     *
     * @name featureReduce
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {"foo": "bar"}),
     *   turf.point([36, 53], {"hello": "world"})
     * ]);
     *
     * turf.featureReduce(features, function (previousValue, currentFeature, featureIndex) {
     *   //=previousValue
     *   //=currentFeature
     *   //=featureIndex
     *   return currentFeature
     * });
     */
    function featureReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      featureEach$1(geojson, function (currentFeature, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined)
          previousValue = currentFeature;
        else previousValue = callback(previousValue, currentFeature, featureIndex);
      });
      return previousValue;
    }

    /**
     * Get all coordinates from any GeoJSON object.
     *
     * @name coordAll
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @returns {Array<Array<number>>} coordinate position array
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {foo: 'bar'}),
     *   turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * var coords = turf.coordAll(features);
     * //= [[26, 37], [36, 53]]
     */
    function coordAll(geojson) {
      var coords = [];
      coordEach(geojson, function (coord) {
        coords.push(coord);
      });
      return coords;
    }

    /**
     * Callback for geomEach
     *
     * @callback geomEachCallback
     * @param {Geometry} currentGeometry The current Geometry being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {Object} featureProperties The current Feature Properties being processed.
     * @param {Array<number>} featureBBox The current Feature BBox being processed.
     * @param {number|string} featureId The current Feature Id being processed.
     */

    /**
     * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
     *
     * @name geomEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.geomEach(features, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
     *   //=currentGeometry
     *   //=featureIndex
     *   //=featureProperties
     *   //=featureBBox
     *   //=featureId
     * });
     */
    function geomEach(geojson, callback) {
      var i,
        j,
        g,
        geometry,
        stopG,
        geometryMaybeCollection,
        isGeometryCollection,
        featureProperties,
        featureBBox,
        featureId,
        featureIndex = 0,
        isFeatureCollection = geojson.type === "FeatureCollection",
        isFeature = geojson.type === "Feature",
        stop = isFeatureCollection ? geojson.features.length : 1;

      // This logic may look a little weird. The reason why it is that way
      // is because it's trying to be fast. GeoJSON supports multiple kinds
      // of objects at its root: FeatureCollection, Features, Geometries.
      // This function has the responsibility of handling all of them, and that
      // means that some of the `for` loops you see below actually just don't apply
      // to certain inputs. For instance, if you give this just a
      // Point geometry, then both loops are short-circuited and all we do
      // is gradually rename the input until it's called 'geometry'.
      //
      // This also aims to allocate as few resources as possible: just a
      // few numbers and booleans, rather than any temporary arrays as would
      // be required with the normalization approach.
      for (i = 0; i < stop; i++) {
        geometryMaybeCollection = isFeatureCollection
          ? geojson.features[i].geometry
          : isFeature
          ? geojson.geometry
          : geojson;
        featureProperties = isFeatureCollection
          ? geojson.features[i].properties
          : isFeature
          ? geojson.properties
          : {};
        featureBBox = isFeatureCollection
          ? geojson.features[i].bbox
          : isFeature
          ? geojson.bbox
          : undefined;
        featureId = isFeatureCollection
          ? geojson.features[i].id
          : isFeature
          ? geojson.id
          : undefined;
        isGeometryCollection = geometryMaybeCollection
          ? geometryMaybeCollection.type === "GeometryCollection"
          : false;
        stopG = isGeometryCollection
          ? geometryMaybeCollection.geometries.length
          : 1;

        for (g = 0; g < stopG; g++) {
          geometry = isGeometryCollection
            ? geometryMaybeCollection.geometries[g]
            : geometryMaybeCollection;

          // Handle null Geometry
          if (geometry === null) {
            if (
              callback(
                null,
                featureIndex,
                featureProperties,
                featureBBox,
                featureId
              ) === false
            )
              return false;
            continue;
          }
          switch (geometry.type) {
            case "Point":
            case "LineString":
            case "MultiPoint":
            case "Polygon":
            case "MultiLineString":
            case "MultiPolygon": {
              if (
                callback(
                  geometry,
                  featureIndex,
                  featureProperties,
                  featureBBox,
                  featureId
                ) === false
              )
                return false;
              break;
            }
            case "GeometryCollection": {
              for (j = 0; j < geometry.geometries.length; j++) {
                if (
                  callback(
                    geometry.geometries[j],
                    featureIndex,
                    featureProperties,
                    featureBBox,
                    featureId
                  ) === false
                )
                  return false;
              }
              break;
            }
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
        // Only increase `featureIndex` per each feature
        featureIndex++;
      }
    }

    /**
     * Callback for geomReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback geomReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Geometry} currentGeometry The current Geometry being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {Object} featureProperties The current Feature Properties being processed.
     * @param {Array<number>} featureBBox The current Feature BBox being processed.
     * @param {number|string} featureId The current Feature Id being processed.
     */

    /**
     * Reduce geometry in any GeoJSON object, similar to Array.reduce().
     *
     * @name geomReduce
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.geomReduce(features, function (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
     *   //=previousValue
     *   //=currentGeometry
     *   //=featureIndex
     *   //=featureProperties
     *   //=featureBBox
     *   //=featureId
     *   return currentGeometry
     * });
     */
    function geomReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      geomEach(
        geojson,
        function (
          currentGeometry,
          featureIndex,
          featureProperties,
          featureBBox,
          featureId
        ) {
          if (featureIndex === 0 && initialValue === undefined)
            previousValue = currentGeometry;
          else
            previousValue = callback(
              previousValue,
              currentGeometry,
              featureIndex,
              featureProperties,
              featureBBox,
              featureId
            );
        }
      );
      return previousValue;
    }

    /**
     * Callback for flattenEach
     *
     * @callback flattenEachCallback
     * @param {Feature} currentFeature The current flattened feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     */

    /**
     * Iterate over flattened features in any GeoJSON object, similar to
     * Array.forEach.
     *
     * @name flattenEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentFeature, featureIndex, multiFeatureIndex)
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
     * ]);
     *
     * turf.flattenEach(features, function (currentFeature, featureIndex, multiFeatureIndex) {
     *   //=currentFeature
     *   //=featureIndex
     *   //=multiFeatureIndex
     * });
     */
    function flattenEach(geojson, callback) {
      geomEach(geojson, function (geometry, featureIndex, properties, bbox, id) {
        // Callback for single geometry
        var type = geometry === null ? null : geometry.type;
        switch (type) {
          case null:
          case "Point":
          case "LineString":
          case "Polygon":
            if (
              callback(
                helpers$1.feature(geometry, properties, { bbox: bbox, id: id }),
                featureIndex,
                0
              ) === false
            )
              return false;
            return;
        }

        var geomType;

        // Callback for multi-geometry
        switch (type) {
          case "MultiPoint":
            geomType = "Point";
            break;
          case "MultiLineString":
            geomType = "LineString";
            break;
          case "MultiPolygon":
            geomType = "Polygon";
            break;
        }

        for (
          var multiFeatureIndex = 0;
          multiFeatureIndex < geometry.coordinates.length;
          multiFeatureIndex++
        ) {
          var coordinate = geometry.coordinates[multiFeatureIndex];
          var geom = {
            type: geomType,
            coordinates: coordinate,
          };
          if (
            callback(helpers$1.feature(geom, properties), featureIndex, multiFeatureIndex) ===
            false
          )
            return false;
        }
      });
    }

    /**
     * Callback for flattenReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback flattenReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Feature} currentFeature The current Feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     */

    /**
     * Reduce flattened features in any GeoJSON object, similar to Array.reduce().
     *
     * @name flattenReduce
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex, multiFeatureIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
     * ]);
     *
     * turf.flattenReduce(features, function (previousValue, currentFeature, featureIndex, multiFeatureIndex) {
     *   //=previousValue
     *   //=currentFeature
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   return currentFeature
     * });
     */
    function flattenReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      flattenEach(
        geojson,
        function (currentFeature, featureIndex, multiFeatureIndex) {
          if (
            featureIndex === 0 &&
            multiFeatureIndex === 0 &&
            initialValue === undefined
          )
            previousValue = currentFeature;
          else
            previousValue = callback(
              previousValue,
              currentFeature,
              featureIndex,
              multiFeatureIndex
            );
        }
      );
      return previousValue;
    }

    /**
     * Callback for segmentEach
     *
     * @callback segmentEachCallback
     * @param {Feature<LineString>} currentSegment The current Segment being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     * @param {number} geometryIndex The current index of the Geometry being processed.
     * @param {number} segmentIndex The current index of the Segment being processed.
     * @returns {void}
     */

    /**
     * Iterate over 2-vertex line segment in any GeoJSON object, similar to Array.forEach()
     * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
     *
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
     * @param {Function} callback a method that takes (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex)
     * @returns {void}
     * @example
     * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
     *
     * // Iterate over GeoJSON by 2-vertex segments
     * turf.segmentEach(polygon, function (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
     *   //=currentSegment
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     *   //=segmentIndex
     * });
     *
     * // Calculate the total number of segments
     * var total = 0;
     * turf.segmentEach(polygon, function () {
     *     total++;
     * });
     */
    function segmentEach(geojson, callback) {
      flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
        var segmentIndex = 0;

        // Exclude null Geometries
        if (!feature.geometry) return;
        // (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
        var type = feature.geometry.type;
        if (type === "Point" || type === "MultiPoint") return;

        // Generate 2-vertex line segments
        var previousCoords;
        var previousFeatureIndex = 0;
        var previousMultiIndex = 0;
        var prevGeomIndex = 0;
        if (
          coordEach(
            feature,
            function (
              currentCoord,
              coordIndex,
              featureIndexCoord,
              multiPartIndexCoord,
              geometryIndex
            ) {
              // Simulating a meta.coordReduce() since `reduce` operations cannot be stopped by returning `false`
              if (
                previousCoords === undefined ||
                featureIndex > previousFeatureIndex ||
                multiPartIndexCoord > previousMultiIndex ||
                geometryIndex > prevGeomIndex
              ) {
                previousCoords = currentCoord;
                previousFeatureIndex = featureIndex;
                previousMultiIndex = multiPartIndexCoord;
                prevGeomIndex = geometryIndex;
                segmentIndex = 0;
                return;
              }
              var currentSegment = helpers$1.lineString(
                [previousCoords, currentCoord],
                feature.properties
              );
              if (
                callback(
                  currentSegment,
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex,
                  segmentIndex
                ) === false
              )
                return false;
              segmentIndex++;
              previousCoords = currentCoord;
            }
          ) === false
        )
          return false;
      });
    }

    /**
     * Callback for segmentReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback segmentReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Feature<LineString>} currentSegment The current Segment being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     * @param {number} geometryIndex The current index of the Geometry being processed.
     * @param {number} segmentIndex The current index of the Segment being processed.
     */

    /**
     * Reduce 2-vertex line segment in any GeoJSON object, similar to Array.reduce()
     * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
     *
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
     * @param {Function} callback a method that takes (previousValue, currentSegment, currentIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {void}
     * @example
     * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
     *
     * // Iterate over GeoJSON by 2-vertex segments
     * turf.segmentReduce(polygon, function (previousSegment, currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
     *   //= previousSegment
     *   //= currentSegment
     *   //= featureIndex
     *   //= multiFeatureIndex
     *   //= geometryIndex
     *   //= segmentIndex
     *   return currentSegment
     * });
     *
     * // Calculate the total number of segments
     * var initialValue = 0
     * var total = turf.segmentReduce(polygon, function (previousValue) {
     *     previousValue++;
     *     return previousValue;
     * }, initialValue);
     */
    function segmentReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      var started = false;
      segmentEach(
        geojson,
        function (
          currentSegment,
          featureIndex,
          multiFeatureIndex,
          geometryIndex,
          segmentIndex
        ) {
          if (started === false && initialValue === undefined)
            previousValue = currentSegment;
          else
            previousValue = callback(
              previousValue,
              currentSegment,
              featureIndex,
              multiFeatureIndex,
              geometryIndex,
              segmentIndex
            );
          started = true;
        }
      );
      return previousValue;
    }

    /**
     * Callback for lineEach
     *
     * @callback lineEachCallback
     * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed
     * @param {number} featureIndex The current index of the Feature being processed
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
     * @param {number} geometryIndex The current index of the Geometry being processed
     */

    /**
     * Iterate over line or ring coordinates in LineString, Polygon, MultiLineString, MultiPolygon Features or Geometries,
     * similar to Array.forEach.
     *
     * @name lineEach
     * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
     * @param {Function} callback a method that takes (currentLine, featureIndex, multiFeatureIndex, geometryIndex)
     * @example
     * var multiLine = turf.multiLineString([
     *   [[26, 37], [35, 45]],
     *   [[36, 53], [38, 50], [41, 55]]
     * ]);
     *
     * turf.lineEach(multiLine, function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
     *   //=currentLine
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     * });
     */
    function lineEach(geojson, callback) {
      // validation
      if (!geojson) throw new Error("geojson is required");

      flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
        if (feature.geometry === null) return;
        var type = feature.geometry.type;
        var coords = feature.geometry.coordinates;
        switch (type) {
          case "LineString":
            if (callback(feature, featureIndex, multiFeatureIndex, 0, 0) === false)
              return false;
            break;
          case "Polygon":
            for (
              var geometryIndex = 0;
              geometryIndex < coords.length;
              geometryIndex++
            ) {
              if (
                callback(
                  helpers$1.lineString(coords[geometryIndex], feature.properties),
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex
                ) === false
              )
                return false;
            }
            break;
        }
      });
    }

    /**
     * Callback for lineReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback lineReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
     * @param {number} featureIndex The current index of the Feature being processed
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
     * @param {number} geometryIndex The current index of the Geometry being processed
     */

    /**
     * Reduce features in any GeoJSON object, similar to Array.reduce().
     *
     * @name lineReduce
     * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
     * @param {Function} callback a method that takes (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var multiPoly = turf.multiPolygon([
     *   turf.polygon([[[12,48],[2,41],[24,38],[12,48]], [[9,44],[13,41],[13,45],[9,44]]]),
     *   turf.polygon([[[5, 5], [0, 0], [2, 2], [4, 4], [5, 5]]])
     * ]);
     *
     * turf.lineReduce(multiPoly, function (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
     *   //=previousValue
     *   //=currentLine
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     *   return currentLine
     * });
     */
    function lineReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      lineEach(
        geojson,
        function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
          if (featureIndex === 0 && initialValue === undefined)
            previousValue = currentLine;
          else
            previousValue = callback(
              previousValue,
              currentLine,
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            );
        }
      );
      return previousValue;
    }

    /**
     * Finds a particular 2-vertex LineString Segment from a GeoJSON using `@turf/meta` indexes.
     *
     * Negative indexes are permitted.
     * Point & MultiPoint will always return null.
     *
     * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
     * @param {Object} [options={}] Optional parameters
     * @param {number} [options.featureIndex=0] Feature Index
     * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
     * @param {number} [options.geometryIndex=0] Geometry Index
     * @param {number} [options.segmentIndex=0] Segment Index
     * @param {Object} [options.properties={}] Translate Properties to output LineString
     * @param {BBox} [options.bbox={}] Translate BBox to output LineString
     * @param {number|string} [options.id={}] Translate Id to output LineString
     * @returns {Feature<LineString>} 2-vertex GeoJSON Feature LineString
     * @example
     * var multiLine = turf.multiLineString([
     *     [[10, 10], [50, 30], [30, 40]],
     *     [[-10, -10], [-50, -30], [-30, -40]]
     * ]);
     *
     * // First Segment (defaults are 0)
     * turf.findSegment(multiLine);
     * // => Feature<LineString<[[10, 10], [50, 30]]>>
     *
     * // First Segment of 2nd Multi Feature
     * turf.findSegment(multiLine, {multiFeatureIndex: 1});
     * // => Feature<LineString<[[-10, -10], [-50, -30]]>>
     *
     * // Last Segment of Last Multi Feature
     * turf.findSegment(multiLine, {multiFeatureIndex: -1, segmentIndex: -1});
     * // => Feature<LineString<[[-50, -30], [-30, -40]]>>
     */
    function findSegment(geojson, options) {
      // Optional Parameters
      options = options || {};
      if (!helpers$1.isObject(options)) throw new Error("options is invalid");
      var featureIndex = options.featureIndex || 0;
      var multiFeatureIndex = options.multiFeatureIndex || 0;
      var geometryIndex = options.geometryIndex || 0;
      var segmentIndex = options.segmentIndex || 0;

      // Find FeatureIndex
      var properties = options.properties;
      var geometry;

      switch (geojson.type) {
        case "FeatureCollection":
          if (featureIndex < 0)
            featureIndex = geojson.features.length + featureIndex;
          properties = properties || geojson.features[featureIndex].properties;
          geometry = geojson.features[featureIndex].geometry;
          break;
        case "Feature":
          properties = properties || geojson.properties;
          geometry = geojson.geometry;
          break;
        case "Point":
        case "MultiPoint":
          return null;
        case "LineString":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon":
          geometry = geojson;
          break;
        default:
          throw new Error("geojson is invalid");
      }

      // Find SegmentIndex
      if (geometry === null) return null;
      var coords = geometry.coordinates;
      switch (geometry.type) {
        case "Point":
        case "MultiPoint":
          return null;
        case "LineString":
          if (segmentIndex < 0) segmentIndex = coords.length + segmentIndex - 1;
          return helpers$1.lineString(
            [coords[segmentIndex], coords[segmentIndex + 1]],
            properties,
            options
          );
        case "Polygon":
          if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
          if (segmentIndex < 0)
            segmentIndex = coords[geometryIndex].length + segmentIndex - 1;
          return helpers$1.lineString(
            [
              coords[geometryIndex][segmentIndex],
              coords[geometryIndex][segmentIndex + 1],
            ],
            properties,
            options
          );
        case "MultiLineString":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          if (segmentIndex < 0)
            segmentIndex = coords[multiFeatureIndex].length + segmentIndex - 1;
          return helpers$1.lineString(
            [
              coords[multiFeatureIndex][segmentIndex],
              coords[multiFeatureIndex][segmentIndex + 1],
            ],
            properties,
            options
          );
        case "MultiPolygon":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          if (geometryIndex < 0)
            geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
          if (segmentIndex < 0)
            segmentIndex =
              coords[multiFeatureIndex][geometryIndex].length - segmentIndex - 1;
          return helpers$1.lineString(
            [
              coords[multiFeatureIndex][geometryIndex][segmentIndex],
              coords[multiFeatureIndex][geometryIndex][segmentIndex + 1],
            ],
            properties,
            options
          );
      }
      throw new Error("geojson is invalid");
    }

    /**
     * Finds a particular Point from a GeoJSON using `@turf/meta` indexes.
     *
     * Negative indexes are permitted.
     *
     * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
     * @param {Object} [options={}] Optional parameters
     * @param {number} [options.featureIndex=0] Feature Index
     * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
     * @param {number} [options.geometryIndex=0] Geometry Index
     * @param {number} [options.coordIndex=0] Coord Index
     * @param {Object} [options.properties={}] Translate Properties to output Point
     * @param {BBox} [options.bbox={}] Translate BBox to output Point
     * @param {number|string} [options.id={}] Translate Id to output Point
     * @returns {Feature<Point>} 2-vertex GeoJSON Feature Point
     * @example
     * var multiLine = turf.multiLineString([
     *     [[10, 10], [50, 30], [30, 40]],
     *     [[-10, -10], [-50, -30], [-30, -40]]
     * ]);
     *
     * // First Segment (defaults are 0)
     * turf.findPoint(multiLine);
     * // => Feature<Point<[10, 10]>>
     *
     * // First Segment of the 2nd Multi-Feature
     * turf.findPoint(multiLine, {multiFeatureIndex: 1});
     * // => Feature<Point<[-10, -10]>>
     *
     * // Last Segment of last Multi-Feature
     * turf.findPoint(multiLine, {multiFeatureIndex: -1, coordIndex: -1});
     * // => Feature<Point<[-30, -40]>>
     */
    function findPoint(geojson, options) {
      // Optional Parameters
      options = options || {};
      if (!helpers$1.isObject(options)) throw new Error("options is invalid");
      var featureIndex = options.featureIndex || 0;
      var multiFeatureIndex = options.multiFeatureIndex || 0;
      var geometryIndex = options.geometryIndex || 0;
      var coordIndex = options.coordIndex || 0;

      // Find FeatureIndex
      var properties = options.properties;
      var geometry;

      switch (geojson.type) {
        case "FeatureCollection":
          if (featureIndex < 0)
            featureIndex = geojson.features.length + featureIndex;
          properties = properties || geojson.features[featureIndex].properties;
          geometry = geojson.features[featureIndex].geometry;
          break;
        case "Feature":
          properties = properties || geojson.properties;
          geometry = geojson.geometry;
          break;
        case "Point":
        case "MultiPoint":
          return null;
        case "LineString":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon":
          geometry = geojson;
          break;
        default:
          throw new Error("geojson is invalid");
      }

      // Find Coord Index
      if (geometry === null) return null;
      var coords = geometry.coordinates;
      switch (geometry.type) {
        case "Point":
          return helpers$1.point(coords, properties, options);
        case "MultiPoint":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          return helpers$1.point(coords[multiFeatureIndex], properties, options);
        case "LineString":
          if (coordIndex < 0) coordIndex = coords.length + coordIndex;
          return helpers$1.point(coords[coordIndex], properties, options);
        case "Polygon":
          if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
          if (coordIndex < 0)
            coordIndex = coords[geometryIndex].length + coordIndex;
          return helpers$1.point(coords[geometryIndex][coordIndex], properties, options);
        case "MultiLineString":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          if (coordIndex < 0)
            coordIndex = coords[multiFeatureIndex].length + coordIndex;
          return helpers$1.point(coords[multiFeatureIndex][coordIndex], properties, options);
        case "MultiPolygon":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          if (geometryIndex < 0)
            geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
          if (coordIndex < 0)
            coordIndex =
              coords[multiFeatureIndex][geometryIndex].length - coordIndex;
          return helpers$1.point(
            coords[multiFeatureIndex][geometryIndex][coordIndex],
            properties,
            options
          );
      }
      throw new Error("geojson is invalid");
    }

    js$1.coordAll = coordAll;
    js$1.coordEach = coordEach;
    js$1.coordReduce = coordReduce;
    js$1.featureEach = featureEach$1;
    js$1.featureReduce = featureReduce;
    js$1.findPoint = findPoint;
    js$1.findSegment = findSegment;
    js$1.flattenEach = flattenEach;
    js$1.flattenReduce = flattenReduce;
    js$1.geomEach = geomEach;
    js$1.geomReduce = geomReduce;
    js$1.lineEach = lineEach;
    js$1.lineReduce = lineReduce;
    js$1.propEach = propEach;
    js$1.propReduce = propReduce;
    js$1.segmentEach = segmentEach;
    js$1.segmentReduce = segmentReduce;

    var js = {};

    Object.defineProperty(js, "__esModule", { value: true });
    var meta_1 = js$1;
    /**
     * Takes a set of features, calculates the bbox of all input features, and returns a bounding box.
     *
     * @name bbox
     * @param {GeoJSON} geojson any GeoJSON object
     * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
     * @example
     * var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]]);
     * var bbox = turf.bbox(line);
     * var bboxPolygon = turf.bboxPolygon(bbox);
     *
     * //addToMap
     * var addToMap = [line, bboxPolygon]
     */
    function bbox(geojson) {
        var result = [Infinity, Infinity, -Infinity, -Infinity];
        meta_1.coordEach(geojson, function (coord) {
            if (result[0] > coord[0]) {
                result[0] = coord[0];
            }
            if (result[1] > coord[1]) {
                result[1] = coord[1];
            }
            if (result[2] < coord[0]) {
                result[2] = coord[0];
            }
            if (result[3] < coord[1]) {
                result[3] = coord[1];
            }
        });
        return result;
    }
    bbox["default"] = bbox;
    js.default = bbox;

    var rbush = RBush;
    var helpers = js$2;
    var meta = js$1;
    var turfBBox = js.default;
    var featureEach = meta.featureEach;
    meta.coordEach;
    helpers.polygon;
    var featureCollection = helpers.featureCollection;

    /**
     * GeoJSON implementation of [RBush](https://github.com/mourner/rbush#rbush) spatial index.
     *
     * @name rbush
     * @param {number} [maxEntries=9] defines the maximum number of entries in a tree node. 9 (used by default) is a
     * reasonable choice for most applications. Higher value means faster insertion and slower search, and vice versa.
     * @returns {RBush} GeoJSON RBush
     * @example
     * var geojsonRbush = require('geojson-rbush').default;
     * var tree = geojsonRbush();
     */
    function geojsonRbush(maxEntries) {
        var tree = new rbush(maxEntries);
        /**
         * [insert](https://github.com/mourner/rbush#data-format)
         *
         * @param {Feature} feature insert single GeoJSON Feature
         * @returns {RBush} GeoJSON RBush
         * @example
         * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
         * tree.insert(poly)
         */
        tree.insert = function (feature) {
            if (feature.type !== 'Feature') throw new Error('invalid feature');
            feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
            return rbush.prototype.insert.call(this, feature);
        };

        /**
         * [load](https://github.com/mourner/rbush#bulk-inserting-data)
         *
         * @param {FeatureCollection|Array<Feature>} features load entire GeoJSON FeatureCollection
         * @returns {RBush} GeoJSON RBush
         * @example
         * var polys = turf.polygons([
         *     [[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]],
         *     [[[-93, 32], [-83, 32], [-83, 39], [-93, 39], [-93, 32]]]
         * ]);
         * tree.load(polys);
         */
        tree.load = function (features) {
            var load = [];
            // Load an Array of Features
            if (Array.isArray(features)) {
                features.forEach(function (feature) {
                    if (feature.type !== 'Feature') throw new Error('invalid features');
                    feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
                    load.push(feature);
                });
            } else {
                // Load a FeatureCollection
                featureEach(features, function (feature) {
                    if (feature.type !== 'Feature') throw new Error('invalid features');
                    feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
                    load.push(feature);
                });
            }
            return rbush.prototype.load.call(this, load);
        };

        /**
         * [remove](https://github.com/mourner/rbush#removing-data)
         *
         * @param {Feature} feature remove single GeoJSON Feature
         * @param {Function} equals Pass a custom equals function to compare by value for removal.
         * @returns {RBush} GeoJSON RBush
         * @example
         * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
         *
         * tree.remove(poly);
         */
        tree.remove = function (feature, equals) {
            if (feature.type !== 'Feature') throw new Error('invalid feature');
            feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
            return rbush.prototype.remove.call(this, feature, equals);
        };

        /**
         * [clear](https://github.com/mourner/rbush#removing-data)
         *
         * @returns {RBush} GeoJSON Rbush
         * @example
         * tree.clear()
         */
        tree.clear = function () {
            return rbush.prototype.clear.call(this);
        };

        /**
         * [search](https://github.com/mourner/rbush#search)
         *
         * @param {BBox|FeatureCollection|Feature} geojson search with GeoJSON
         * @returns {FeatureCollection} all features that intersects with the given GeoJSON.
         * @example
         * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
         *
         * tree.search(poly);
         */
        tree.search = function (geojson) {
            var features = rbush.prototype.search.call(this, this.toBBox(geojson));
            return featureCollection(features);
        };

        /**
         * [collides](https://github.com/mourner/rbush#collisions)
         *
         * @param {BBox|FeatureCollection|Feature} geojson collides with GeoJSON
         * @returns {boolean} true if there are any items intersecting the given GeoJSON, otherwise false.
         * @example
         * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
         *
         * tree.collides(poly);
         */
        tree.collides = function (geojson) {
            return rbush.prototype.collides.call(this, this.toBBox(geojson));
        };

        /**
         * [all](https://github.com/mourner/rbush#search)
         *
         * @returns {FeatureCollection} all the features in RBush
         * @example
         * tree.all()
         */
        tree.all = function () {
            var features = rbush.prototype.all.call(this);
            return featureCollection(features);
        };

        /**
         * [toJSON](https://github.com/mourner/rbush#export-and-import)
         *
         * @returns {any} export data as JSON object
         * @example
         * var exported = tree.toJSON()
         */
        tree.toJSON = function () {
            return rbush.prototype.toJSON.call(this);
        };

        /**
         * [fromJSON](https://github.com/mourner/rbush#export-and-import)
         *
         * @param {any} json import previously exported data
         * @returns {RBush} GeoJSON RBush
         * @example
         * var exported = {
         *   "children": [
         *     {
         *       "type": "Feature",
         *       "geometry": {
         *         "type": "Point",
         *         "coordinates": [110, 50]
         *       },
         *       "properties": {},
         *       "bbox": [110, 50, 110, 50]
         *     }
         *   ],
         *   "height": 1,
         *   "leaf": true,
         *   "minX": 110,
         *   "minY": 50,
         *   "maxX": 110,
         *   "maxY": 50
         * }
         * tree.fromJSON(exported)
         */
        tree.fromJSON = function (json) {
            return rbush.prototype.fromJSON.call(this, json);
        };

        /**
         * Converts GeoJSON to {minX, minY, maxX, maxY} schema
         *
         * @private
         * @param {BBox|FeatureCollection|Feature} geojson feature(s) to retrieve BBox from
         * @returns {Object} converted to {minX, minY, maxX, maxY}
         */
        tree.toBBox = function (geojson) {
            var bbox;
            if (geojson.bbox) bbox = geojson.bbox;
            else if (Array.isArray(geojson) && geojson.length === 4) bbox = geojson;
            else if (Array.isArray(geojson) && geojson.length === 6) bbox = [geojson[0], geojson[1], geojson[3], geojson[4]];
            else if (geojson.type === 'Feature') bbox = turfBBox(geojson);
            else if (geojson.type === 'FeatureCollection') bbox = turfBBox(geojson);
            else throw new Error('invalid geojson')

            return {
                minX: bbox[0],
                minY: bbox[1],
                maxX: bbox[2],
                maxY: bbox[3]
            };
        };
        return tree;
    }

    geojsonRbush$1.exports = geojsonRbush;
    geojsonRbush$1.exports.default = geojsonRbush;

    /**
     * Takes any LineString or Polygon GeoJSON and returns the intersecting point(s).
     *
     * @name lineIntersect
     * @param {GeoJSON} line1 any LineString or Polygon
     * @param {GeoJSON} line2 any LineString or Polygon
     * @returns {FeatureCollection<Point>} point(s) that intersect both
     * @example
     * var line1 = turf.lineString([[126, -11], [129, -21]]);
     * var line2 = turf.lineString([[123, -18], [131, -14]]);
     * var intersects = turf.lineIntersect(line1, line2);
     *
     * //addToMap
     * var addToMap = [line1, line2, intersects]
     */
    function lineIntersect(line1, line2) {
        var unique = {};
        var results = [];
        // First, normalize geometries to features
        // Then, handle simple 2-vertex segments
        if (line1.type === "LineString") {
            line1 = feature(line1);
        }
        if (line2.type === "LineString") {
            line2 = feature(line2);
        }
        if (line1.type === "Feature" &&
            line2.type === "Feature" &&
            line1.geometry !== null &&
            line2.geometry !== null &&
            line1.geometry.type === "LineString" &&
            line2.geometry.type === "LineString" &&
            line1.geometry.coordinates.length === 2 &&
            line2.geometry.coordinates.length === 2) {
            var intersect = intersects(line1, line2);
            if (intersect) {
                results.push(intersect);
            }
            return featureCollection$1(results);
        }
        // Handles complex GeoJSON Geometries
        var tree = geojsonRbush$1.exports();
        tree.load(lineSegment(line2));
        featureEach$2(lineSegment(line1), function (segment) {
            featureEach$2(tree.search(segment), function (match) {
                var intersect = intersects(segment, match);
                if (intersect) {
                    // prevent duplicate points https://github.com/Turfjs/turf/issues/688
                    var key = getCoords(intersect).join(",");
                    if (!unique[key]) {
                        unique[key] = true;
                        results.push(intersect);
                    }
                }
            });
        });
        return featureCollection$1(results);
    }
    /**
     * Find a point that intersects LineStrings with two coordinates each
     *
     * @private
     * @param {Feature<LineString>} line1 GeoJSON LineString (Must only contain 2 coordinates)
     * @param {Feature<LineString>} line2 GeoJSON LineString (Must only contain 2 coordinates)
     * @returns {Feature<Point>} intersecting GeoJSON Point
     */
    function intersects(line1, line2) {
        var coords1 = getCoords(line1);
        var coords2 = getCoords(line2);
        if (coords1.length !== 2) {
            throw new Error("<intersects> line1 must only contain 2 coordinates");
        }
        if (coords2.length !== 2) {
            throw new Error("<intersects> line2 must only contain 2 coordinates");
        }
        var x1 = coords1[0][0];
        var y1 = coords1[0][1];
        var x2 = coords1[1][0];
        var y2 = coords1[1][1];
        var x3 = coords2[0][0];
        var y3 = coords2[0][1];
        var x4 = coords2[1][0];
        var y4 = coords2[1][1];
        var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        var numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
        var numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
        if (denom === 0) {
            if (numeA === 0 && numeB === 0) {
                return null;
            }
            return null;
        }
        var uA = numeA / denom;
        var uB = numeB / denom;
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            var x = x1 + uA * (x2 - x1);
            var y = y1 + uA * (y2 - y1);
            return point([x, y]);
        }
        return null;
    }

    /**
     * Converts a {@link Polygon} to {@link LineString|(Multi)LineString} or {@link MultiPolygon} to a
     * {@link FeatureCollection} of {@link LineString|(Multi)LineString}.
     *
     * @name polygonToLine
     * @param {Feature<Polygon|MultiPolygon>} poly Feature to convert
     * @param {Object} [options={}] Optional parameters
     * @param {Object} [options.properties={}] translates GeoJSON properties to Feature
     * @returns {FeatureCollection|Feature<LineString|MultiLinestring>} converted (Multi)Polygon to (Multi)LineString
     * @example
     * var poly = turf.polygon([[[125, -30], [145, -30], [145, -20], [125, -20], [125, -30]]]);
     *
     * var line = turf.polygonToLine(poly);
     *
     * //addToMap
     * var addToMap = [line];
     */
    function polygonToLine (poly, options) {
        if (options === void 0) { options = {}; }
        var geom = getGeom(poly);
        if (!options.properties && poly.type === "Feature") {
            options.properties = poly.properties;
        }
        switch (geom.type) {
            case "Polygon":
                return polygonToLine$1(geom, options);
            case "MultiPolygon":
                return multiPolygonToLine(geom, options);
            default:
                throw new Error("invalid poly");
        }
    }
    /**
     * @private
     */
    function polygonToLine$1(poly, options) {
        if (options === void 0) { options = {}; }
        var geom = getGeom(poly);
        var coords = geom.coordinates;
        var properties = options.properties
            ? options.properties
            : poly.type === "Feature"
                ? poly.properties
                : {};
        return coordsToLine(coords, properties);
    }
    /**
     * @private
     */
    function multiPolygonToLine(multiPoly, options) {
        if (options === void 0) { options = {}; }
        var geom = getGeom(multiPoly);
        var coords = geom.coordinates;
        var properties = options.properties
            ? options.properties
            : multiPoly.type === "Feature"
                ? multiPoly.properties
                : {};
        var lines = [];
        coords.forEach(function (coord) {
            lines.push(coordsToLine(coord, properties));
        });
        return featureCollection$1(lines);
    }
    /**
     * @private
     */
    function coordsToLine(coords, properties) {
        if (coords.length > 1) {
            return multiLineString(coords, properties);
        }
        return lineString(coords[0], properties);
    }

    /**
     * Boolean-disjoint returns (TRUE) if the intersection of the two geometries is an empty set.
     *
     * @name booleanDisjoint
     * @param {Geometry|Feature<any>} feature1 GeoJSON Feature or Geometry
     * @param {Geometry|Feature<any>} feature2 GeoJSON Feature or Geometry
     * @returns {boolean} true/false
     * @example
     * var point = turf.point([2, 2]);
     * var line = turf.lineString([[1, 1], [1, 2], [1, 3], [1, 4]]);
     *
     * turf.booleanDisjoint(line, point);
     * //=true
     */
    function booleanDisjoint(feature1, feature2) {
        var bool = true;
        flattenEach$1(feature1, function (flatten1) {
            flattenEach$1(feature2, function (flatten2) {
                if (bool === false) {
                    return false;
                }
                bool = disjoint(flatten1.geometry, flatten2.geometry);
            });
        });
        return bool;
    }
    /**
     * Disjoint operation for simple Geometries (Point/LineString/Polygon)
     *
     * @private
     * @param {Geometry<any>} geom1 GeoJSON Geometry
     * @param {Geometry<any>} geom2 GeoJSON Geometry
     * @returns {boolean} true/false
     */
    function disjoint(geom1, geom2) {
        switch (geom1.type) {
            case "Point":
                switch (geom2.type) {
                    case "Point":
                        return !compareCoords(geom1.coordinates, geom2.coordinates);
                    case "LineString":
                        return !isPointOnLine(geom2, geom1);
                    case "Polygon":
                        return !booleanPointInPolygon(geom1, geom2);
                }
                /* istanbul ignore next */
                break;
            case "LineString":
                switch (geom2.type) {
                    case "Point":
                        return !isPointOnLine(geom1, geom2);
                    case "LineString":
                        return !isLineOnLine(geom1, geom2);
                    case "Polygon":
                        return !isLineInPoly(geom2, geom1);
                }
                /* istanbul ignore next */
                break;
            case "Polygon":
                switch (geom2.type) {
                    case "Point":
                        return !booleanPointInPolygon(geom2, geom1);
                    case "LineString":
                        return !isLineInPoly(geom1, geom2);
                    case "Polygon":
                        return !isPolyInPoly(geom2, geom1);
                }
        }
        return false;
    }
    // http://stackoverflow.com/a/11908158/1979085
    function isPointOnLine(lineString, pt) {
        for (var i = 0; i < lineString.coordinates.length - 1; i++) {
            if (isPointOnLineSegment(lineString.coordinates[i], lineString.coordinates[i + 1], pt.coordinates)) {
                return true;
            }
        }
        return false;
    }
    function isLineOnLine(lineString1, lineString2) {
        var doLinesIntersect = lineIntersect(lineString1, lineString2);
        if (doLinesIntersect.features.length > 0) {
            return true;
        }
        return false;
    }
    function isLineInPoly(polygon, lineString) {
        for (var _i = 0, _a = lineString.coordinates; _i < _a.length; _i++) {
            var coord = _a[_i];
            if (booleanPointInPolygon(coord, polygon)) {
                return true;
            }
        }
        var doLinesIntersect = lineIntersect(lineString, polygonToLine(polygon));
        if (doLinesIntersect.features.length > 0) {
            return true;
        }
        return false;
    }
    /**
     * Is Polygon (geom1) in Polygon (geom2)
     * Only takes into account outer rings
     * See http://stackoverflow.com/a/4833823/1979085
     *
     * @private
     * @param {Geometry|Feature<Polygon>} feature1 Polygon1
     * @param {Geometry|Feature<Polygon>} feature2 Polygon2
     * @returns {boolean} true/false
     */
    function isPolyInPoly(feature1, feature2) {
        for (var _i = 0, _a = feature1.coordinates[0]; _i < _a.length; _i++) {
            var coord1 = _a[_i];
            if (booleanPointInPolygon(coord1, feature2)) {
                return true;
            }
        }
        for (var _b = 0, _c = feature2.coordinates[0]; _b < _c.length; _b++) {
            var coord2 = _c[_b];
            if (booleanPointInPolygon(coord2, feature1)) {
                return true;
            }
        }
        var doLinesIntersect = lineIntersect(polygonToLine(feature1), polygonToLine(feature2));
        if (doLinesIntersect.features.length > 0) {
            return true;
        }
        return false;
    }
    function isPointOnLineSegment(lineSegmentStart, lineSegmentEnd, pt) {
        var dxc = pt[0] - lineSegmentStart[0];
        var dyc = pt[1] - lineSegmentStart[1];
        var dxl = lineSegmentEnd[0] - lineSegmentStart[0];
        var dyl = lineSegmentEnd[1] - lineSegmentStart[1];
        var cross = dxc * dyl - dyc * dxl;
        if (cross !== 0) {
            return false;
        }
        if (Math.abs(dxl) >= Math.abs(dyl)) {
            if (dxl > 0) {
                return lineSegmentStart[0] <= pt[0] && pt[0] <= lineSegmentEnd[0];
            }
            else {
                return lineSegmentEnd[0] <= pt[0] && pt[0] <= lineSegmentStart[0];
            }
        }
        else if (dyl > 0) {
            return lineSegmentStart[1] <= pt[1] && pt[1] <= lineSegmentEnd[1];
        }
        else {
            return lineSegmentEnd[1] <= pt[1] && pt[1] <= lineSegmentStart[1];
        }
    }
    /**
     * compareCoords
     *
     * @private
     * @param {Position} pair1 point [x,y]
     * @param {Position} pair2 point [x,y]
     * @returns {boolean} true/false if coord pairs match
     */
    function compareCoords(pair1, pair2) {
        return pair1[0] === pair2[0] && pair1[1] === pair2[1];
    }

    /**
     * Boolean-intersects returns (TRUE) two geometries intersect.
     *
     * @name booleanIntersects
     * @param {Geometry|Feature<any>} feature1 GeoJSON Feature or Geometry
     * @param {Geometry|Feature<any>} feature2 GeoJSON Feature or Geometry
     * @returns {boolean} true/false
     * @example
     * var point = turf.point([2, 2]);
     * var line = turf.lineString([[1, 1], [1, 2], [1, 3], [1, 4]]);
     *
     * turf.booleanIntersects(line, point);
     * //=true
     */
    function booleanIntersects(feature1, feature2) {
        var bool = false;
        flattenEach$1(feature1, function (flatten1) {
            flattenEach$1(feature2, function (flatten2) {
                if (bool === true) {
                    return true;
                }
                bool = !booleanDisjoint(flatten1.geometry, flatten2.geometry);
            });
        });
        return bool;
    }

    var d2r = Math.PI / 180, MAX_ZOOM = 28;
    function getBboxZoom(bbox) {
        for (var z = 0; z < MAX_ZOOM; z++) {
            var mask = 1 << (32 - (z + 1));
            if (((bbox[0] & mask) !== (bbox[2] & mask)) ||
                ((bbox[1] & mask) !== (bbox[3] & mask))) {
                return z;
            }
        }
        return MAX_ZOOM;
    }
    /**
     * Get the smallest tile to cover a bbox
     */
    function bboxToTile(bboxCoords, minZoom) {
        var min = pointToTile(bboxCoords[0], bboxCoords[1], 32);
        var max = pointToTile(bboxCoords[2], bboxCoords[3], 32);
        var bbox = [min[0], min[1], max[0], max[1]];
        var z = Math.min(getBboxZoom(bbox), typeof minZoom !== 'undefined' ? minZoom : MAX_ZOOM);
        if (z === 0)
            return [0, 0, 0];
        var x = bbox[0] >>> (32 - z);
        var y = bbox[1] >>> (32 - z);
        return [x, y, z];
    }
    /**
     * Get the tile for a point at a specified zoom level
     */
    function pointToTile(lon, lat, z) {
        var tile = pointToTileFraction(lon, lat, z);
        tile[0] = Math.floor(tile[0]);
        tile[1] = Math.floor(tile[1]);
        return tile;
    }
    /**
     * Get the precise fractional tile location for a point at a zoom level
     */
    function pointToTileFraction(lon, lat, z) {
        var sin = Math.sin(lat * d2r), z2 = Math.pow(2, z), x = z2 * (lon / 360 + 0.5), y = z2 * (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);
        // Wrap Tile X
        x = x % z2;
        if (x < 0)
            x = x + z2;
        return [x, y, z];
    }

    var DEFAULT_ZOOM = 25;
    var Space = /** @class */ (function () {
        /**
         * Create a new Space
         *
         * @param input A LngLatWithAltitude or string containing either a ZFXY or tilehash-encoded ZFXY.
         * @param zoom Optional. Defaults to 25 when `input` is LngLatWithAltitude. Ignored when ZXFY or tilehash is provided.
         */
        function Space(input, zoom) {
            if (typeof input === 'string') {
                // parse string
                var zfxy = parseZFXYString(input) || parseZFXYTilehash(input);
                if (zfxy) {
                    this.zfxy = zfxy;
                    this._regenerateAttributesFromZFXY();
                }
                else {
                    throw new Error("parse ZFXY failed with input: ".concat(input));
                }
                return;
            }
            else if (isZFXYTile(input)) {
                this.zfxy = input;
                this._regenerateAttributesFromZFXY();
                return;
            }
            else {
                this.zfxy = calculateZFXY(__assign(__assign({}, input), { zoom: (typeof zoom !== 'undefined') ? zoom : DEFAULT_ZOOM }));
            }
            this._regenerateAttributesFromZFXY();
        }
        /* - PUBLIC API - */
        Space.prototype.up = function (by) {
            if (by === void 0) { by = 1; }
            return this.move({ f: by });
        };
        Space.prototype.down = function (by) {
            if (by === void 0) { by = 1; }
            return this.move({ f: -by });
        };
        Space.prototype.north = function (by) {
            if (by === void 0) { by = 1; }
            return this.move({ y: by });
        };
        Space.prototype.south = function (by) {
            if (by === void 0) { by = 1; }
            return this.move({ y: -by });
        };
        Space.prototype.east = function (by) {
            if (by === void 0) { by = 1; }
            return this.move({ x: by });
        };
        Space.prototype.west = function (by) {
            if (by === void 0) { by = 1; }
            return this.move({ x: -by });
        };
        Space.prototype.move = function (by) {
            var newSpace = new Space(this.zfxy);
            newSpace.zfxy = zfxyWraparound({
                z: newSpace.zfxy.z,
                f: newSpace.zfxy.f + (by.f || 0),
                x: newSpace.zfxy.x + (by.x || 0),
                y: newSpace.zfxy.y + (by.y || 0),
            });
            newSpace._regenerateAttributesFromZFXY();
            return newSpace;
        };
        Space.prototype.parent = function (atZoom) {
            var steps = (typeof atZoom === 'undefined') ? 1 : this.zfxy.z - atZoom;
            return new Space(getParent(this.zfxy, steps));
        };
        Space.prototype.children = function () {
            return getChildren(this.zfxy).map(function (tile) { return new Space(tile); });
        };
        /** Return an array of Space objects at the same zoom level that surround this Space
         * object. This method does not return the Space object itself, so the array will
         * contain 26 Space objects.
         */
        Space.prototype.surroundings = function () {
            var _this = this;
            return __spreadArray(__spreadArray(__spreadArray([], __read((getSurrounding(this.zfxy)
                .filter(function (_a) {
                var z = _a.z, f = _a.f, x = _a.x, y = _a.y;
                return "/".concat(z, "/").concat(f, "/").concat(x, "/").concat(y) !== _this.zfxyStr;
            })
                .map(function (tile) { return new Space(tile); }))), false), __read((getSurrounding(this.up().zfxy)
                .map(function (tile) { return new Space(tile); }))), false), __read((getSurrounding(this.down().zfxy)
                .map(function (tile) { return new Space(tile); }))), false);
        };
        /** Returns true if a point lies within this Space. If the position's altitude is not
         * specified, it is ignored from the calculation.
         */
        Space.prototype.contains = function (position) {
            var geom = this.toGeoJSON();
            var point = {
                type: 'Point',
                coordinates: [position.lng, position.lat],
            };
            var floor = this.alt;
            var ceil = getFloor(__assign(__assign({}, this.zfxy), { f: this.zfxy.f + 1 }));
            return (booleanIntersects(geom, point) &&
                (typeof position.alt !== 'undefined' === true ?
                    position.alt >= floor && position.alt < ceil
                    :
                        true));
        };
        /** Calculates the polygon of this Space and returns a 2D GeoJSON Polygon. */
        Space.prototype.toGeoJSON = function () {
            var _a = __read(getBBox(this.zfxy), 2), nw = _a[0], se = _a[1];
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
        };
        /** Calculates the 3D polygon of this Space and returns the vertices of that polygon. */
        Space.prototype.vertices3d = function () {
            var _a = __read(getBBox(this.zfxy), 2), nw = _a[0], se = _a[1];
            var floor = getFloor(this.zfxy);
            var ceil = getFloor(__assign(__assign({}, this.zfxy), { f: this.zfxy.f + 1 }));
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
        };
        Space.getSpaceById = function (id, zoom) {
            return new Space(id, zoom);
        };
        Space.getSpaceByLocation = function (loc, zoom) {
            return new Space(loc, zoom);
        };
        Space.getSpaceByZFXY = function (zfxyStr) {
            return new Space(zfxyStr);
        };
        /** Calculates the smallest spatial ID to fully contain the polygon. Currently only supports 2D polygons. */
        Space.boundingSpaceForGeometry = function (geom, minZoom) {
            minZoom = minZoom || 25;
            var bbox = bbox$2(geom);
            var largestTile = bboxToTile(bbox, minZoom);
            var _a = __read(largestTile, 3), x = _a[0], y = _a[1], z = _a[2];
            return new Space({ x: x, y: y, z: z, f: 0 });
        };
        /** Calculate an array of spaces that make up the polygon. Currently only supports 2D polygons. */
        Space.spacesForGeometry = function (geom, zoom) {
            var z = zoom;
            if (z === 0) {
                // not recommended.
                return [new Space('0/0/0/0')];
            }
            if (geom.type === 'GeometryCollection') {
                throw new Error('GeometryCollection not supported');
            }
            // this can be optimized a lot!
            var bbox = bbox$2(geom), min = pointToTile(bbox[0], bbox[1], 32), max = pointToTile(bbox[2], bbox[3], 32), minX = (Math.min(min[0], max[0])) >>> (32 - z), minY = (Math.min(min[1], max[1])) >>> (32 - z), maxX = (Math.max(max[0], min[0]) >>> (32 - z)) + 1, maxY = (Math.max(max[1], min[1]) >>> (32 - z)) + 1, spaces = [];
            // scanline polygon fill algorithm
            for (var x = minX; x <= maxX; x++) {
                for (var y = minY; y <= maxY; y++) {
                    var space = new Space({ x: x, y: y, z: z, f: 0 });
                    if (booleanIntersects(geom, space.toGeoJSON())) {
                        spaces.push(space);
                    }
                }
            }
            return spaces;
        };
        Space.prototype._regenerateAttributesFromZFXY = function () {
            this.alt = getFloor(this.zfxy);
            this.center = getCenterLngLatAlt(this.zfxy);
            this.zoom = this.zfxy.z;
            this.id = this.tilehash = generateTilehash(this.zfxy);
            this.zfxyStr = "/".concat(this.zfxy.z, "/").concat(this.zfxy.f, "/").concat(this.zfxy.x, "/").concat(this.zfxy.y);
        };
        return Space;
    }());

    exports.Space = Space;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
