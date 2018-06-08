import Tickable from 'overmorrow/interfaces/Tickable';
import Renderer from 'overmorrow/Renderer';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import { toTitleCase } from "../Utilities";
import Item from 'overmorrow/classes/Item';
import EntityItem from 'overmorrow/classes/EntityItem';
import Rectangle from '../primitives/Rectangle';

export default abstract class Tile implements Tickable {
	private _type: TileType;
	private _light: number = 0;
	private _fog: DiscoveryLevel = DiscoveryLevel.UNKNOWN;
	private _durability: number = 1; // Number of ticks of mining left without modifier

	constructor(type: string) {
		this._type = TileType.getType(type);
		this._durability = this._type.hardness;
	}
	public get type(): TileType {
		return this._type;
	}
	public set type(type: TileType) {
		this._type = type;
		this._durability = type.hardness;
	}
	public get light(): number {
		return this._light;
	}
	public set light(light: number) {
		this._light = light;
	}
	public get fog(): DiscoveryLevel {
		return this._fog;
	}
	public set fog(fog: DiscoveryLevel) {
		this._fog = fog;
	}
	public get durability(): number {
		return this._durability;
	}
	public set durability(durability: number) {
		this._durability = durability;
		if (this._durability > 0) return;
		// TODO Need world reference, x, and y to do tile drops, probably let world handle that
		//for (let item of this._type)
    //  world.addEntity(new EntityItem(this.x1, this.y1, item, 30));
	}

	public draw(ui: WorldRenderer, x: number, y: number): void {
		this._type.draw(ui, x, y);
	}
	public tick(delta: number): void {
		this._type.tick(delta);
	}
}

export enum DiscoveryLevel {
	UNKNOWN,
	DISCOVERED,
	VISIBLE
}

export class TileType {
  private static _types: Map<string, TileType> = new Map<string, TileType>();
  public static addType(type: string): TileType {
    let tileType = new TileType();
    tileType._type = type;
    tileType._name = toTitleCase(type.replace('_', ' '));
    this._types.set(type, tileType);
    return tileType;
	}
	public static getType(type: string): TileType {
		if (!this._types.has(type)) throw `TileType '${type}' is not defined.`;
		return this._types.get(type);
	}
	
	private _type: string; // Basically the tiletype's id, used for serialization
	private _name: string;
	private _image: string;
	private _description: string = '';
	private _solid: boolean = true; // This is just for basic collision, might need to add directional collision later
	private _hardness: number = -1; // -1 for unbreakable
	private _draw: Function = null; // Allow for override of regular draw function that uses the _image property
	private _tick: Function = null; // Allow for implementation of tick function
	private _drop: Function = null; // Allow for override of basic drop method, such as letting a tile drop a random number of items

	public get type(): string {
		return this._type;
	}
	public get name(): string {
		return this._name;
	}
	public get image(): string {
		return this._image;
	}
	public get description(): string {
		return this._description;
	}
	public get solid(): boolean {
		return this._solid;
	}
	public get hardness(): number {
		return this._hardness;
	}
	public get canBreak(): boolean {
		return this._hardness !== -1;
	}
	public get draw(): Function {
		return this._draw === null ? function (ui: WorldRenderer, x: number, y: number) {
			// TODO Should there be draw methods without the rectangle objects? Will these need to be garbage collected?
			ui.drawImage(new Rectangle(x, y, 1, 1), this._image);
		} : this._draw;
	}
	public get tick(): Function {
		return this._tick === null ? function (delta: number) {} : this._tick;
	}
	public get drop(): Function {
		if (this._drop === null) return function (): Item[] {
			// TODO Set type of tile on Tile item to be dropped
			return new Array<Item>(new Item('Tile'));
		};
		return this._drop;
	}

	/**
	 * @param name Display name of tile type
	 * @returns Self reference for method chaining
	 */
	public setName(name: string): TileType {
		this._name = name;
		return this;
	}
	/**
	 * @param image Image address to be used as tile texture
	 * @returns Self reference for method chaining
	 */
	public setImage(image: string): TileType {
		// TODO Support tilemaps for faster rendering, probably add this when converting to WebGL
		this._image = image;
		return this;
	}
	/**
	 * @param description Description of tile type
	 * @returns Self reference for method chaining
	 */
	public setDescription(description: string): TileType {
		this._description = description;
		return this;
	}
	/**
	 * @param solid True if tile should be collidable
	 * @returns Self reference for method chaining
	 */
	public setSolid(solid: boolean): TileType {
		this._solid = solid;
		return this;
	}
	/**
	 * @param hardness The number of ticks this tile type takes to break without a modifier, -1 for unbreakable
	 * @returns Self reference for method chaining
	 */
	public setHardness(hardness: number): TileType {
		this._hardness = hardness;
		return this;
	}
	/**
	 * @param draw Function(WorldRenderer, x, y) to override default draw
	 * @returns Self reference for method chaining
	 */
	public setDraw(draw: Function): TileType {
		this._draw = draw;
		return this;
	}
	/**
	 * @param tick Function(delta) to override default tick
	 * @returns Self reference for method chaining
	 */
	public setTick(tick: Function): TileType {
		this._tick = tick;
		return this;
	}
	/**
	 * @param drop Function to generate Item[] of drops upon tile break
	 * @returns Self reference for method chaining
	 */
	public setDrop(drop: Function): TileType {
		this._drop = drop;
		return this;
	}
}