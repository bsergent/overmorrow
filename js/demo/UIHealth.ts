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
    // Calculate number of sprites
    let emptyCount = Math.ceil(this.entity.maxHealth / this._healthPerSquare);
    let fillCount = Math.floor(this.entity.health / this._healthPerSquare * 2) / 2;
    if (fillCount <= 0 && this.entity.health > 0) fillCount = 0.5;

    // Adjust height and context
    this.height = (this.width * 5/6) * (emptyCount - 1) + this.width;
    ui.translateContext(this.x1, this.y1);
    let drawRect = new Rectangle(0, this.height, this.width, this.width * 5/6);
    let spriteRect = new Rectangle(0, 1, 6, 5);

    // Draw empty sprites
    for (let sq = 0; sq < emptyCount; sq++) {
      if (sq === emptyCount - 1) {
        drawRect.height = this.width;
        spriteRect.y1 = 0;
        spriteRect.height = 6;
      }
      drawRect.y1 -= drawRect.height;
      ui.drawSprite(drawRect, spriteRect, this._image);
    }

    // Draw fill sprites
    drawRect = new Rectangle(0, this.height, this.width, this.width * 5/6);
    spriteRect = new Rectangle(6, 1, 6, 5);
    for (let sq = 0; sq < fillCount; sq++) {
      if (sq === emptyCount - 1) {
        drawRect.height = this.width;
        spriteRect.y1 = 0;
        spriteRect.height = 6;
      }
      if (sq > fillCount - 1)
        spriteRect.x1 = 12;
      drawRect.y1 -= drawRect.height;
      ui.drawSprite(drawRect, spriteRect, this._image);
      if (DEBUG)
        ui.drawText(new Rectangle(drawRect.center.x, drawRect.center.y - 5, 0, 0), ''+sq, 'Courier', 10, Color.WHITE, 'center');
    }
    
    // Show exact numbers
    ui.drawText(new Rectangle(this.center.x, this.height - 8, 0, 0),
      Math.ceil(this.entity.health)+'/'+this.entity.maxHealth, 'Courier', 10,
      new Color(209, 117, 115), 'center');

    // Reset context
    ui.translateContext(-this.x1, -this.y1);
    
    if (DEBUG)
      ui.drawRectWire(this, Color.GREEN);
  }
}