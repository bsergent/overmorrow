import UIComponent from "../../src/ui/UIComponent";
import EntityLiving from "../../src/classes/EntityLiving";
import Renderer from "../../src/Renderer";
import Rectangle from "../../src/primitives/Rectangle";
import Color from "../../src/primitives/Color";
declare var DEBUG: boolean;

export default class UIStamina extends UIComponent {
  public entity: EntityLiving;
  protected _image: string;

  constructor(x: number, y: number, width: number, height: number, entity: EntityLiving, image: string) {
    super(x, y, width, height);
    this.entity = entity;
    this._image = image;
  }

  public draw(ui: Renderer): void {
    // Draw background
    let spriteX = this.entity.isFatigued() ? 30 : 18;
    ui.drawSprite(
      this, 
      new Rectangle(spriteX, 3, 6, 1), 
      this._image);
    ui.drawSprite(
      new Rectangle(this.x1, this.y1, this.width, this.width / 2), 
      new Rectangle(spriteX, 0, 6, 3), 
      this._image);
    ui.drawSprite(
      new Rectangle(this.x1, this.y1 + this.height - this.width * 2/6, this.width, this.width *2/6), 
      new Rectangle(spriteX, 4, 6, 2), 
      this._image);

    // Draw fill
    let fillMax = this.height - this.width * 2/6;
    let fillCur = Math.floor(this.entity.stamina / this.entity.maxStamina * fillMax);
    if (fillCur <= 0 && this.entity.stamina > 0) fillCur = this.width * 1/6;
    let fillY = this.y1 + this.width * 1/6 + fillMax - fillCur;
    ui.drawSprite( // Full
      new Rectangle(this.x1, fillY, this.width, fillCur),
      new Rectangle(24, 2, 6, 2),
      this._image);
    ui.drawSprite( // Bottom
      new Rectangle(this.x1, this.y2 - this.width * 1/6 - Math.min(fillCur, this.width * 2/6), this.width, Math.min(fillCur, this.width * 2/6)),
      new Rectangle(24, 4, 6, 2),
      this._image);
    ui.drawSprite( // Top
      new Rectangle(this.x1, fillY, this.width, Math.min(fillCur, this.width * 2/6)),
      new Rectangle(24, 0, 6, Math.min(fillCur / 6, 2)),
      this._image);
    
    if (DEBUG)
      ui.drawRectWire(this, Color.GREEN);
  }
}