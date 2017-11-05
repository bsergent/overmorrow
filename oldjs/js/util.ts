export interface Box {
  width:number,
  height:number
}
export interface Area {
  x:number,
  y:number,
  width:number,
  height:number
}
export interface Vector {
  x:number,
  y:number,
  d:number // in degrees, CW from right
}
export class Color {
  public static black = new Color();
  public static white = new Color(255,255,255);
  public static red = new Color(255,0,0);
  public static green = new Color(0,255,0);
  public static blue = new Color(0,0,255);
  public static transparent = new Color(0,0,0,0);
  private r:number; // 0-255
  private g:number; // 0-255
  private b:number; // 0-255
  private a:number; // 0-1
  constructor(r:number = 0, g:number = 0, b:number = 0, a:number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  get hex():string {
    return '#'
      + ('0' + this.r.toString(16)).slice(-2)
      + ('0' + this.g.toString(16)).slice(-2)
      + ('0' + this.b.toString(16)).slice(-2);
  }
  set hex(hex:string) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
    // Set rgb
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || result.length < 4) return;
    this.r = parseInt(result[1], 16);
    this.g = parseInt(result[2], 16);
    this.b = parseInt(result[3], 16);
  }
  get rgbaObject():any {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a
    }
  }
  set rgbaObject(colorObject:any) {
    this.r = colorObject.r;
    this.g = colorObject.g;
    this.b = colorObject.b;
    if (colorObject.a != null && typeof(colorObject.a) == 'number')
      this.a = colorObject.a;
  }
  get rgba():string {
    return 'rgba('+this.r+','+this.g+','+this.b+','+this.a.toFixed(2)+')';
  }
  set rgba(newRgba:string) {
    // TODO Convert rgba(0,0,0,1) string to this class
    /*var rgba = newRgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    if (!rgba || rgba.length !== 4) return;
    this.r = parseInt(rgba[1]);
    this.g = parseInt(rgba[2]);
    this.b = parseInt(rgba[3]);
    this.a = parseInt(rgba[4]);*/
  }
  get opacity():number {
    return this.a;
  }
  set opacity(newA:number) {
    this.a = newA;
  }
}

export function hexToRgb(hex:string):any {
  var c = new Color();
  c.hex = hex;
  return c.rgbaObject;
}

export function deepCopy(array:object):object {
  var _out, v, _key;
  _out = Array.isArray(array) ? [] : {};
  for (_key in array) {
    if (_key.charAt(0) == '_' && _key.charAt(1) == '_') continue; // Skip variables starting with __ which shall now be circular references
    v = array[_key];
    _out[_key] = (typeof v === "object") ? this.deepCopy(v) : v;
  }
  return _out;
}

export function degreesToCardinal(degrees:number):string { // Assuming 0deg = East, 90deg = South, etc.
  // Normalize degrees
  while (degrees < 0) degrees += 360;
  while (degrees >= 360) degrees -= 360;
  // Convert to cardinal number
  degrees += 11.25;
  degrees /= 22.5;
  // Convert to cardinal string
  var directions = ['E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW','N','NNE','NE','ENE','E'];
  return directions[Math.floor(degrees)];
}

export function new2dArray(height:number, width:number, defaultValue:any):any[][] {
  var arr = new Array(height);
  for (var y = 0; y < arr.length; y++) {
    arr[y] = new Array(width);
    for (var x = 0; x < arr[y].length; x++)
      arr[y][x] = defaultValue;
  }
  return arr;
}

export function getTextDimensions(text:string, font:string):Box {
  return {
    width: 0,
    height: 0
  }
}

export function capitalize(text:string):string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}