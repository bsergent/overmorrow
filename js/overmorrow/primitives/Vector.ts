export default class Vector {
  public static unitVecFromDeg(degrees: number): Vector {
    let rad: number = degrees * Math.PI / 180;
    let vec = new Vector(0, 0);
    vec.x = Math.cos(rad);
    vec.y = Math.sin(rad);
    vec.magnitude = 1;
    return vec;
  }

  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  get magnitude(): number {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }
  set magnitude(value: number) {
    if (value === 0) {
      this.x = 0;
      this.y = 0;
      return;
    }
    let magnitude = this.magnitude;
    this.x *= value / magnitude;
    this.y *= value / magnitude;
  }
  /**
   * Assumes 0deg=East, 90deg=South, etc.
   */
  get direction(): number { // Assuming 0deg = East, 90deg = South, etc.
    let degrees = Math.atan2(-this.x, this.y) * 180 / Math.PI + 90;
    while (degrees < 0) degrees += 360;
    while (degrees >= 360) degrees -= 360;
    return degrees;
  }

  public transpose(): Vector {
    let ret = this.clone();
    ret.x = this.y;
    ret.y = this.x;
    return ret;
  }
  public perpendicular(): Vector {
    let ret = this.clone();
    ret.x = this.y;
    ret.y = -this.x;
    return ret;
  }
  public invert(): Vector {
    let ret = this.clone();
    ret.x = this.x * -1;
    ret.y = this.y * -1;
    return ret;
  }
  public add(vec: Vector): Vector {
    if (vec === undefined) throw "Cannot add undefined to vector.";
    let result = this.clone();
    result.x += vec.x;
    result.y += vec.y;
    return result;
  }

  public clone(): Vector {
    return new Vector(this.x, this.y);
  }
  public equals(vec: Vector): boolean {
    return this.x === vec.x && this.y === vec.y;
  }
}