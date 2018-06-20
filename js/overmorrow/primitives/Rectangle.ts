import Vector from "./Vector";

export default class Rectangle {
  private _x1: number;
  private _y1: number;
  private _x2: number;
  private _y2: number;

  constructor(x: number, y: number, width: number, height: number) {
    this._x1 = x;
    this._y1 = y;
    this.x2 = x + width;
    this.y2 = y + height;
  }

  get x1(): number {
    return this._x1;
  }
  set x1(value: number) { // Move instead of resizing for x1 and y1
    this._x2 += (value - this._x1);
    this._x1 = value;
    //if (value > this._x2) this.swapCorners();
  }
  get y1(): number {
    return this._y1;
  }
  set y1(value: number) {
    this._y2 += (value - this._y1);
    this._y1 = value;
    //if (value > this._y2) this.swapCorners();
  }
  get x2(): number {
    return this._x2;
  }
  set x2(value: number) {
    this._x2 = value;
    //if (value < this._x1) this.swapCorners();
  }
  get y2(): number {
    return this._y2;
  }
  set y2(value: number) {
    this._y2 = value;
    //if (value < this._y1) this.swapCorners();
  }

  get width(): number {
    return this.x2 - this._x1;
  }
  set width(value: number) {
    this.x2 += (value - this.width);
  }

  get height(): number {
    return this.y2 - this._y1;
  }
  set height(value: number) {
    this.y2 += (value - this.height);
  }

  get center(): Vector {
    return new Vector((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
  }
  set center(center: Vector) {
    this.x1 = center.x - (this.width / 2);
    this.y1 = center.y - (this.height / 2);
  }

  public intersects(rect: Rectangle): boolean {
    return this._x1 < rect.x2 && this.x2 > rect._x1 && this._y1 < rect.y2 && this.y2 > rect._y1;
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
    return new Rectangle(this._x1, this._y1, this.width, this.height);
  }

  public equals(rect: Rectangle): boolean {
    return this.x1 === rect.x1 && this.y1 === rect.y1 && this.x2 === rect.x2 && this.y2 === rect.y2;
  }

  public displacementBetweenCenters(rect: Rectangle): Vector {
    let c1 = this.center;
    let c2 = rect.center;
    return new Vector(c1.x - c2.x, c1.y - c2.y);
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
    this._x1 = this._x1 ^ this._x2;
    this._x2 = this._x1 ^ this._x2;
    this._x1 = this._x1 ^ this._x2;

    this._y1 = this._y1 ^ this._y2;
    this._y2 = this._y1 ^ this._y2;
    this._y1 = this._y1 ^ this._y2;

    // TODO Ensure the first point is top-left and second is bottom-right, but in a way that actually works
  }
}