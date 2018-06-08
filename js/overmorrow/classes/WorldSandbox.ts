import * as moment from '../../../node_modules/moment/moment';
import World from "overmorrow/classes/World";
import Tile from "overmorrow/classes/Tile";
import Entity from 'overmorrow/classes/Entity';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';

export default class WorldSandbox extends World {
  // Will there need to be two layers of tiles? One for collidable foreground and one for the floor/background?
  // Don't want a single color/texture for the floor, so I guess there will have to be ground tiles that just
  //  aren't collidable, but that will make breaking tiles slightly more complicated. Guess ground tiles will
  //  be uncollidable and unbreakable
  
  private _tiles: Tile[][]; // Tile information
  
  constructor(width: number, height: number) {
    super(width, height);
		this._tiles = new Array(height);
    for (let r = 0; r < height; r++)
      this._tiles[r] = new Array(width);
  }

  public tick(delta: number): number {
    let startTime = moment();
		this._tiles.forEach((row) => { row.forEach((tile) => { if (tile !== null) tile.tick(delta) }) });
    super.tick(delta);
		return moment().diff(startTime);
  }

  public draw(ui: WorldRenderer): void {
    let area = ui.getVisibleTileArea();
		for (let y = area.y1; y <= area.y2; y++) {
			for (let x = area.x1; x <= area.x2; x++) {
				if (this._tiles[y][x] != null)
					this._tiles[y][x].draw(ui, x, y);
			}
    }
    super.draw(ui);
  }

	public getTileAt(x: number, y: number): Tile {
		return this._tiles[y][x];
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