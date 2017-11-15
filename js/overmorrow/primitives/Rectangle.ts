export default class Rectangle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  
  get width(): number {
    return this.x2 - this.x1;
  }

  get height(): number {
    return this.y2 - this.y1;
  }

  constructor(x: number, y: number, width: number, height: number) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + width;
    this.y2 = y + height;
  }

  intersects(rect: Rectangle): boolean {
    return this.x1 < rect.x2 && this.x2 > rect.x1 && this.y1 < rect.y2 && this.y2 > rect.y1;
  }
}