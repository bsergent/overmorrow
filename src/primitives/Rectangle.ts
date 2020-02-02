import Vector from "./Vector";
import Line from "./Line";

export default class Rectangle extends Line {
  
  constructor(x: number, y: number, width: number, height: number) {
    super(new Vector(x, y), new Vector(x + width, y + height));
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
  
  get area(): number {
    return this.width * this.height;
  }

  get center(): Vector {
    return new Vector((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
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
  public contains(coords: number|Vector|Rectangle, y?: number): boolean {
    if (coords instanceof Vector)
      return coords.x >= this.x1 && coords.x < this.x2 && coords.y >= this.y1 && coords.y < this.y2;
    else if (coords instanceof Rectangle)
      return coords.x1 >= this.x1 && coords.x2 < this.x2 && coords.y1 >= this.y1 && coords.y2 < this.y2;
    else
      return coords >= this.x1 && coords < this.x2 && y >= this.y1 && y < this.y2;
  }

  public clone(): Rectangle {
    return new Rectangle(this.a.x, this.a.y, this.width, this.height);
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

  public expand(x: number, y: number): Rectangle {
    this.width += x;
    this.height += y;
    return this;
  }

  public shrink(x: number, y: number): Rectangle {
    return this.expand(-x, -y);
  }

  public scale(factor: number): Rectangle {
    this.x1 *= factor;
    this.y1 *= factor;
    this.scaleDims(factor);
    return this;
  }

  public scaleDims(factor: number): Rectangle {
    this.width *= factor;
    this.height *= factor;
    return this;
  }

  public toString(): string {
    return `[(x1=${this.x1},y1=${this.y1}),(x2=${this.x2},y2=${this.y2}),(w=${this.width},h=${this.height})]`;
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