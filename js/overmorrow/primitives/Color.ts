export default class Color {
  // TODO Rename colors in ALL CAPS as constants
  public static black = new Color();
  public static white = new Color(255,255,255);
  public static red = new Color(255,0,0);
  public static green = new Color(0,255,0);
  public static blue = new Color(0,0,255);
  public static brown = new Color(76,55,24);
  public static transparent = new Color(0,0,0,0);
  private r: number; // 0-255
  private g: number; // 0-255
  private b: number; // 0-255
  private a: number; // 0-1

  private static _heap: Color[] = [];
  public static new(r: number = 0, g: number = 0, b: number = 0, a: number = 1): Color {
    if (this._heap.length <= 0) return new Color(r, g, b, a);
    let col = this._heap.pop();
    col.r = r;
    col.g = g;
    col.b = b;
    col.a = a;
    return col;
  }
  /**
   * @param r Red component (0-255)
   * @param g Green component (0-255)
   * @param b Blue component (0-255)
   * @param a Alpha component (0-1)
   */
  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  public dispose(): void {
    Color._heap.push(this);
  }

  get hex(): string {
    return '#'
      + ('0' + this.r.toString(16)).slice(-2)
      + ('0' + this.g.toString(16)).slice(-2)
      + ('0' + this.b.toString(16)).slice(-2);
  }
  set hex(hex: string) {
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
  get rgbaObject(): { r: number, g: number, b: number, a: number } {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a
    }
  }
  set rgbaObject(colorObject: { r: number, g: number, b: number, a: number }) {
    this.r = colorObject.r;
    this.g = colorObject.g;
    this.b = colorObject.b;
    if (colorObject.a !== undefined && colorObject.a !== null && typeof(colorObject.a) == 'number')
      this.a = colorObject.a;
  }
  get rgba(): string {
    return 'rgba('+this.r+','+this.g+','+this.b+','+this.a.toFixed(2)+')';
  }
  set rgba(newRgba: string) {
    // TODO Convert rgba(0,0,0,1) string to this class
    /*var rgba = newRgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    if (!rgba || rgba.length !== 4) return;
    this.r = parseInt(rgba[1]);
    this.g = parseInt(rgba[2]);
    this.b = parseInt(rgba[3]);
    this.a = parseInt(rgba[4]);*/
  }
  get opacity(): number {
    return this.a;
  }
  set opacity(newA: number) {
    this.a = newA;
  }
  
  public equals(color: Color): boolean {
    return color.r === this.r
      && color.g === this.g
      && color.b === this.b
      && color.a === this.a;
  }
}

export function hexToRgb(hex: string): any {
  var c = Color.new();
  c.hex = hex;
  return c.rgbaObject;
}