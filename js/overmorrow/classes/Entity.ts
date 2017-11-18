import Tickable from 'overmorrow/interfaces/Tickable';
import Drawable from 'overmorrow/interfaces/Drawable';
import Renderer from 'overmorrow/Renderer';

export default abstract class Entity implements Tickable, Drawable {
	private _type: string;
	private _id: number;
	private static _nextId: number = 0;
	constructor(type: string) {
		this._type = type;
		this._id = Entity._nextId++;
	}
	public abstract draw(ui: Renderer): void;
	public abstract tick(delta: number): void;
}