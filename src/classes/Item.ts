import World from "./World";
import EntityLiving from "./EntityLiving";
import { toTitleCase, directionToVector, degreesToDirection } from "../Utilities";

export default class Item {
  public quality: ItemQuality = ItemQuality.AVERAGE;
  public name: string;
  public description: string;
  public power: number;
  private _quantity: number;
  private _type: ItemType;

  public get quantity(): number {
    return this._quantity;
  }
  public set quantity(amt: number) {
    if (amt < 0) amt = 0;
    this._quantity = amt;
  }
  public get type(): ItemType {
    return this._type;
  }
  public set type(type: ItemType) {
    // Also change name and description if still default
    if (this._type === undefined || this.name === this._type.name)
      this.name = type.name;
    if (this._type === undefined || this.description === this._type.description)
      this.description = type.description;
    if (this._type === undefined || this.power === this._type.power)
      this.power = type.power;
    this._type = type;
  }
  public get image(): string {
    return this.type.image; // TODO Add option to use an animation/sprite sheet
  }

  constructor(type: string, quantity: number = 1) {
    this.type = ItemType.getType(type);
    this.quantity = quantity;
  }

  /**
   * Check if items meet the criteria to stack together
   * @param item Item to be stacked
   */
  public canStack(item: Item): boolean {
    return this.type === item.type
      && this.name === item.name
      && this.description === item.description
      && this.quality === item.quality;
  }

  /**
   * Stack item parameter on this item
   * @param src Source item to stack on this target item (src.quantity may decrease)
   * @returns Number of item(s) that could not be stacked
   */
  public stack(src: Item): number {
    if (this.canStack(src)) {
      let amt = Math.min(src.quantity, this.type.maxQuantity - this._quantity);
      src.quantity -= amt;
      this.quantity += amt;
    }
    return src.quantity;
  }
}

export enum ItemQuality {
  EXCELLENT,
  GOOD,
  AVERAGE,
  POOR,
  AWFUL
}

export class ItemType {
  private static _types: Map<string, ItemType> = new Map<string, ItemType>();
  public static addType(type: string): ItemType {
    let itemType = new ItemType();
    itemType._type = type;
    itemType._name = toTitleCase(type.replace('_', ' '));
    this._types.set(type, itemType);
    return itemType;
  }
	public static getType(type: string): ItemType {
		if (!this._types.has(type)) throw `ItemType '${type}' is not defined.`;
		return this._types.get(type);
	}

  private _type: string;
  private _name: string;
  private _image: string;
  private _description: string = '';
  private _maxQuantity: number = 1;
  private _rarity: ItemRarity = ItemRarity.COMMON;
  private _weight: number = 0;
  private _canAttack: boolean = false;
  private _canBlock: boolean = false;
  private _power: number = 0;
  private _range: number = 1;
  private _action: Function = null;
  private _invWidth: number = 1;
  private _invHeight: number = 1;

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
  public get maxQuantity(): number {
    return this._maxQuantity;
  }
  public get rarity(): ItemRarity {
    return this._rarity;
  }
  public get weight(): number {
    return this._weight;
  }
  public get canAttack(): boolean {
    return this._canAttack;
  }
  public get canBlock(): boolean {
    return this._canBlock;
  }
  public get power(): number {
    return this._power;
  }
  public get range(): number {
    return this._range;
  }
  public get action(): Function {
    return this._action === null ? function (item: Item, world: World, user: EntityLiving) {} : this._action;
  }
  public get invWidth(): number {
    return this._invWidth;
  }
  public get invHeight(): number {
    return this._invHeight;
  }

  public setName(name: string): ItemType {
    this._name = name;
    return this;
  }
  public setImage(image: string): ItemType {
    this._image = image;
    return this;
  }
  public setDescription(description: string): ItemType {
    this._description = description;
    return this;
  }
  public setMaxQuantity(max: number): ItemType {
    this._maxQuantity = max;
    return this;
  }
  public setRarity(rarity: ItemRarity): ItemType {
    this._rarity = rarity;
    return this;
  }
  public setWeight(weight: number): ItemType {
    this._weight = weight;
    return this;
  }
  public setWeapon(isWeapon: boolean): ItemType {
    this._canAttack = isWeapon;
    if (this._action === null) {
      this._action = function (item: Item, world: World, user: EntityLiving) {
        // TODO Implement range for weapons like spears (will need to also rework defendAgainst() to multiple the attack vector's magnitude by the range)
        // Call defendAgainst() on all the entities within the attack area

        // Ahead
        for (let e of world.getEntitiesAt(user.x1 + directionToVector(user.direction).x + 0.5, user.y1 + directionToVector(user.direction).y + 0.5))
          if (e instanceof EntityLiving)
            (e as EntityLiving).defendAgainst(user, item);
        // Right
        for (let e of world.getEntitiesAt(user.x1 + directionToVector(degreesToDirection(user.direction + 45)).x + 0.5, user.y1 + directionToVector(degreesToDirection(user.direction + 45)).y + 0.5))
          if (e instanceof EntityLiving)
            (e as EntityLiving).defendAgainst(user, item);
        // Left
        for (let e of world.getEntitiesAt(user.x1 + directionToVector(degreesToDirection(user.direction - 45)).x + 0.5, user.y1 + directionToVector(degreesToDirection(user.direction - 45)).y + 0.5))
          if (e instanceof EntityLiving)
            (e as EntityLiving).defendAgainst(user, item);
      }
    }
    return this;
  }
  public setShield(isShield: boolean): ItemType {
    this._canBlock = isShield;
    return this;
  }
  public setPower(power: number): ItemType {
    this._power = power;
    return this;
  }
  public setRange(range: number): ItemType {
    this._range = range;
    return this;
  }
  public setAction(action: Function): ItemType {
    this._action = action;
    return this;
  }
  public setInventoryDimensions(width: number, height: number): ItemType {
    this._invWidth = width;
    this._invHeight = height;
    return this;
  }
}

export enum ItemRarity {
  MYTHIC,
  RARE,
  UNCOMMON,
  COMMON
}

ItemType.addType('tile')
  .setName('Tile'); // TODO Add proper tile item, if necessary, might just make all tiles drop items