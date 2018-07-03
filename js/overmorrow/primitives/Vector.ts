export default class Vector {
  x: number;
  y: number;

  private static _heap: Vector[] = [];
  public static new(x: number, y: number): Vector {
    if (this._heap.length <= 0) return new Vector(x, y);
    let vec = this._heap.pop();
    vec.x = x;
    vec.y = y;
    return vec;
  }
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public dispose(): void {
    Vector._heap.push(this);
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
  public add(vec: Vector): Vector {
    if (vec === undefined) throw "Cannot add undefined to vector.";
    let result = this.clone();
    result.x += vec.x;
    result.y += vec.y;
    return result;
  }

  public clone(): Vector {
    return Vector.new(this.x, this.y);
  }
  public equals(vec: Vector): boolean {
    return this.x === vec.x && this.y === vec.y;
  }
}