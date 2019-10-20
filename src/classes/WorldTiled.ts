import World from "./World";
import Tile, { DiscoveryLevel } from "./Tile";
import Color from "../primitives/Color";
import Rectangle from "../primitives/Rectangle";
import { WorldRenderer } from "../ui/UIWorld";
import Entity from './Entity';
import Circle from "../primitives/Circle";
import { DEBUG } from "../Game";

export default class WorldTiled extends World {
  private _tileKey: Map<number, TileKey> = new Map<number, TileKey>();
  private _objects: object[] = [];
  private _background: Layer[] = [];
  private _foreground: Layer[] = [];
  private _collision: boolean[][];
  private _fog: DiscoveryLevel[][];
  private _tileWidth: number;
  private _tileHeight: number;

  constructor(jsonUrl: string) {
    super('', 0, 0);
    let name: any = jsonUrl.split('/');
    name = name[name.length-1];
    name = (name as string).substr(0, name.length-5);
    this.setName(name);
    // Load json
    let json: RawJson;
    $.ajax({
      type: 'GET',
      url: jsonUrl,
      dataType: 'json',
      success: function(data) {
        json = data;
      },
      async: false
    });
    this._width = json.width;
    this._height = json.height;
    this._boundary.width = this._width;
    this._boundary.height = this._height;
    this._tileWidth = json.tilewidth;
    this._tileHeight = json.tileheight;
    let color = new Color();
    color.hex = json.backgroundcolor;
    this._backgroundColor = color;

    this._collision = new Array(this._height);
    for (let r = 0; r < this._height; r++)
      this._collision[r] = new Array(this._width);
    for (let y = 0; y < this._height; y++)
      for (let x = 0; x < this._width; x++)
        this._collision[y][x] = false;

    this._fog = new Array(this._height * this.subGridDivisions);
    for (let r = 0; r < this._height * this.subGridDivisions; r++)
      this._fog[r] = new Array(this._width * this.subGridDivisions);
    for (let y = 0; y < this._height * this.subGridDivisions; y++)
      for (let x = 0; x < this._width * this.subGridDivisions; x++)
        this._fog[y][x] = DiscoveryLevel.UNKNOWN;

    // Parse layers
    let parsingBackground: boolean = true;
    for (let layer of json.layers as Layer[]) {
      if (layer.name === 'entities' && layer.type === 'objectgroup') {
        parsingBackground = false;
        continue;
      }
      if (layer.name === 'collision' && layer.type === 'tilelayer') {
        this._collision = new Array(layer.height);
        for (let c = 0; c < this._collision.length; c++) {
          this._collision[c] = new Array(layer.width);
          for (var d = layer.width * c; d < layer.width * (c + 1); d++)
            this._collision[c][d - layer.width * c] = layer.data[d] != 0;
          continue;
        }
      }
      if (layer.type == 'tilelayer') {
        if (parsingBackground) this._background.push(layer);
        else this._foreground.push(layer);
      }
    }

    // Construct the tile key (tile ids -> tile image coordinates, url, and terrain)
    for (let ts of json.tilesets) {
      if (ts.tilecount === undefined)
        ts.tilecount = (ts.imageheight / ts.tileheight) * (ts.imagewidth / ts.tilewidth);
      for (let id = ts.firstgid; id < ts.firstgid + ts.tilecount; id++) {
        this._tileKey[id] = {
          x: (id - ts.firstgid) % (ts.imagewidth / ts.tilewidth) * ts.tilewidth,
          y: Math.floor((id - ts.firstgid) / (ts.imagewidth / ts.tilewidth)) * ts.tileheight,
          width: ts.tilewidth,
          height: ts.tileheight,
          url: 'assets/' + ts.image,
          properties: ts.tileproperties !== undefined ? ts.tileproperties[id - ts.firstgid] : null,
          terrain: null // TODO Calculate the terrain type
        };
      }
    }
  }

