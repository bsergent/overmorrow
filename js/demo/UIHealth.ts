import UIComponent from "../overmorrow/ui/UIComponent";
import EntityLiving from "../overmorrow/classes/EntityLiving";
import Renderer from "../overmorrow/Renderer";
import Rectangle from "../overmorrow/primitives/Rectangle";
import Color from "../overmorrow/primitives/Color";
declare var DEBUG: boolean;

export default class UIHealth extends UIComponent {
  public entity: EntityLiving;
  protected _image: string;
  protected _healthPerSquare: number;

  constructor(x: number, y: number, width: number, entity: EntityLiving, image: string, healthPerSquare: number) {
    super(x, y, width, width);
    // TODO Don't hardcode the image height as a magic number
    this.entity = entity;
    this._image = image;
    this._healthPerSquare = healthPerSquare;
  }

  // TODO Animate when a heart is lost
  // TODO Just use a context switch insead of dealing w/ actual coordinates
  public draw(ui: Renderer): void {
    // Calculate squares and height
    let squareCount = this.entity.maxHealth / this._healthPerSquare;
    this.height = (this.width * 5 / 6) * squareCount + this.width;
    let rect = this.clone();
    rect.height = this.width * 5 / 6;
    let drect = new Rectangle(0, 0, 6, 5);

    // Draw background
    for (let sq = 0; sq < squareCount; sq++) {
      rect.y1 = this.y1 + sq * (this.width * 5 / 6);
      if (sq === squareCount - 1) {
        rect.height = this.width;
        drect.y1 = 0;
        drect.height = 6;
      }
      ui.drawSprite(rect, drect, this._image);
    }

    // Draw fill w/ precision of full square
    // TODO Improve precision to half square (w/ new sprite for that)
    drect = new Rectangle(6, 0, 6, 6);
    for (let sq = 0; sq < squareCount; sq++) {
      if ((squareCount - sq) * this._healthPerSquare > this.entity.health) continue;
      // if ((squareCount - sq) * this._healthPerSquare - (this._healthPerSquare / 2) > this.entity.health)
      //   drect.x1 = 12;
      // else drect.x1 = 6;
      rect.y1 = this.y1 + sq * (this.width * 5/6);
      if (sq === squareCount - 1) {
        rect.height = this.width;
        drect.y1 = 0;
        drect.height = 6;
      }
      ui.drawSprite(rect, drect, this._image);
    }

    if (DEBUG)
      ui.drawRectWire(this, Color.GREEN);
  }
}