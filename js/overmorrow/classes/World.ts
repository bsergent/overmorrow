import * as moment from '../../../node_modules/moment/moment';
import Tickable from 'overmorrow/interfaces/Tickable';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Color from 'overmorrow/primitives/Color';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Entity from 'overmorrow/classes/Entity';
import Tile from 'overmorrow/classes/Tile';
import Vector from '../primitives/Vector';

export default abstract class World implements Tickable {
	private _name;
  protected _backgroundColor: Color;
	protected _entities: Entity[] = []; // TODO Add draw order to entities
	private _tileBuffer; // Where the tiles are first drawn to (only visible or all?), only updated if map changes
	protected _entityCollision: number[][][];
	private _dirty: boolean = true; // True if tiles have changed and buffer needs to be redrawn
	protected _width: number;
	protected _height: number;

	constructor(width: number, height: number) {
		this._width = width;
    this._height = height;

		this._entityCollision = new Array(height);
    for (let r = 0; r < height; r++)
      this._entityCollision[r] = new Array(width);
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

	public getEntitiesAt(x: number, y: number): Entity[] {
		let entities: Entity[] = [];
		for (let e of this._entities)
			if (e.inside(x, y))
				entities.push(e);
		return entities;
	}

	public getEntitiesByRaycast(x: number, y: number, degrees: number, maxDistance: number, checkCollision: boolean): Entity[] {
		// Return list of all entities in the specified direction ordered by distance from caster
		// Possibly take a rectangle as Rectangle(x, y, dirX, dirY) then use directionToVector()
		throw new Error("Method not implemented.");
	}

	public getEntitiesInRadius(center: Vector, radius: number, mask: Entity[] = []): Entity[] {
		// Return list of entities in radius ordered by proximity
		throw new Error("Method not implemented.");
	}

	public getEntitiesInRegion(region: Rectangle, mask: Entity[] = []): Entity[] {
		// Return list of entities in region
		let entities: Entity[] = [];
		for (let e of this._entities)
			if (region.inside(e.x1, e.y1) && mask.indexOf(e) === -1)
				entities.push(e);
		return entities;
	}

	public removeEntity(entity: Entity): boolean {
		// Returns false if entity could not be found
		for (let e = 0; e < this._entities.length; e++) {
			if (this._entities[e] === entity) {
				this._entities.splice(e, 1);
				return true;
			}
		}
		return false;
	}

	public abstract isTileOccupied(x: number, y: number, entityToIgnore?: Entity): boolean;

	public tick(delta: number): number {
		let startTime = moment();
		// Update tiles and entities
		for (let e of this._entities)
			e.tick(delta, this);
		// Reset entity collision map
		for (let y = 0; y < this._height; y++)
			for (let x = 0; x < this._width; x++)
        this._entityCollision[y][x] = [];
		for (let e of this._entities) {
			if (e.y1 < 0 || e.y2 > this._height || e.x1 < 0 || e.x2 > this._width)
				e.revertMovement();
			if (!e.collidable)
				continue;
				// Track new location to collision map
			this._entityCollision[Math.floor(e.y1)][Math.floor(e.x1)].push(e.id);
			if (Math.floor(e.y1) !== Math.ceil(e.y1) || Math.floor(e.x1) !== Math.ceil(e.x1))
				this._entityCollision[Math.ceil(e.y1)][Math.ceil(e.x1)].push(e.id);
    }
		for (let e of this._entities) {
			// Check if colliding with something from collision maps
			// Only revert movement if moving into an occupied tile
			if ((this.isTileOccupied(e.x1, e.y1, e) && (e.vel.x < 0 || e.vel.y < 0)) // Top-left side is occupied and entering
					|| (this.isTileOccupied(Math.ceil(e.x1), Math.ceil(e.y1), e) && (e.vel.x > 0 || e.vel.y > 0))) // Bottom-right side is occupied and entering
				e.revertMovement();
		}
		return moment().diff(startTime);
	}

	public draw(ui: WorldRenderer): void {
		for (let e of this._entities)
			e.draw(ui);
	}
}