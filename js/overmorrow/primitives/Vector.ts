export default class Vector {
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

  public transpose(): void {
    let tmp = this.x;
    this.x = this.y;
    this.y = tmp;
  }
  public perpendicular(): void {
    let tmp = this.x;
    this.x = this.y;
    this.y = -tmp;
  }
  public invert(): void {
    this.x *= -1;
    this.y *= -1;
  }

  public clone(): Vector {
    return new Vector(this.x, this.y);
  }
  public equals(vec: Vector): boolean {
    return this.x === vec.x && this.y === vec.y;
  }
}