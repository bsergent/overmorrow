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
	protected _speed: number;
	protected _collidable: boolean = true;

	public facing: Facing = Facing.DOWN; // Current facing of sprite
	public vel: Vector = new Vector(0, 0); // Current velocity
	public velIntended: Vector = new Vector(0, 0); // Velocity that should be used when aligned and not colliding
	public prevPos: Vector; // Position at beginning of previous tick

	constructor(x: number, y: number, width: number, height: number, type: string, speed: number) {
		super(x, y, width, height);
		this.prevPos = new Vector(x, y);
		this._type = type;
		this._speed = speed;
		this._id = Entity._nextId++;
	}

	public abstract draw(ui: WorldRenderer): void;
	public tick(delta: number, world: World): void {
		this.prevPos.x = this.x1;
		this.prevPos.y = this.y1;

    if (this.isAligned()) {
			this.vel.x = this.velIntended.x;
			this.vel.y = this.velIntended.y;
		}
    this.x1 += this.vel.x * delta;
		this.y1 += this.vel.y * delta;
		
		// Handle facing
		if (this.velIntended.y > 0) {
			this.facing = Facing.DOWN;
		} else if (this.velIntended.x < 0) {
			this.facing = Facing.LEFT;
		} else if (this.velIntended.y < 0) {
			this.facing = Facing.UP;
		} else if (this.velIntended.x > 0) {
			this.facing = Facing.RIGHT;
		}

		// Attempt to align to grid and stop
    if (!this.isAligned() && this.velIntended !== this.vel) {
      // If changed grid boundary in last tick, align to grid
      if (Math.floor(this.x1) - Math.floor(this.prevPos.x) > 0)
        this.x1 = Math.floor(this.x1);
      if (Math.ceil(this.x1) - Math.ceil(this.prevPos.x) < 0)
        this.x1 = Math.ceil(this.x1);
      if (Math.floor(this.y1) - Math.floor(this.prevPos.y) > 0)
        this.y1 = Math.floor(this.y1);
      if (Math.ceil(this.y1) - Math.ceil(this.prevPos.y) < 0)
				this.y1 = Math.ceil(this.y1);
    }
		this.velIntended.magnitude = 0;
	};

	public isAligned(): boolean {
		return this.x1 % 1 === 0 && this.y1 % 1 === 0;
	}

	public revertMovement(): void {
		this.x1 = Math.round(this.prevPos.x);
		this.y1 = Math.round(this.prevPos.y);
		this.vel.magnitude = 0;
		// TODO Make sure entity is realigned to grid
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
}