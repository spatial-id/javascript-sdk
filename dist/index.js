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
    function getBBox(tile) {
        var nw = getLngLat(tile), se = getLngLat(__assign(__assign({}, tile), { y: tile.y + 1, x: tile.x + 1 }));
        return [nw, se];
    }
    /** Returns the floor of the voxel, in meters */
    function getFloor(tile) {
        return tile.f * (Math.pow(2, ZFXY_1M_ZOOM_BASE)) / (Math.pow(2, tile.z));
    }
    function calculateZFXY(input) {
        var meters = typeof input.altitude !== 'undefined' ? input.altitude : 0;
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
            x: x % Math.pow(2, z),
            y: y % Math.pow(2, z),
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
        Space.prototype._regenerateAttributesFromZFXY = function () {
            this.center = getCenterLngLat(this.zfxy);
            this.alt = getFloor(this.zfxy);
            this.zoom = this.zfxy.z;
            this.tilehash = generateTilehash(this.zfxy);
            this.zfxyStr = "/".concat(this.zfxy.z, "/").concat(this.zfxy.f, "/").concat(this.zfxy.x, "/").concat(this.zfxy.y);
        };
        return Space;
    }());

    exports.Space = Space;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
