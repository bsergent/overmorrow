import Vector from "./Vector";
import Line from "./Line";

export default class Triangle {
  private _a: Vector;
  private _b: Vector;
  private _c: Vector;

  constructor(a: Vector, b: Vector, c: Vector) {
    this._a = a;
    this._b = b;
    this._c = c;
  }

  get a(): Vector {
    return this._a;
  }
  get b(): Vector {
    return this._b;
  }
  get c(): Vector {
    return this._c;
  }
  get points(): Vector[] {
    return [ this._a, this._b, this._c ];
  }
  get edges(): Line[] {
    return [ new Line(this._a, this._b), new Line(this._b, this._c), new Line(this._a, this._c) ];
  }
  get angAB(): number {
    throw "Not yet implemented.";
  }
  get angBC(): number {
    throw "Not yet implemented.";
  }
  get angAC(): number {
    throw "Not yet implemented.";
  }
  get height(): number {
    throw "Not yet implemented.";
  }
  get base(): number {
    throw "Not yet implemented.";
  }
  get area(): number {
    return this.base * this.height / 2;
  }
  get center(): Vector {
    throw "Not yet implemented.";
  }

  set a(a: Vector) {
    this._a = a;
  }
  set b(b: Vector) {
    this._b = b;
  }
  set c(c: Vector) {
    this._c = c;
  }

  public intersects(tri: Triangle): boolean { // TODO Also support Rectangle and circle, probably need a shape class
    throw "Not yet implemented.";
  }
  public contains(xOrVec: number | Vector, y?: number): boolean {
    // Bounding box check
    // U,V check
    throw "Not yet implemented.";

    /* Bounding box test first, for quick rejections. */
    // if((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
    // (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
    // (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
    // (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1]))
    //   return null;

    // var a = tri[1][0] - tri[0][0],
    //     b = tri[2][0] - tri[0][0],
    //     c = tri[1][1] - tri[0][1],
    //     d = tri[2][1] - tri[0][1],
    //     i = a * d - b * c;

    // /* Degenerate tri. */
    // if(i === 0.0)
    //   return null;

    // var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
    //     v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

    // /* If we're outside the tri, fail. */
    // if(u < 0.0 || v < 0.0 || (u + v) > 1.0)
    //   return null;

    // return [u, v];
  }

  public clone(): Triangle {
    return new Triangle(this._a, this._b, this._c);
  }

  public equals(tri: Triangle, checkOrder: boolean = true): boolean {
    if (!checkOrder) {
      let equalCount: number = 0;
      for (let v1 of this.points)
        for (let v2 of tri.points)
          if (v1.equals(v2))
            equalCount++;
      return equalCount >= 6; // 6, not 3, bc t1.a=t2.b and t2.b=t1.a
    } else return this._a === tri.a && this._b === tri.b && this._c === tri.c;
  }
}