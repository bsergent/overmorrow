import World from "overmorrow/classes/World";
import Tile from "overmorrow/classes/Tile";
import Color from "overmorrow/primitives/Color";
import Rectangle from "overmorrow/primitives/Rectangle";
import { WorldRenderer } from "../ui/UIWorld";

export default class WorldTiled extends World {
  private _backgroundColor: Color;
  private _tileKey: Map<number, TileKey> = new Map<number, TileKey>();
  private _objects: object[] = [];
  private _background: Layer[] = [];
  private _foreground: Layer[] = [];
  private _tileWidth: number;
  private _tileHeight: number;

  constructor(jsonUrl: string) {
    super(0, 0);
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
    this._tileWidth = json.tilewidth;
    this._tileHeight = json.tileheight;
    let color = new Color();
    color.hex = json.backgroundcolor;
    this._backgroundColor = color;

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

    // Initialize entity collision map
    this._entityCollision = new Array(this._height);
    for (let r = 0; r < this._height; r++)
      this._entityCollision[r] = new Array(this._width);
  }

  public draw(ui: WorldRenderer): void {
    this.drawBG(ui);
		for (let e of this._entities)
			e.draw(ui);
    this.drawFG(ui);
	}

  drawLayer(ui: WorldRenderer, layer: Layer): void {
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
          0,
          layer.opacity
        );
      }
    }
  }

  drawBG(ui: WorldRenderer): void {
    ui.drawRect(new Rectangle(0, 0, ui.getWidth(), ui.getHeight()), this._backgroundColor);
    for (var l = 0; l < this._background.length; l++) {
      if (!this._background[l].visible) continue;
      this.drawLayer(ui, this._background[l]);
    }
  }

  drawFG(ui: WorldRenderer): void {
    for (var l = 0; l < this._foreground.length; l++) {
      if (!this._foreground[l].visible) continue;
      this.drawLayer(ui, this._foreground[l]);
    }
  }

  public getTileAt(x: number, y: number): Tile {
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
}

interface TileKey {
  x: number,
  y: number,
  width: number,
  height: number,
  url: string,
  properties: Map<string, any>,
  terrain: any
}
interface Layer {
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
interface Tileset {
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
interface RawJson {
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