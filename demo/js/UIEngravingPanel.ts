import Inventory from "../../dist/classes/Inventory";
import Color from "../../dist/primitives/Color";
import Line from "../../dist/primitives/Line";
import Rectangle from "../../dist/primitives/Rectangle";
import Vector from "../../dist/primitives/Vector";
import Renderer from "../../dist/Renderer";
import { BorderPatch } from "../../dist/ui/BorderPatch";
import UIComponent from "../../dist/ui/UIComponent";
import UIImage from "../../dist/ui/UIImage";
import UIInventory from "../../dist/ui/UIInventory";
import { InputEvent, EventTypes } from "../../dist/Controller";
import UIButton from "../../dist/ui/UIButton";

export default class UIEngravingPanel extends UIInventory {
  public surface: UICarvingSurface;

  constructor(x: number, y: number) {
    super(x, y, 32, new Inventory(1, 'Engraving Surface'), []);
    this._autoResize = false;
    this.width = 508;
    this.height = 220;
    this._drawTitle = false;
    this._cellColor = Color.TRANSPARENT;
    this.setBorderPatch('assets/9p_stone');
    this._borderPatch.onload.push((bp: BorderPatch) => {
      // Item Slot
      this.addComponent(new UIImage(
        0, this.drawSpace.height - 22 * bp.scale,
        22 * bp.scale, 22 * bp.scale,
        'assets/itemslot.png'), 1);
      this.setCellPositions([new Vector(3 * bp.scale, this.drawSpace.height - 19 * bp.scale)]);

      // Runeline
      this.addComponent(new UIRuneLine(
        22 * bp.scale, this.drawSpace.height - 22 * bp.scale,
        bp.scale, [ new Rune(), new Rune(), new Rune() ]), 1);

      // Carving Surface
      this.addComponent(new UICarvingSurface(2 * bp.scale, 2 * bp.scale, 14, 8, bp.scale), 1);

      // Testing
      let btn = new UIButton(256, 64, 36, 16, 'Test');
      btn.setAction(() => {
        console.log('Clicked button!');
      })
      this.addComponent(btn, 1);
    });
  }

  public draw(ui: Renderer): void {
    super.draw(ui);
  }
}

export class UIRuneLine extends UIComponent {
  protected _runes: Rune[] = [];
  protected _runepositions: Rectangle[] = [];

  constructor(x: number, y: number, scale: number, runes: Rune[]) {
    super(x, y, 72 * scale, 22 * scale);
    this._runes = runes;

    this.addRunePosition(new Vector( 2, 8), scale);
    this.addRunePosition(new Vector(10, 8), scale);
    this.addRunePosition(new Vector(18, 7), scale);
    this.addRunePosition(new Vector(26, 7), scale);
    this.addRunePosition(new Vector(34, 8), scale);
    this.addRunePosition(new Vector(42, 8), scale);
    this.addRunePosition(new Vector(50, 8), scale);
    this.addRunePosition(new Vector(58, 8), scale);
  }

  protected addRunePosition(pos: Vector, scale: number): void {
    this._runepositions.push(new Rectangle(
      this.x1 + pos.x * scale, this.y1 + pos.y * scale, 
      6 * scale, 6 * scale));
  }

  public draw(ui: Renderer): void {
    ui.drawImage(this, 'assets/runeline.png');
    for (let r = 0; r < this._runes.length && r < this._runepositions.length; r++)
      ui.drawRect(this._runepositions[r], Color.GOLD);
  }
}

export class UICarvingSurface extends UIComponent {
  protected _columns: number;
  protected _rows: number;
  protected _scale: number = 1;
  protected _state: CarvingState[] = [];
  protected _clickedcell: number = -1;
  protected _hoveredcell: number = -1;
  
  constructor(x: number, y: number, columns: number, rows: number, scale: number) {
    super(x, y, columns * 8 * scale, rows * 8 * scale);
    this._columns = columns;
    this._rows = rows;
    this._scale = scale;

    for (let x = 0; x < this._columns * this._rows; x++)
      this._state[x] = Math.random() > 0.05 ? CarvingState.PRISTINE : (Math.random() > 0.5 ? CarvingState.BLEMISHED1 : CarvingState.BLEMISHED2);
  }

  public draw(ui: Renderer): void {
    let rect = new Rectangle(0, 0, 8 * this._scale, 8 * this._scale);
    let drect = new Rectangle(0, 0, 8, 8);
    for (let y = 0; y < this._rows; y++) {
      for (let x = 0; x < this._columns; x++) {
        rect.x1 = this.x1 + x * rect.width;
        rect.y1 = this.y1 + y * rect.height;
        switch (this._state[this._columns * y + x]) {
          case CarvingState.PRISTINE:
            drect.x1 =  0; drect.y1 = 0; break;
          case CarvingState.BLEMISHED1:
            drect.x1 =  8; drect.y1 = 0; break;
          case CarvingState.BLEMISHED2:
            drect.x1 = 16; drect.y1 = 0; break;
          case CarvingState.CUT:
            drect.x1 =  0; drect.y1 = 8; break;
          case CarvingState.FILLING:
            drect.x1 =  8; drect.y1 = 8; break;
          case CarvingState.FILLED:
            drect.x1 = 16; drect.y1 = 8; break;
        }
        ui.drawSprite(rect, drect, 'assets/carvingspace.png');
        if (this._columns * y + x === this._hoveredcell)
          ui.drawRectWire(rect, Color.GOLD);
      }
    }
  }

  public input(ui: Renderer, e: InputEvent): boolean {
    if (!this.contains(e.x, e.y)) return false;
    switch (e.type) {
      case EventTypes.MOUSEMOVE:
          this._hoveredcell = this.getCellAtCursor(e.x, e.y);
          return false;
			case EventTypes.MOUSEDOWN:
        this._clickedcell = this._hoveredcell;
        return true;
			case EventTypes.MOUSEUP:
        if (this._hoveredcell !== -1 && this._hoveredcell === this._clickedcell && this._state[this._hoveredcell] === CarvingState.PRISTINE)
          this._state[this._hoveredcell] = CarvingState.CUT;
        return true;
    }
    return false;
  }

  public getCellAtCursor(x: number, y: number): number {
    if (!this.contains(x, y)) return -1;
    x -= this.x1;
    y -= this.y1;
    x = Math.floor(x / this._scale / 8);
    y = Math.floor(y / this._scale / 8);
		return y * this._columns + x;
  }

  public loadCarvingData(): void {
    throw 'Not yet implemented.';
  }
}

export enum CarvingState {
  PRISTINE,
  BLEMISHED1,
  BLEMISHED2,
  CUT,
  FILLING,
  FILLED
}

export class Rune {
  protected _name: string;
  protected _size: Line;
}