	public get subGridDivisions(): number {
		return super.subGridDivisions;
	}
  public set subGridDivisions(value: number) {
    super.subGridDivisions = value;
    this._fog = new Array(this._height * this.subGridDivisions);
    for (let r = 0; r < this._height * this.subGridDivisions; r++)
      this._fog[r] = new Array(this._width * this.subGridDivisions);
    for (let y = 0; y < this._height * this.subGridDivisions; y++)
      for (let x = 0; x < this._width * this.subGridDivisions; x++)
        this._fog[y][x] = DiscoveryLevel.UNKNOWN;
  }

  public draw(ui: WorldRenderer): void {
    this.drawBG(ui);

    let area = ui.getVisibleTileArea();

    let vis: boolean;
    for (let e of this._entities) {
      if ((!this._boundary.intersects(e)) && (!DEBUG)) continue;
      vis = false;
      for (let y = e.y1 * this.subGridDivisions; y < e.y2 * this.subGridDivisions; y++)
        for (let x = e.x1 * this.subGridDivisions; x < e.x2 * this.subGridDivisions; x++)
          if (this._fog[Math.floor(y)][Math.floor(x)] === DiscoveryLevel.VISIBLE || DEBUG)
            vis = true;
      if (vis) e.draw(ui);
    }

    this.drawFG(ui);

    // Fog
    let fogAtTile: DiscoveryLevel;
    if (!DEBUG) {
      for (let y = area.y1 * this.subGridDivisions; y < area.y2 * this.subGridDivisions; y++) {
        for (let x = area.x1 * this.subGridDivisions; x < area.x2 * this.subGridDivisions; x++) {
          fogAtTile = this._fog[y][x];
          if (fogAtTile === DiscoveryLevel.UNKNOWN)
            //ui.drawRect(new Rectangle(x, y, 1, 1), new Color(5, 5, 5, 1.0));
            ui.drawImage(new Rectangle(
              x / this.subGridDivisions, 
              y / this.subGridDivisions, 
              1 / this.subGridDivisions, 
              1 / this.subGridDivisions), 'assets/black.png');
          else if (fogAtTile === DiscoveryLevel.DISCOVERED)
            //ui.drawRect(new Rectangle(x, y, 1, 1), new Color(5, 5, 5, 0.7));
            ui.drawImage(new Rectangle(
              x / this.subGridDivisions, 
              y / this.subGridDivisions, 
              1 / this.subGridDivisions, 
              1 / this.subGridDivisions), 'assets/black.png', 0.5);
        }
      }
    }

    if (DEBUG) {
      for (let y = area.y1; y < area.y2; y++)
        for (let x = area.x1; x < area.x2; x++)
          ui.drawRectWire(new Rectangle(x, y, 1, 1), new Color(255, 255, 255, 0.1));
      for (let y = area.y1; y < area.y2; y += 1/this.subGridDivisions)
        for (let x = area.x1; x < area.x2; x += 1/this.subGridDivisions)
          ui.drawRectWire(new Rectangle(x, y, 1/this.subGridDivisions, 1/this.subGridDivisions), new Color(255, 255, 255, 0.05));
    }
	}

  protected drawLayer(ui: WorldRenderer, layer: Layer): void {
    let vArea = ui.getVisibleTileArea();
    // TODO Use visible tile area to lessen loop iterations
    for (let y = vArea.y1; y < vArea.y2; y++) {
      for (let x = vArea.x1; x < vArea.x2; x++) {
        let i = y * this._width + x;
        if (layer.data[i] == 0) continue;
        var tileImg = this._tileKey[layer.data[i]];
        if (tileImg == null)
          continue;
        // TODO Check if tile is animated
        ui.drawSprite(
          new Rectangle(
            x - (tileImg.width / this._tileWidth) + 1,
            y - (tileImg.height / this._tileHeight) + 1,
            tileImg.width / 16,
            tileImg.height / 16),
          new Rectangle(
            tileImg.x,
            tileImg.y,
            tileImg.width,
            tileImg.height),
          tileImg.url,
          layer.opacity
        );
      }
    }
  }

