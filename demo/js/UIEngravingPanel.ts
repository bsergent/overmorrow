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
import { Rune, RunePlacement } from "./Rune";

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
        22 * bp.scale, this.drawSpace.height - 22 * bp.scale, bp.scale, []);
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
          this.runeline.addRunes(runes);
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
        this.runeline.setRunes([]);
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
  protected _scale: number;

  constructor(x: number, y: number, scale: number, runes: Rune[]) {
    super(x, y, 72 * scale, 22 * scale);
    this._scale = scale;
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
      this._runes[r].drawAt(ui, this._runepositions[r], this._scale);
  }

  public setRunes(runes: Rune[]): void {
    this._runes = runes;
  }

  public addRunes(runes: Rune[]): void {
    for (let r of runes)
      this._runes.push(r);
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
  private _shattertime: number = 100;
  private _cuttime: number = 100;
  // Imbuement process
  protected _imbuing: boolean = false;
  protected _imbumentspeed: number = 12; // cells/second
  protected _imbumentpromise: Promise<Rune[]> = null;

  private _temprects: Rectangle[] = [];
  
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
        switch (this._state[this.xyToInd(x, y)]) {
          case CarvingState.PRISTINE:
            drect.x1 = this._alttexture[this.xyToInd(x, y)] ? 0 : 8; drect.y1 = 0; break;
          case CarvingState.BLEMISHED:
            drect.x1 = this._alttexture[this.xyToInd(x, y)] ? 16 : 24; drect.y1 = 0; break;
          case CarvingState.CUTTING:
            drect.x1 = 32; drect.y1 = 0; break;
          case CarvingState.CUT:
            drect.x1 = this._alttexture[this.xyToInd(x, y)] ? 0 : 8; drect.y1 = 8; break;
          case CarvingState.FILLING:
            drect.x1 = 0; drect.y1 = 16; break;
          case CarvingState.FILLED:
            drect.x1 = 8; drect.y1 = 16; break;
          case CarvingState.SHATTERING:
            drect.x1 = 32; drect.y1 = 16; break;
          case CarvingState.SHATTERED:
            drect.x1 = this._alttexture[this.xyToInd(x, y)] ? 16 : 24; drect.y1 = 8; break;
        }

        // Fluctuate lighting on filled squares
        let opac = 1;
        let t = (new Date()).getTime() - this._anistart;
        t /= 1000;
        let minopac = 0.85;
        if (this._state[this.xyToInd(x, y)] === CarvingState.FILLED)
          opac = (1 - minopac) / 2 * Math.sin(2 * Math.PI / this._anidur * t) + (1 - ((1 - minopac) / 2));
        
        ui.drawSprite(rect, drect, 'assets/carvingspace.png', opac);
        if (this.xyToInd(x, y) === this._hoveredcell)
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

    if (DEBUG)
      for (let r of this._temprects)
        ui.drawRectWire(r, Color.GOLD);
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
        if (this._hoveredcell !== -1 && this._hoveredcell === this._clickedcell && !this._imbuing) {
          if (this._state[this._hoveredcell] === CarvingState.PRISTINE) {
            this._state[this._hoveredcell] = CarvingState.CUTTING;
            setTimeout((cell) => { this._state[cell] = CarvingState.CUT; }, this._cuttime, this._hoveredcell);
            // Break adjacent filled cells
            // TODO Break associated rune(s)
            let adj: number[] = [-this._columns, -1, 1, this._columns];
            for (let offset of adj)
              if (this._state[this._hoveredcell + offset] === CarvingState.FILLED) {
                this._state[this._hoveredcell + offset] = CarvingState.SHATTERING;
                setTimeout((cell) => { this._state[cell] = CarvingState.SHATTERED; }, this._shattertime, this._hoveredcell + offset);
              }
            return true;
          } else if (this._state[this._hoveredcell] === CarvingState.FILLED) {
            this._state[this._hoveredcell] = CarvingState.SHATTERING;
            setTimeout((cell) => { this._state[cell] = CarvingState.SHATTERED; }, this._shattertime, this._hoveredcell);
            return true;
          }
        }
    }
    return false;
  }

  public getCellAtCursor(x: number, y: number): number {
    if (!this.contains(x, y)) return -1;
    x -= this.x1;
    y -= this.y1;
    x = Math.floor(x / this._scale / 8);
    y = Math.floor(y / this._scale / 8);
		return this.xyToInd(x, y);
  }

  public prepare(): void {
    // TODO Calculate man/min number of blemishes based on item quality and a number in that range
    for (let x = 0; x < this._columns * this._rows; x++)
      this._state[x] = Math.random() > 0.05 ? CarvingState.PRISTINE : CarvingState.BLEMISHED;
  }

  /**
   * Imbue cut runes
   * @returns Array of newly imbued runes
   */
  public async imbue(): Promise<Rune[]> {
    if (this._imbuing) return;
    this._imbuing = true;
    let imbuedrunes: Rune[] = [];

    // Detect new runes
    let possiblerunes = Array.from(Rune.runes.values()).sort((a, b) => {
      return b.area - a.area;
    });
    let tempstate = [];
    for (let s = 0; s < this._state.length; s++)
      tempstate[s] = this._state[s];
    // Try all possible rune types in all possible placements
    for (let rune of possiblerunes)
      for (let y = 0; y <= this._rows - rune.height; y++)
        for (let x = 0; x <= this._columns - rune.width; x++) {
          this._temprects = [ new Rectangle((x * 8 + 2) * this._scale, (y * 8 + 2) * this._scale, rune.width * this._scale * 8, rune.height * this._scale * 8) ];
          if (DEBUG) await sleep(50);
          if (this.tryPlacement(rune, tempstate, x, y)) {
            imbuedrunes.push(rune);
            if (DEBUG) await sleep(200);
          }
        }
    this._temprects = [];

    // Animate rune filling
    let cutcells: number[] = [];
    let tocheck: number[] = [];
    let indexoffsetstocheck: number[] = [
      -this._columns - 1, -this._columns, -this._columns + 1,
      -1, +1,
      this._columns - 1, this._columns, this._columns + 1];
    for (let c = 0; c < this._rows * this._columns; c++)
      if (this._state[c] === CarvingState.CUT || this._state[c] === CarvingState.SHATTERED)
        cutcells.push(c);
    for (let cut of cutcells) {
      if (this._state[cut] !== CarvingState.CUT && this._state[cut] !== CarvingState.SHATTERED) continue;
      tocheck.push(cut);
      // TODO Should shattered cells still be usable for future imbuements?

      for (let c of tocheck) {
        // Check adj. cells to add to 'tocheck'
        let filledThisRound: boolean = false;
        for (let offset of indexoffsetstocheck) {
          if (c + offset >= 0 && c + offset < this._state.length && (this._state[c + offset] === CarvingState.CUT || this._state[c + offset] === CarvingState.SHATTERED)) {
            this._state[c + offset] = CarvingState.FILLING;
            tocheck.push(c + offset);
            await sleep(1000 / this._imbumentspeed);
            filledThisRound = true;
          }
        }
        
        // Imbue current cell
        if (filledThisRound)
          await sleep(1000 / this._imbumentspeed);
        this._state[c] = CarvingState.FILLED;
      }
    }
    
    this._imbuing = false;
    return imbuedrunes;
  }

  public isImbuing(): boolean {
    return this._imbuing;
  }

  private tryPlacement(rune: Rune, tempstate: CarvingState[], posx: number, posy: number): boolean {
    // Check if placement is valid
    for (let y = posy - 1; y < posy + rune.height + 1; y++) {
      for (let x = posx - 1; x < posx + rune.width + 1; x++) {
        let c = this.xyToInd(x, y);
        let requirement = rune.placements[y - posy + 1][x - posx + 1];
        if (requirement === RunePlacement.CUT) {
          if (c === -1 || (tempstate[c] !== CarvingState.CUT && tempstate[c] !== CarvingState.SHATTERED)) return false;
        } else if (requirement === RunePlacement.UNCUT) {
          if (c !== -1 && tempstate[c] !== CarvingState.PRISTINE && tempstate[c] !== CarvingState.BLEMISHED) return false;
        }
      }
    }

    // Actually imbue on tempstate if possible
    for (let y = posy; y < posy + rune.height; y++)
      for (let x = posx; x < posx + rune.width; x++)
        tempstate[this.xyToInd(x, y)] = CarvingState.FILLING;
    return true;
  }

  private xyToInd(x: number, y: number): number {
    let ind = y * this._columns + x;
    if (ind < 0 || ind >= this._state.length) return -1;
    return ind;
  }
}

export enum CarvingState {
  PRISTINE,
  BLEMISHED,
  CUTTING,
  CUT,
  FILLING,
  FILLED,
  SHATTERING,
  SHATTERED
}