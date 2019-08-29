import Vector from "./Vector";

export default class Circle {
  x: number;
  y: number;
  r: number;

  get circumference(): number {
    return Math.PI * this.diameter;
  }

  get diameter(): number {
    return 2 * this.r;
  }

  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  public intersects(cir: Circle): boolean {
    return (this.x - cir.x) * (this.x - cir.x)
         + (this.y - cir.y) * (this.y + cir.y)
        <= (this.r + cir.r) * (this.r + cir.r);
  }

  public contains(vecOrX: Vector|number, y?: number): boolean {
    if (vecOrX instanceof Vector)
      return (vecOrX.x - this.x) * (vecOrX.x - this.x) + (vecOrX.y - this.y) * (vecOrX.y - this.y) < this.r * this.r;
    return (vecOrX - this.x) * (vecOrX - this.x) + (y - this.y) * (y - this.y) < this.r * this.r;
  }
}