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

  }
}