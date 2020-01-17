import Line from "../../dist/primitives/Line";
import UIInventory from "../../dist/ui/UIInventory";
import Inventory from "../../dist/classes/Inventory";
import Vector from "../../dist/primitives/Vector";
import Renderer from "../../dist/Renderer";
import UIImage from "../../dist/ui/UIImage";
import { BorderPatch } from "../../dist/ui/BorderPatch";
import Color from "../../dist/primitives/Color";
import UIComponent from "../../dist/ui/UIComponent";
import Rectangle from "../../dist/primitives/Rectangle";

export default class UIEngravingPanel extends UIInventory {
  public surface: UIEngravingSurface;

  constructor(x: number, y: number) {
    super(x, y, 32, new Inventory(1, 'Engraving Surface'), []);
    this._autoResize = false;
    this.width = 508;
    this.height = 220;
    this._drawTitle = false;
    this._cellColor = Color.TRANSPARENT;
    //this._drawItemGrid = false;
    this.setBorderPatch('assets/9p_stone');
    this._borderPatch.onload.push((bp: BorderPatch) => {
      // Item slot
      this.addComponent(new UIImage(
        0, this.drawSpace.height - 22 * bp.scale,
        22 * bp.scale, 22 * bp.scale,
        'assets/itemslot.png'), 1);
      this.setCellPositions([new Vector(3 * bp.scale, this.drawSpace.height - 19 * bp.scale)]);

      // Runeline
      this.addComponent(new UIRuneLine(
        22 * bp.scale, this.drawSpace.height - 22 * bp.scale,
        bp.scale, [ new Rune(), new Rune(), new Rune() ]), 1);
    });
  }

  public draw(ui: Renderer): void {
    super.draw(ui);
    // UIPanel.prototype.draw.call(this, ui); // super.super.draw(ui)
    // super.drawItems(ui);
    //ui.drawRectWire(this.drawSpace, Color.LIME);
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

export class UIEngravingSurface extends UIComponent {
  protected _columns: number;
  protected _rows: number;
  protected _grid: number[][]; // 0=empty, 1=carved, 2=filled, 3=blemish

  public draw(ui: Renderer): void {
    throw new Error("Method not implemented.");
  }
}

export class Rune {
  protected _name: string;
  protected _size: Line;
}