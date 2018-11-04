export default class Color {
  public static BLACK = new Color();
  public static WHITE = new Color(255,255,255);
  public static RED = new Color(255,0,0);
  public static GREEN = new Color(0,255,0);
  public static BLUE = new Color(0,0,255);
  public static BROWN = new Color(76,55,24);
  public static TRANSPARENT = new Color(0,0,0,0);
  private _r:number; // 0-255
  private _g:number; // 0-255
  private _b:number; // 0-255
  private _a:number; // 0-1
  /**
   * @param r Red component (0-255)
   * @param g Green component (0-255)
   * @param b Blue component (0-255)
   * @param a Alpha component (0-1)
   */
  constructor(r:number = 0, g:number = 0, b:number = 0, a:number = 1) {
    this._r = r;
    this._g = g;
    this._b = b;
    this._a = a;
  }
  public equals(color: Color): boolean {
    return color._r === this._r
      && color._g === this._g
      && color._b === this._b
      && color._a === this._a;
  }
  public clone(): Color {
    return new Color(this._r, this._g, this._b, this._a);
  }
  public setRed(r: number): Color {
    this._r = r;
    return this;
  }
  public setGreen(g: number): Color {
    this._g = g;
    return this;
  }
  public setBlue(b: number): Color {
    this._b = b;
    return this;
  }
  public setAlpha(a: number): Color {
    this._a = a;
    return this;
  }
  public get r(): number {
    return this._r;
  }
  public set r(r: number) {
    if (r < 0 || r > 255) throw 'Invalid color component. Must be within [0,255].';
    this._r = r;
  }
  public get g(): number {
    return this._g;
  }
  public set g(g: number) {
    if (g < 0 || g > 255) throw 'Invalid color component. Must be within [0,255].';
    this._g = g;
  }
  public get b(): number {
    return this._b;
  }
  public set b(b: number) {
    if (b < 0 || b > 255) throw 'Invalid color component. Must be within [0,255].';
    this._b = b;
  }
  public get a(): number {
    return this._a;
  }
  public set a(a: number) {
    if (a < 0 || a > 1) throw 'Invalid alpha component. Must be within [0,1].';
    this._a = a;
  }
  public get hex(): string {
    return '#'
      + ('0' + this._r.toString(16)).slice(-2)
      + ('0' + this._g.toString(16)).slice(-2)
      + ('0' + this._b.toString(16)).slice(-2);
  }
  public set hex(hex: string) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
    // Set rgb
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || result.length < 4) return;
    this._r = parseInt(result[1], 16);
    this._g = parseInt(result[2], 16);
    this._b = parseInt(result[3], 16);
  }
  public get rgbaObject(): { r: number, g: number, b: number, a: number } {
    return {
      r: this._r,
      g: this._g,
      b: this._b,
      a: this._a
    }
  }
  public set rgbaObject(colorObject: { r: number, g: number, b: number, a: number }) {
    this._r = colorObject.r;
    this._g = colorObject.g;
    this._b = colorObject.b;
    if (colorObject.a !== undefined && colorObject.a !== null && typeof(colorObject.a) == 'number')
      this._a = colorObject.a;
  }
  public get rgba(): string {
    return 'rgba('+this._r+','+this._g+','+this._b+','+this._a.toFixed(2)+')';
  }
  public set rgba(newRgba: string) {
    // TODO Convert rgba(0,0,0,1) string to this class
    /*var rgba = newRgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    if (!rgba || rgba.length !== 4) return;
    this.r = parseInt(rgba[1]);
    this.g = parseInt(rgba[2]);
    this.b = parseInt(rgba[3]);
    this.a = parseInt(rgba[4]);*/
  }
  public get opacity(): number {
    return this._a;
  }
  public set opacity(a: number) {
    this._a = a;
  }
}

export function hexToRgb(hex: string): any {
  var c = new Color();
  c.hex = hex;
  return c.rgbaObject;
}