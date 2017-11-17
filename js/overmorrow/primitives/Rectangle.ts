export default class Rectangle {
  private _x1: number;
  private _y1: number;
  public x2: number;
  public y2: number;
  
  get x1(): number {
    return this._x1;
  }
  set x1(value: number) { // Move instead of resizing for x1 and y1
    this.x2 += (value - this._x1);
    this._x1 = value;
  }
  get y1(): number {
    return this._y1;
  }
  set y1(value: number) {
    this.y2 += (value - this._y1);
    this._y1 = value;
  }

  get width(): number {
    return this.x2 - this._x1;
  }

  get height(): number {
    return this.y2 - this._y1;
  }

  constructor(x: number, y: number, width: number, height: number) {
    this._x1 = x;
    this._y1 = y;
    this.x2 = x + width;
    this.y2 = y + height;
  }

  intersects(rect: Rectangle): boolean {
    return this._x1 < rect.x2 && this.x2 > rect._x1 && this._y1 < rect.y2 && this.y2 > rect._y1;
  }

  inside(x: number, y: number): boolean {
    return x <= this.x2 && x >= this.x1 && y <= this.y2 && y >= this.y1;
  }
}