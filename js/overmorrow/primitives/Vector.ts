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

  public clone() {
    return new Vector(this.x, this.y);
  }
}