import Vector from "./Vector";
import Line from "./Line";

export default class Rectangle extends Line {

  private static _heap: Rectangle[] = [];
  public static new(x: number, y: number, width: number, height: number): Rectangle {
    if (this._heap.length <= 0) return new Rectangle(x, y, width, height);
    let rect = this._heap.pop();
    rect.x1 = x;
    rect.y1 = y;
    rect.width = width;
    rect.height = height;
    return rect;
  }
  constructor(x: number, y: number, width: number, height: number) {
    super(Vector.new(x, y), Vector.new(x + width, y + height));
  }
  public dispose(): void {
    Rectangle._heap.push(this);
  }

  get x1(): number {
    return this.a.x;
  }
  set x1(value: number) { // Move instead of resizing for x1 and y1
    this.b.x += (value - this.a.x);
    this.a.x = value;
    //if (value > this._x2) this.swapCorners();
  }
  get y1(): number {
    return this.a.y;
  }
  set y1(value: number) {
    this.b.y += (value - this.a.y);
    this.a.y = value;
    //if (value > this._y2) this.swapCorners();
  }
  get x2(): number {
    return this.b.x;
  }
  set x2(value: number) {
    this.b.x = value;
    //if (value < this._x1) this.swapCorners();
  }
  get y2(): number {
    return this.b.y;
  }
  set y2(value: number) {
    this.b.y = value;
    //if (value < this._y1) this.swapCorners();
  }

  get width(): number {
    return this.x2 - this.a.x;
  }
  set width(value: number) {
    this.x2 += (value - this.width);
  }

  get height(): number {
    return this.y2 - this.a.y;
  }
  set height(value: number) {
    this.y2 += (value - this.height);
  }

  get center(): Vector {
    return Vector.new((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
  }
  set center(center: Vector) {
    this.x1 = center.x - (this.width / 2);
    this.y1 = center.y - (this.height / 2);
  }

  public intersects(rect: Rectangle): boolean {
    return this.a.x < rect.x2 && this.x2 > rect.a.x && this.a.y < rect.y2 && this.y2 > rect.a.y;
  }

  /**
   * Checks if the x,y pair or Vector are within the rectangle
   */
  public contains(xOrVec: number | Vector, y?: number): boolean {
    if (xOrVec instanceof Vector)
      return xOrVec.x >= this.x1 && xOrVec.x < this.x2 && xOrVec.y >= this.y1 && xOrVec.y < this.y2;
    else
      return xOrVec >= this.x1 && xOrVec < this.x2 && y >= this.y1 && y < this.y2;
  }

  public clone(): Rectangle {
    return Rectangle.new(this.a.x, this.a.y, this.width, this.height);
  }

  public equals(rect: Rectangle): boolean {
    return this.x1 === rect.x1 && this.y1 === rect.y1 && this.x2 === rect.x2 && this.y2 === rect.y2;
  }

  public displacementBetweenCenters(rect: Rectangle): Vector {
    let c1 = this.center;
    let c2 = rect.center;
    return Vector.new(c1.x - c2.x, c1.y - c2.y);
  }

  public distanceBetweenCenters(rect: Rectangle): number {
    let c1 = this.center;
    let c2 = rect.center;
    return Math.sqrt((c1.y - c2.y) * (c1.y - c2.y) + (c1.x - c2.x) * (c1.x - c2.x));
  }

  public offset(x: number, y: number): Rectangle {
    this.x1 += x;
    this.y1 += y;
    return this;
  }

  public offsetByVector(vec: Vector): Rectangle {
    this.x1 += vec.x;
    this.y1 += vec.y;
    return this;
  }

  private swapCorners(): void {
    this.a.x = this.a.x ^ this.b.x;
    this.b.x = this.a.x ^ this.b.x;
    this.a.x = this.a.x ^ this.b.x;

    this.a.y = this.a.y ^ this.b.y;
    this.b.y = this.a.y ^ this.b.y;
    this.a.y = this.a.y ^ this.b.y;

    // TODO Ensure the first point is top-left and second is bottom-right, but in a way that actually works
  }
}