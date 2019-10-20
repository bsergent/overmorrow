import Rectangle from "./Rectangle";
import Vector from "./Vector";

export class Viewport extends Rectangle {
  public scale: number = 1;

  constructor(x: number, y: number, width: number, height: number, scale: number) {
    super(x, y, width, height);
    this.scale = scale;
  }

  public toAbsolute(coords: Rectangle|Vector): Rectangle|Vector {
    let rect2 = coords instanceof Rectangle ? coords.clone() : new Rectangle(coords.x, coords.y, 0, 0);
    rect2.x1 *= this.scale;
    rect2.y1 *= this.scale;
    rect2.width *= this.scale;
    rect2.height *= this.scale;
    rect2.x1 -= this.x1;
    rect2.y1 -= this.y1;
    return coords instanceof Rectangle ? rect2 : new Vector(rect2.x1, rect2.y1);
  }

  public toRelative(coords: Rectangle|Vector): Rectangle|Vector {
    let rect2 = coords instanceof Rectangle ? coords.clone() : new Rectangle(coords.x, coords.y, 0, 0);
    rect2.x1 += this.x1;
    rect2.y1 += this.y1;
    rect2.x1 /= this.scale;
    rect2.y1 /= this.scale;
    rect2.width /= this.scale;
    rect2.height /= this.scale;
    return coords instanceof Rectangle ? rect2 : new Vector(rect2.x1, rect2.y1);
  }
}