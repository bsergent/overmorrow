import Tickable from '../interfaces/Tickable';
import { WorldRenderer } from '../ui/UIWorld';
import Color from '../primitives/Color';
import Rectangle from '../primitives/Rectangle';
import Entity from '../classes/Entity';
import Vector from '../primitives/Vector';
import Passage from './Passage';

// TODO Add snapToGrid() move entities onto the grid

export default abstract class World implements Tickable {
  protected static SIGMA: number = 0.0001; // Collision precision

	private _name: string;
  protected _backgroundColor: Color;
	protected _entities: Entity[] = []; // TODO Add draw order to entities
	private _tileBuffer; // Where the tiles are first drawn to (only visible or all?), only updated if map changes
	private _dirty: boolean = true; // True if tiles have changed and buffer needs to be redrawn
	protected _width: number;
	protected _height: number;
  protected _boundary: Rectangle;
	protected _passages: Passage[];
	protected _subGridDivisions: number = 1;

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

	public get width(): number {
		return this._width;
	}
	public get height(): number {
		return this._height;
	}
	public get name(): string {
		return this._name;
	}
	public get subGridDivisions(): number {
		return this._subGridDivisions;
	}
	public set subGridDivisions(value: number) {
		this._subGridDivisions = value;
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
		let startTime = Date.now();
		// Update tiles and entities
		for (let e of this._entities)
			e.tick(delta, this);

		// Entity collision detection
		for (let e1 of this._entities) {
			// World border
			if (!this._boundary.contains(e1)) {
				e1.revertMovement(this);
				continue;
			}
			// Other entities
			for (let e2 of this._entities) {
				if (e1 === e2) continue;
				if (e1.intersects(e2)) { // Collision
					if (e1.vel.magnitude > 0) {
						e1.collideWith(this, e2);
						e2.collidedBy(this, e1);
					}
					if (e2.vel.magnitude > 0) {
						e2.collideWith(this, e1);
						e1.collidedBy(this, e2);
					}
					//continue entity1;
				}
			}
			// Tile collision
			if (this.collides(e1))
				e1.revertMovement(this);
		}
		return Date.now() - startTime;
	}

	public draw(ui: WorldRenderer): void {
		for (let e of this._entities)
			e.draw(ui);
	}
}