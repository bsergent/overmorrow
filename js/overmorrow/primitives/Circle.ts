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

  intersects(cir: Circle): boolean {
    return (this.x - cir.x) * (this.x - cir.x)
         + (this.y - cir.y) * (this.y + cir.y)
        <= (this.r + cir.r) * (this.r + cir.r);
  }
}