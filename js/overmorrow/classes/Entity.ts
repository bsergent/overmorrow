import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import AnimationSheet from 'overmorrow/classes/AnimationSheet';
import World from 'overmorrow/classes/World';
import { Facing } from 'overmorrow/Utilities';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Vector from 'overmorrow/primitives/Vector';

export default abstract class Entity extends Rectangle {
	private static _nextId: number = 0;

	private _type: string;
	private _id: number;
	private _image: AnimationSheet;
	protected _prevPos: Vector; // Position at beginning of previous tick
	protected _speed: number;
	protected _collidable: boolean = true;

	public facing: Facing = Facing.DOWN; // Current facing of sprite
	public vel: Vector = new Vector(0, 0); // Current velocity

	constructor(x: number, y: number, width: number, height: number, type: string, speed: number) {
		super(x, y, width, height);
		this._prevPos = new Vector(x, y);
		this._type = type;
		this._speed = speed;
		this._id = Entity._nextId++;
	}

	public abstract draw(ui: WorldRenderer): void;
	public tick(delta: number, world: World): void {
		this._prevPos.x = this.x1;
		this._prevPos.y = this.y1;

    this.x1 += this.vel.x * delta;
		this.y1 += this.vel.y * delta;
		
		// Handle facing
		if (this.vel.y > 0) {
			this.facing = Facing.DOWN;
		} else if (this.vel.x < 0) {
			this.facing = Facing.LEFT;
		} else if (this.vel.y < 0) {
			this.facing = Facing.UP;
		} else if (this.vel.x > 0) {
			this.facing = Facing.RIGHT;
		}
	};

	public revertMovement(world: World): void {
		this.x1 = this._prevPos.x;
		this.y1 = this._prevPos.y;
		this.vel.magnitude = 0;
	}

	get speed(): number {
		return this._speed;
	}

	get id(): number {
		return this._id;
	}

	get type(): string {
		return this._type;
	}

	get collidable(): boolean {
		return this._collidable;
	}

	get prevPos(): Vector {
		return this._prevPos;
	}
}