import Tickable from 'overmorrow/interfaces/Tickable';
import Renderer from 'overmorrow/Renderer';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';

export default abstract class Tile implements Tickable {
	private _type: string;
	private _solid: boolean;
	private _light: number;
	private _fog: DiscoveryLevel;
	constructor(type: string) {
		this._type = type;
	}
	public abstract draw(ui: WorldRenderer): void;
	public abstract tick(delta: number): void;
}

export enum DiscoveryLevel {
	UNKNOWN,
	DISCOVERED,
	VISIBLE
}