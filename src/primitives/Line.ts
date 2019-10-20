import Vector from "./Vector";

export default class Line {
  public a: Vector;
  public b: Vector;

  constructor(a: Vector, b: Vector) {
    this.a = a;
    this.b = b;
  }

  public equals(l: Line, directed: boolean = false): boolean {
    return (this.a.equals(l.a) && this.b.equals(l.b)) || (!directed && this.a.equals(l.b) && this.b.equals(l.a));
  }
}