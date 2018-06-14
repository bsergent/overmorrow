import * as moment from '../../../node_modules/moment/moment';
import World from 'overmorrow/classes/World';
import Tile, { TileType, DiscoveryLevel } from 'overmorrow/classes/Tile';
import Entity from 'overmorrow/classes/Entity';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Rectangle from '../primitives/Rectangle';
import Color from '../primitives/Color';
import { Perlin } from '../Utilities';
declare var DEBUG;

export default class WorldSandbox extends World {
  protected _tiles: Tile[][];
  private _seed: number;
  
  constructor(width: number, height: number, defaultTileType: string, seed: number = -1) {
    super(width, height);
		this._tiles = new Array(height);
    for (let r = 0; r < height; r++) {
      this._tiles[r] = new Array(width);
      for (let c = 0; c < width; c++)
        this._tiles[r][c] = new Tile(defaultTileType);
    }
    this._seed = seed === -1 ? Date.now() : seed;
    console.log(`Seed: ${this._seed}`);
    this.generate();
  }

  protected generate(): void {}
  
  public get seed(): number {
    return this._seed;
  }

  public tick(delta: number): number {
    let startTime = moment();
		this._tiles.forEach((row) => { row.forEach((tile) => { if (tile !== null) tile.tick(delta) }) });
    super.tick(delta);
		return moment().diff(startTime);
  }

  public draw(ui: WorldRenderer): void {
    let area = ui.getVisibleTileArea();
    // Tiles
		for (let y = area.y1; y <= area.y2; y++) {
			for (let x = area.x1; x <= area.x2; x++) {
				if (this._tiles[y][x] !== null) {
          if (this._tiles[y][x] === undefined) console.log(area);
          this._tiles[y][x].draw(ui, x, y);
        }
			}
    }
    // Entities
    for (let e of this._entities)
      if (this.getTile(e.x1, e.y1).light > 0 && this.getTile(e.x1, e.y1).fog === DiscoveryLevel.VISIBLE  || DEBUG)
        e.draw(ui);
    // Vision
    for (let y = area.y1; y <= area.y2; y++) {
      for (let x = area.x1; x <= area.x2; x++) {
        if (this._tiles[y][x] !== null && this._tiles[y][x].fog === DiscoveryLevel.DISCOVERED && !DEBUG)
          ui.drawRect(new Rectangle(x, y, 1, 1), new Color(5, 5, 5, 0.7));
      }
    }
  }

  public discover(x: number, y: number, radius: number): void {
    for (let r = 0; r < this._width; r++)
      for (let c = 0; c < this._width; c++)
        if (this._tiles[r][c].fog === DiscoveryLevel.VISIBLE)
          this._tiles[r][c].fog = DiscoveryLevel.DISCOVERED;
    for (let r = Math.floor(Math.max(y + 0.5 - radius, 0)); r < Math.ceil(Math.min(y + 0.5 + radius, this._height)); r++)
      for (let c = Math.floor(Math.max(x + 0.5 - radius, 0)); c < Math.ceil(Math.min(x + 0.5 + radius, this._width)); c++)
        this._tiles[r][c].fog = DiscoveryLevel.VISIBLE;
  }

	public getTile(x: number, y: number): Tile {
		return this._tiles[Math.floor(y)][Math.floor(x)];
  }

  public setTile(x: number, y: number, type: string): void {
    this._tiles[Math.floor(y)][Math.floor(x)].type = TileType.getType(type);
  }

  public isTileOccupied(x: number, y: number, entityToIgnore?: Entity): boolean {
		let fX = Math.floor(x);
		let fY = Math.floor(y);
		return x < 0
			|| y < 0
			|| x > this._width
			|| y > this._height
			|| this._tiles[fY][fX].type.solid
      || (entityToIgnore !== undefined
          && this._entityCollision[fY][fX].length > 1
          && this._entityCollision[fY][fX].indexOf(entityToIgnore.id) !== -1);
  }
}