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
import { sleep } from "../../dist/Utilities";

export default class UIEngravingPanel extends UIInventory {
  public surface: UICarvingSurface;
  public runeline: UIRuneLine;

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
      this.runeline = new UIRuneLine(
        22 * bp.scale, this.drawSpace.height - 22 * bp.scale,
        bp.scale, [ new Rune(), new Rune(), new Rune() ]);
      this.addComponent(this.runeline, 1);

      // Carving Surface
      this.surface = new UICarvingSurface(2 * bp.scale, 2 * bp.scale, 14, 8, bp.scale);
      this.addComponent(this.surface, 1);

      // Imbument Button
      this.addComponent(new UIImage(
        94 * bp.scale, this.drawSpace.height - 22 * bp.scale,
        22 * bp.scale, 22 * bp.scale,
        'assets/itemslot.png'), 1);
      let btn = new UIButton(96 * bp.scale, 74 * bp.scale, 18 * bp.scale, 18 * bp.scale, 'Imbue');
      btn.setColorBG(Color.fromString('#792F2F'));
      btn.setColorBGHover(Color.fromString('#843333'));
      btn.setAction(() => {
        console.log('Beginning imbument process.');
        this.surface.imbue().then((runes) => {
          console.log('Imbument process complete.');
          this.runeline.setRunes(runes);
        });
      })
      this.addComponent(btn, 1);

      // Testing
      this.addComponent(new UIImage(
        (94 + 26) * bp.scale, this.drawSpace.height - 22 * bp.scale,
        22 * bp.scale, 22 * bp.scale,
        'assets/itemslot.png'), 1);
      let testbtn = new UIButton((96 + 26) * bp.scale, 74 * bp.scale, 18 * bp.scale, 18 * bp.scale, 'Clear');
      testbtn.setColorBG(Color.fromString('#947aa8'));
      testbtn.setColorBGHover(Color.fromString('#9f86b1'));
      testbtn.setAction(() => {
        this.surface.prepare();
      })
      this.addComponent(testbtn, 1);
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

  public setRunes(runes: Rune[]): void {
    this._runes = runes;
  }
}

export class UICarvingSurface extends UIComponent {
  protected _columns: number;
  protected _rows: number;
  protected _state: CarvingState[] = [];
  // Drawing & interaction
  protected _scale: number = 1;
  protected _alttexture: boolean[] = [];
  protected _clickedcell: number = -1;
  protected _hoveredcell: number = -1;
  private _anistart: number = (new Date).getTime();
  private _anidur: number = 3; // seconds/cycle
  private _borderpatch: BorderPatch = new BorderPatch('assets/9p_stone_light');
  // Imbuement process
  protected _imbuing: boolean = false;
  protected _imbumentspeed: number = 8; // cells/second
  protected _imbumentpromise: Promise<Rune[]> = null;
  
  constructor(x: number, y: number, columns: number, rows: number, scale: number) {
    super(x, y, columns * 8 * scale, rows * 8 * scale);
    this._columns = columns;
    this._rows = rows;
    this._scale = scale;

    this.prepare();
    for (let x = 0; x < this._columns * this._rows; x++)
      this._alttexture[x] = Math.random() < 0.5;
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
            drect.x1 = this._alttexture[this._columns * y + x] ? 0 : 8; drect.y1 = 0; break;
          case CarvingState.BLEMISHED1:
            drect.x1 = 16; drect.y1 = 0; break;
          case CarvingState.BLEMISHED2:
            drect.x1 = 24; drect.y1 = 0; break;
          case CarvingState.CUT:
            drect.x1 = this._alttexture[this._columns * y + x] ? 0 : 8; drect.y1 = 8; break;
          case CarvingState.FILLING:
            drect.x1 = 16; drect.y1 = 8; break;
          case CarvingState.FILLED:
            drect.x1 = 24; drect.y1 = 8; break;
        }

        // Fluctuate lighting on filled squares
        let opac = 1;
        let t = (new Date()).getTime() - this._anistart;
        t /= 1000;
        let minopac = 0.85;
        if (this._state[this._columns * y + x] === CarvingState.FILLED)
          opac = (1 - minopac) / 2 * Math.sin(2 * Math.PI / this._anidur * t) + (1 - ((1 - minopac) / 2));
        
        ui.drawSprite(rect, drect, 'assets/carvingspace.png', opac);
        if (this._columns * y + x === this._hoveredcell)
          ui.drawRectWire(rect, Color.GOLD);
      }
    }

    if (this._borderpatch.loaded) {
      let border = this.clone();
      border.x1 -= 2 * this._borderpatch.scale;
      border.y1 -= 2 * this._borderpatch.scale;
      border.width += 4 * this._borderpatch.scale;
      border.height += 4 * this._borderpatch.scale;
      ui.setOpacity(0.8);
      this._borderpatch.draw(ui, border);
      ui.setOpacity();
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

  public prepare(): void {
    // TODO Calculate man/min number of blemishes based on item quality and a number in that range
    for (let x = 0; x < this._columns * this._rows; x++)
      this._state[x] = Math.random() > 0.05 ? CarvingState.PRISTINE : (Math.random() > 0.5 ? CarvingState.BLEMISHED1 : CarvingState.BLEMISHED2);
  }

  public async imbue(): Promise<Rune[]> {
    if (this._imbuing) return;
    this._imbuing = true;
    let runes: Rune[] = [];

    let cutcells: number[] = [];
    let tocheck: number[] = [];
    let indexoffsetstocheck: number[] = [
      -this._columns - 1, -this._columns, -this._columns + 1,
      -1, +1,
      this._columns - 1, this._columns, this._columns + 1];
    for (let c = 0; c < this._rows * this._columns; c++)
      if (this._state[c] === CarvingState.CUT)
        cutcells.push(c);
    for (let cut of cutcells) {
      if (this._state[cut] !== CarvingState.CUT) continue;
      tocheck.push(cut);

      for (let c of tocheck) {
        // Check adj. cells to add to 'tocheck'
        for (let offset of indexoffsetstocheck)
          if (c + offset >= 0 && c + offset < this._state.length && this._state[c + offset] === CarvingState.CUT) {
            this._state[c + offset] = CarvingState.FILLING;
            tocheck.push(c + offset);
            await sleep(1000 / this._imbumentspeed);
          }
        
        // Imbue current cell
        this._state[c] = CarvingState.FILLED;
      }
    }
    
    this._imbuing = false;
    return runes;
  }

  public isImbuing(): boolean {
    return this._imbuing;
  }
}

export enum CarvingState {
  PRISTINE,
  BLEMISHED1,
  BLEMISHED2,
  CUT,
  FILLING,
  FILLED // The filled texture should really pulsate... Maybe use the animation sheet?
}

export class Rune {
  protected _name: string;
  protected _size: Line;
}