  protected drawBG(ui: WorldRenderer): void {
    ui.drawRect(new Rectangle(0, 0, ui.width, ui.height), this._backgroundColor);
    for (var l = 0; l < this._background.length; l++) {
      if (!this._background[l].visible) continue;
      this.drawLayer(ui, this._background[l]);
    }
  }

  protected drawFG(ui: WorldRenderer): void {
    for (var l = 0; l < this._foreground.length; l++) {
      if (!this._foreground[l].visible) continue;
      this.drawLayer(ui, this._foreground[l]);
    }
  }

  public getTileAt(x: number, y: number): TileKey {
    // Find topmost tile that's not collision and return its key
    var groups = [this._foreground, this._background];
    for (var lg = 0; lg < groups.length; lg++) {
      for (var l = groups[lg].length - 1; l >= 0; l--) {
        if (groups[lg][l].data[Math.floor(y*this._width + x)] != 0) {
          return this._tileKey[groups[lg][l].data[Math.floor(y*this._width + x)]];
          // TODO This is actually returning a TileKey, not a Tile
        }
      }
    }
  }

  public isTileOccupied(x: number, y: number, entityToIgnore?: Entity): boolean {
		let fX = Math.floor(x);
		let fY = Math.floor(y);
		return !this._boundary.contains(x, y)
			|| this._collision[fY][fX];
      // || (entityToIgnore !== undefined
      //     && this._entityCollision[fY][fX].length > 1
      //     && this._entityCollision[fY][fX].indexOf(entityToIgnore.id) !== -1);
  }

  public collides(e: Entity): boolean {
    return !(this._boundary.contains(e.x1, e.y1) && this._boundary.contains(e.x2, e.y2))
      || this._collision[Math.floor(e.y1)][Math.floor(e.x1)]
      || this._collision[Math.floor(e.y1)][Math.floor(e.x1 + e.width - World.SIGMA)]
      || this._collision[Math.floor(e.y1 + e.height - World.SIGMA)][Math.floor(e.x1)]
      || this._collision[Math.floor(e.y1 + e.height - World.SIGMA)][Math.floor(e.x1 + e.width - World.SIGMA)];
  }
  
  public discover(x: number, y: number, radius: number): void {
    let fov = new Circle(x * this.subGridDivisions, y * this.subGridDivisions, radius * this.subGridDivisions - 0.01);
    for (let r = 0; r < this._height * this.subGridDivisions; r++)
      for (let c = 0; c < this._width * this.subGridDivisions; c++)
        if (fov.contains(c, r))
          this._fog[Math.floor(r)][Math.floor(c)] = DiscoveryLevel.VISIBLE;
        else if (this._fog[r][c] === DiscoveryLevel.VISIBLE)
          this._fog[r][c] = DiscoveryLevel.DISCOVERED;
  }
}

export interface TileKey {
  x: number,
  y: number,
  width: number,
  height: number,
  url: string,
  properties: Map<string, any>,
  terrain: any
}
export interface Layer {
  data: number[],
  height: number,
  name: string,
  opacity: number,
  type: 'tilelayer'|'objectgroup',
  visible: boolean,
  width: number,
  x: number,
  y: number
}
export interface Tileset {
  columns: number,
  firstgid: number,
  image: string,
  imageheight: number,
  imagewidth: number,
  margin: number,
  name: string,
  spacing: number,
  tilecount: number,
  tileheight: number,
  tilewidth: number,
  tileproperties: any[]
}
export interface RawJson {
  height: number,
  layers: Layer[],
  nextobjectid: number,
  orientation: string,
  renderorder: string,
  tileheight: number,
  tilesets: Tileset[],
  tilewidth: number,
  version: number,
  width: number,
  backgroundcolor: string
}