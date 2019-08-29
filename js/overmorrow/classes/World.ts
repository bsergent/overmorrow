import * as moment from '../../../node_modules/moment/moment';
import Tickable from 'overmorrow/interfaces/Tickable';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Color from 'overmorrow/primitives/Color';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Entity from 'overmorrow/classes/Entity';
import Tile from 'overmorrow/classes/Tile';
import Vector from '../primitives/Vector';
import Passage from './Passage';

// TODO Add snapToGrid() move entities onto the grid

export default abstract class World implements Tickable {
  protected static SIGMA: number = 0.0001; // Collision precision

	private _name;
  protected _backgroundColor: Color;
	protected _entities: Entity[] = []; // TODO Add draw order to entities
	private _tileBuffer; // Where the tiles are first drawn to (only visible or all?), only updated if map changes
	private _dirty: boolean = true; // True if tiles have changed and buffer needs to be redrawn
	protected _width: number;
	protected _height: number;
  protected _boundary: Rectangle;
	protected _passages: Passage[];
	public subGridDivisions: number = 1;

	constructor(name: string, width: number, height: number) {
		this._name = name;
		this._width = width;
		this._height = height;
		this._boundary = new Rectangle(0, 0, width, height); //  TODO Should the width and height be +1?
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
	get name(): string {
		return this._name;
	}

	public addEntity(entity: Entity) {
		this._entities.push(entity);
	}

	public getEntitiesAt(x: number, y: number): Entity[] {
		let entities: Entity[] = [];
		for (let e of this._entities)
			if (e.contains(x, y))
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
			if (region.contains(e.x1, e.y1) && mask.indexOf(e) === -1)
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

	// TODO Replace isTileOccupied w/ wouldCollide or something and then provide and entity and offset, useful for AI
	public abstract isTileOccupied(x: number, y: number, entityToIgnore?: Entity): boolean;
	public abstract collides(e: Entity): boolean;
	public abstract discover(x: number, y: number, radius: number): void;

	public tick(delta: number): number {
		let startTime = moment();
		// Update tiles and entities
		for (let e of this._entities)
			e.tick(delta, this);

		// Entity collision detection
		entity1:
		for (let e1 of this._entities) {
			// World border
			if (e1.y1 < 0 || e1.y2 > this._height || e1.x1 < 0 || e1.x2 > this._width) {
				e1.revertMovement(this);
				continue;
			}
			// Other entities
			for (let e2 of this._entities) {
				if (e1 !== e2 && e1.intersects(e2)) {
					e1.collide(this, e2);
					e2.collide(this, e1);
					if (e2.collidable)
						e1.revertMovement(this);
					if (e1.collidable)
						e2.revertMovement(this);
					continue entity1;
				}
			}
			// Tile collision
			if (this.collides(e1))
				e1.revertMovement(this);
		}
		return moment().diff(startTime);
	}

	public draw(ui: WorldRenderer): void {
		for (let e of this._entities)
			e.draw(ui);
	}
}