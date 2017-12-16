import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import AnimationSheet from 'overmorrow/classes/AnimationSheet';
import World from 'overmorrow/classes/World';
import { Direction } from 'overmorrow/Utilities';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Vector from 'overmorrow/primitives/Vector';

export default abstract class Entity extends Rectangle {
	private static _nextId: number = 0;

	private _type: string;
	private _id: number;
	private _image: AnimationSheet;
	private _speed1: number;
	private _speed2: number;

	public facing: Direction;
	public vel: Vector = new Vector(0, 0);
	public velIntended: Vector = new Vector(0, 0);
	public prevPos: Vector;

	constructor(x: number, y: number, width: number, height: number, type: string, speed1: number, speed2: number) {
		super(x, y, width, height);
		this.prevPos = new Vector(x, y);
		this._type = type;
		this._speed1 = speed1;
		this._speed2 = speed2;
		this._id = Entity._nextId++;
	}

	public abstract draw(ui: WorldRenderer): void;
	public tick(delta: number, world: World): void {
		//console.log(`${this.velIntended.magnitude} -> ${this.vel.magnitude}`);
		this.prevPos.x = this.x1;
		this.prevPos.y = this.y1;

    if (this.isAligned()) {
			this.vel.x = this.velIntended.x;
			this.vel.y = this.velIntended.y;
		}
    this.x1 += this.vel.x * delta;
    this.y1 += this.vel.y * delta;

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
			if (this.isAligned())
				this.vel.magnitude = 0;
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

	get speed1(): number {
		return this._speed1;
	}

	get speed2(): number {
		return this._speed2;
	}

	get id(): number {
		return this._id;
	}

	get type(): string {
		return this._type;
	}
}