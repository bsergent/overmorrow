import * as moment from '../../../node_modules/moment/moment';
import Tickable from 'overmorrow/interfaces/Tickable';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Color from 'overmorrow/primitives/Color';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Entity from 'overmorrow/classes/Entity';
import Tile from 'overmorrow/classes/Tile';

export default class World implements Tickable {
	private _name;
	protected _entities: Entity[] = [];
	private _tileBuffer; // Where the tiles are first drawn to (only visible or all?), only updated if map changes
	private _tiles: Tile[][]; // Tile information
	protected _collision: boolean[][];
	private _dirty: boolean = true; // True if tiles have changed and buffer needs to be redrawn
	protected _width: number;
	protected _height: number;

	constructor(width: number, height: number) {
		this._width = width;
		this._height = height;
		this._tiles = new Array(height);
		this._tiles.forEach((row) => { row = new Array(width); });
	}

	public setName(name: string): World {
		this._name = name;
		return this;
	}

	get width(): number {
		return this._width;
	}
	get height(): number {
		return this._height;
	}

	public addEntity(entity: Entity) {
		this._entities.push(entity);
	}

	public getTileAt(x: number, y: number): Tile {
		return this._tiles[y][x];
	}

	public isTileOccupied(x: number, y: number, entityToIgnore?: Entity): boolean {
		x = Math.floor(x);
		y = Math.floor(y);
		if (x < 0 || y < 0 || x >= this._width + 1 || y >= this._height + 1 || this._collision[y][x])
			return true;
		for (let e of this._entities)
			if (e !== entityToIgnore && e.intersects(new Rectangle(x, y, 1, 1)))
				return true;
		return false;
	}

	public tick(delta: number): number {
    let startTime = moment();
		this._tiles.forEach((row) => { row.forEach((tile) => { if (tile !== null) tile.tick(delta) }) });
		for (let e of this._entities)
			e.tick(delta, this);
		return moment().diff(startTime);
	}

	public draw(ui: WorldRenderer): void {
		/*let area = ui.getVisibleTileArea();
		for (let y = area.y1; y <= area.y2; y++) {
			for (let x = area.x1; x <= area.x2; x++) {
				if (this._tiles[y][x] != null)
					this._tiles[y][x].draw(ui);
			}
		}*/
		// X
		//  X X
		//  XX
		ui.drawRect(new Rectangle(0,0,1,1), Color.red);
		ui.drawRect(new Rectangle(1,1,1,1), Color.green);
		ui.drawRect(new Rectangle(1,2,1,1), Color.green);
		ui.drawRect(new Rectangle(2,2,1,1), Color.green);
		ui.drawRect(new Rectangle(3,1,1,1), Color.green);

		for (let e of this._entities)
			e.draw(ui);
	}
}