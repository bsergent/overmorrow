import Line from "../../dist/primitives/Line";
import UIInventory from "../../dist/ui/UIInventory";
import Inventory from "../../dist/classes/Inventory";
import Vector from "../../dist/primitives/Vector";
import Renderer from "../../dist/Renderer";

export default class UIEngraving extends UIInventory {
  public surface: EngravingSurface;

  constructor(x: number, y: number) {
    super(x, y, 32, new Inventory(1, 'Engraving Surface'), [new Vector(22-9, 166-9)]);
    this._autoResize = false;
    this.width = 508;
    this.height = 220;
    this._drawTitle = false;
    this.setBorderPatch('assets/9p_stone');
  }
}

export class EngravingSurface {
  protected _columns: number;
  protected _rows: number;
  protected _grid: number[][]; // 0=empty, 1=carved, 2=filled
}

export class Rune {
  protected _name: string;
  protected _size: Line;
}