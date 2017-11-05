define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Color {
        constructor(r = 0, g = 0, b = 0, a = 1) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        get hex() {
            return '#'
                + ('0' + this.r.toString(16)).slice(-2)
                + ('0' + this.g.toString(16)).slice(-2)
                + ('0' + this.b.toString(16)).slice(-2);
        }
        set hex(hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });
            // Set rgb
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (!result || result.length < 4)
                return;
            this.r = parseInt(result[1], 16);
            this.g = parseInt(result[2], 16);
            this.b = parseInt(result[3], 16);
        }
        get rgbaObject() {
            return {
                r: this.r,
                g: this.g,
                b: this.b,
                a: this.a
            };
        }
        set rgbaObject(colorObject) {
            this.r = colorObject.r;
            this.g = colorObject.g;
            this.b = colorObject.b;
            if (colorObject.a != null && typeof (colorObject.a) == 'number')
                this.a = colorObject.a;
        }
        get rgba() {
            return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a.toFixed(2) + ')';
        }
        set rgba(newRgba) {
            // TODO Convert rgba(0,0,0,1) string to this class
            /*var rgba = newRgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            if (!rgba || rgba.length !== 4) return;
            this.r = parseInt(rgba[1]);
            this.g = parseInt(rgba[2]);
            this.b = parseInt(rgba[3]);
            this.a = parseInt(rgba[4]);*/
        }
        get opacity() {
            return this.a;
        }
        set opacity(newA) {
            this.a = newA;
        }
    }
    Color.black = new Color();
    Color.white = new Color(255, 255, 255);
    Color.red = new Color(255, 0, 0);
    Color.green = new Color(0, 255, 0);
    Color.blue = new Color(0, 0, 255);
    Color.transparent = new Color(0, 0, 0, 0);
    exports.Color = Color;
    function hexToRgb(hex) {
        var c = new Color();
        c.hex = hex;
        return c.rgbaObject;
    }
    exports.hexToRgb = hexToRgb;
    function deepCopy(array) {
        var _out, v, _key;
        _out = Array.isArray(array) ? [] : {};
        for (_key in array) {
            if (_key.charAt(0) == '_' && _key.charAt(1) == '_')
                continue; // Skip variables starting with __ which shall now be circular references
            v = array[_key];
            _out[_key] = (typeof v === "object") ? this.deepCopy(v) : v;
        }
        return _out;
    }
    exports.deepCopy = deepCopy;
    function degreesToCardinal(degrees) {
        // Normalize degrees
        while (degrees < 0)
            degrees += 360;
        while (degrees >= 360)
            degrees -= 360;
        // Convert to cardinal number
        degrees += 11.25;
        degrees /= 22.5;
        // Convert to cardinal string
        var directions = ['E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N', 'NNE', 'NE', 'ENE', 'E'];
        return directions[Math.floor(degrees)];
    }
    exports.degreesToCardinal = degreesToCardinal;
    function new2dArray(height, width, defaultValue) {
        var arr = new Array(height);
        for (var y = 0; y < arr.length; y++) {
            arr[y] = new Array(width);
            for (var x = 0; x < arr[y].length; x++)
                arr[y][x] = defaultValue;
        }
        return arr;
    }
    exports.new2dArray = new2dArray;
    function getTextDimensions(text, font) {
        return {
            width: 0,
            height: 0
        };
    }
    exports.getTextDimensions = getTextDimensions;
    function capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    exports.capitalize = capitalize;
});
//# sourceMappingURL=util.js.map