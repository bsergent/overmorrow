import * as moment from '../../node_modules/moment/moment';
import World from './World';
import Tile, { TileType, DiscoveryLevel } from './Tile';
import Entity from './Entity';
import { WorldRenderer } from '../ui/UIWorld';
import Rectangle from '../primitives/Rectangle';
import Color from '../primitives/Color';
import { Perlin, SeededRandom } from '../Utilities';
import Vector from '../primitives/Vector';
declare var DEBUG;

export default class WorldSandbox extends World {
  protected _tilesFG: Tile[][];
  protected _tilesBG: Tile[][];
  protected _defaultTileTypeFG: string;
  protected _defaultTileTypeBG: string;
  protected _rand: SeededRandom;
  private _seed: number;
  
  constructor(name: string, width: number, height: number, backgroundTileType: string, foregroundTileType: string, seed: number = -1) {
    super(name, width, height);
    this._seed = seed === -1 ? Date.now() : seed;
    console.log(`Seed: ${this._seed}`);
    this._rand = new SeededRandom(this.seed.toString());

    this._defaultTileTypeFG = foregroundTileType;
    this._defaultTileTypeBG = backgroundTileType;
		this._tilesFG = new Array(height);
    for (let r = 0; r < height; r++) {
      this._tilesFG[r] = new Array(width);
      for (let c = 0; c < width; c++)
        this._tilesFG[r][c] = new Tile(foregroundTileType, this._rand.random());
    }
		this._tilesBG = new Array(height);
    for (let r = 0; r < height; r++) {
      this._tilesBG[r] = new Array(width);
      for (let c = 0; c < width; c++)
        this._tilesBG[r][c] = new Tile(backgroundTileType, this._rand.random());
    }
  }
  
  public get seed(): number {
    return this._seed;
  }

  public tick(delta: number): number {
    let startTime = moment();
		this._tilesFG.forEach((row) => { row.forEach((tile) => { if (tile !== null) tile.tick(delta) }) });
    super.tick(delta);
		return moment().diff(startTime);
  }

  public draw(ui: WorldRenderer): void {
    let area = ui.getVisibleTileArea();

    // Background Tiles
		for (let y = area.y1; y < area.y2; y++)
			for (let x = area.x1; x < area.x2; x++)
        if (this._tilesFG[y][x].type.transparent)
          this._tilesBG[y][x].draw(ui, x, y);

    // Entities
    for (let e of this._entities)
      if (this.getTile(e.x1, e.y1).light > 0 && this.getTile(e.x1, e.y1).fog === DiscoveryLevel.VISIBLE  || DEBUG)
        e.draw(ui);
    
    // Foreground Tiles
		for (let y = area.y1; y < area.y2; y++)
			for (let x = area.x1; x < area.x2; x++)
        this._tilesFG[y][x].draw(ui, x, y);

    // Vision
    for (let y = area.y1; y < area.y2; y++)
      for (let x = area.x1; x < area.x2; x++)
        if (this._tilesFG[y][x].fog === DiscoveryLevel.DISCOVERED && !DEBUG)
          ui.drawRect(new Rectangle(x, y, 1, 1), new Color(5, 5, 5, 0.7));
  }

  public discover(x: number, y: number, radius: number): void {
    for (let r = 0; r < this._width; r++)
      for (let c = 0; c < this._width; c++)
        if (this._tilesFG[r][c].fog === DiscoveryLevel.VISIBLE)
          this._tilesFG[r][c].fog = DiscoveryLevel.DISCOVERED;
    for (let r = Math.floor(Math.max(y + 0.5 - radius, 0)); r < Math.ceil(Math.min(y + 0.5 + radius, this._height)); r++)
      for (let c = Math.floor(Math.max(x + 0.5 - radius, 0)); c < Math.ceil(Math.min(x + 0.5 + radius, this._width)); c++)
        this._tilesFG[r][c].fog = DiscoveryLevel.VISIBLE;
  }

	public getTile(x: number, y: number): Tile {
    if (!this._boundary.contains(x, y))
      return null;
		return this._tilesFG[Math.floor(y)][Math.floor(x)];
  }

  public setTile(x: number, y: number, type: string, foreground: boolean = true): void {
    if (!this._boundary.contains(x, y)) return;
    if (foreground)
      this._tilesFG[Math.floor(y)][Math.floor(x)].type = TileType.getType(type);
    else
      this._tilesBG[Math.floor(y)][Math.floor(x)].type = TileType.getType(type);
  }

  public setTiles(rect: Rectangle, type: string, foreground: boolean = true): void {
    for (let y = Math.min(rect.y1, rect.y2); y < Math.max(rect.y1, rect.y2); y++)
      for (let x = Math.min(rect.x1, rect.x2); x < Math.max(rect.x1, rect.x2); x++)
        this.setTile(x, y, type, foreground);
  }

  public isTileOccupied(x: number, y: number, entityToIgnore?: Entity): boolean {
		let fX = Math.floor(x);
		let fY = Math.floor(y);
		return !this._boundary.contains(x, y)
      || this._tilesFG[fY][fX].type.solid;
    // TODO Reimplement checks for entities
  }

  public collides(e: Entity): boolean {
    return !(this._boundary.contains(e.x1, e.y1) && this._boundary.contains(e.x2, e.y2))
      || this._tilesFG[Math.floor(e.y1)][Math.floor(e.x1)].type.solid
      || this._tilesFG[Math.floor(e.y1)][Math.floor(e.x1 + e.width - World.SIGMA)].type.solid
      || this._tilesFG[Math.floor(e.y1 + e.height - World.SIGMA)][Math.floor(e.x1)].type.solid
      || this._tilesFG[Math.floor(e.y1 + e.height - World.SIGMA)][Math.floor(e.x1 + e.width - World.SIGMA)].type.solid;
  }

  protected countTileTypesInArea(area: Rectangle): Map<TileType, number> {
    let counts: Map<TileType, number> = new Map();
    let tile: Tile;
    for (let y = Math.min(area.y1, area.y2); y < Math.max(area.y1, area.y2); y++) {
      for (let x = Math.min(area.x1, area.x2); x < Math.max(area.x1, area.x2); x++) {
        tile = this.getTile(x, y)
        if (tile === null) continue;
        if (!counts.has(tile.type)) counts.set(tile.type, 1);
        else counts.set(tile.type, counts.get(tile.type)+1);
      }
    }
    return counts;
  }

  protected countSurroundingTiles(x: number, y: number, type: string): number {
    let directions: Vector[] = new Array<Vector>(
      new Vector(-1,  0),
      new Vector( 1,  0),
      new Vector( 0, -1),
      new Vector( 0,  1));
    let count: number = 0;
    let next: Vector, current: Vector = new Vector(x, y);
    let tileType: TileType = TileType.getType(type);
    for (let d = 0; d < directions.length; d++) {
      next = current.add(directions[d]);
      if (this.getTile(next.x, next.y) !== null
          && this.getTile(next.x, next.y).type === tileType)
        count++;
    }
    return count;
  }

  protected checkOppositeTiles(x: number, y: number, type: string): boolean {
    let tileType: TileType = TileType.getType(type);
    return (this.getTile(x+1, y) !== null && this.getTile(x+1, y).type === tileType
        && this.getTile(x-1, y) !== null && this.getTile(x-1, y).type === tileType)
      || (this.getTile(x, y+1) !== null && this.getTile(x, y+1).type === tileType
        && this.getTile(x, y-1) !== null && this.getTile(x, y-1).type === tileType);
  }
}