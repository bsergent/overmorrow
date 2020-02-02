import { getPixelColor } from "../../dist/Utilities";
import Vector from "../../dist/primitives/Vector";
import Rectangle from "../../dist/primitives/Rectangle";
import Renderer from "../../dist/Renderer";
declare var DEBUG;

export class Rune extends Rectangle {
  public static baseurl: string = '';
  public static runes: Map<string, Rune> = new Map(); // TODO Generate list programmatically

  protected _name: string;
  protected _img: HTMLImageElement;
  protected _pixelcount: number;
  protected _placements: RunePlacement[][];
  protected _loaded: boolean = false;

  public get name(): string {
    return this._name;
  }
  public get url(): string {
    return `${Rune.baseurl}${Rune.baseurl[Rune.baseurl.length - 1] !== '/' ? '/' : ''}${this._name}.png`;
  }
  public get pixelcount(): number {
    if (!this._loaded) throw 'Tried to read Rune.pixelcount before loaded.';
    return this._pixelcount;
  }
  public get placements(): RunePlacement[][] {
    if (!this._loaded) throw 'Tried to read Rune.placements before loaded.';
    return this._placements;
  }

  constructor(name: string) {
    super(0, 0, 0, 0);
    if (Rune.baseurl === '')
      throw 'Please specify a base URL for loading runes before initializing them.';

    this._name = name;

    // Fetch rune image
    this._img = new Image();
    this._img.src = this.url;
    this._img.onload = () => {
      this._loaded = true;
      this.width = this._img.width;
      this.height = this._img.height;
      this._pixelcount = 0;
      for (let y = 0; y < this.height; y++)
        for (let x = 0; x < this.width; x++)
          if (getPixelColor(this._img, x, y).a > 0)
            this._pixelcount++;
      this.calculatePlacements();
      if (DEBUG) {
        console.log(`Loaded rune %c${this._name}%c (w=${this.width},h=${this.height},pc=${this._pixelcount}).`, 'font-style:italic;', 'font-style:inherit');
        console.log(this._placements);
      }
    };

    Rune.runes.set(this._name, this);
  }

  public drawAt(ui: Renderer, pos: Rectangle, scale: number): void {
    let rect = pos.clone();

    // Offset by half the remaining height
    let offsetx = Math.floor((rect.height / scale - this.height) / 2);
    let offsety = Math.floor((rect.height / scale - this.height) / 2);

    // Scale to the correct dimensions
    rect.width /= rect.width / scale;
    rect.width *= this.width;
    rect.x1 += offsetx * scale;

    rect.height /= rect.height / scale;
    rect.height *= this.height;
    rect.y1 += offsety * scale;

    ui.drawImage(rect, this.url);
  }

  public toString(): string {
    return `${this._name}(w=${this.width},h=${this.height},pc=${this._pixelcount})`;
  }

  private calculatePlacements(): void {
    // Placement range has to include an extra row/column on every side
    let placementRange: Rectangle = new Rectangle(0, 0, this.width + 2, this.height + 2);
    this._placements = [];
    for (let y = 0; y < placementRange.height; y++)
      this._placements[y] = [];

    // Convert image to placement array (required cuts, required uncuts, and don't cares)
    let adj: Vector[] = [ new Vector(0, -1), new Vector(-1, 0), new Vector(1, 0), new Vector(0, 1) ];
    for (let py = 0; py < placementRange.height; py++) {
      for (let px = 0; px < placementRange.width; px++) {
        let y = py - 1, x = px - 1;
        if (this.contains(x, y) && getPixelColor(this._img, x, y).a > 0) {
          // Not fully transparent => cut required
          this._placements[py][px] = RunePlacement.CUT;
          // All adjacent pixels have to be cut or uncut
          for (let offset of adj)
            if (placementRange.contains(offset.add(new Vector(px, py))))
              if (this._placements[py + offset.y][px + offset.x] !== RunePlacement.CUT)
                this._placements[py + offset.y][px + offset.x] = RunePlacement.UNCUT;
        } else if (this._placements[py][px] !== RunePlacement.UNCUT) {
          // Placements not written to yet are don't cares
          this._placements[py][px] = RunePlacement.DONTCARE;
        }
      }
    }
  }
}

export enum RunePlacement {
  CUT,
  UNCUT,
  DONTCARE
}

Rune.baseurl = 'assets/runes';
new Rune('do');
new Rune('hayble');
new Rune('ki');
new Rune('wani');