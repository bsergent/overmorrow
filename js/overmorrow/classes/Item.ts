import World from "./World";
import EntityLiving from "./EntityLiving";
import { toTitleCase } from "../Utilities";

export default class Item {
  public quantity: number;
  public quality: ItemQuality;
  public name: string;
  public description: string;

  private _type: ItemType;

  public get type(): ItemType {
    return this._type;
  }
  public set type(type: ItemType) {
    // Also change name and description if still default
    if (this._type === undefined || this.name === this._type.name)
      this.name = type.name;
    if (this._type === undefined || this.description === this._type.description)
      this.description = type.description;
    this._type = type;
  }
  public get image(): string {
    return this.type.image; // TODO Probably give the option to use an animation sheet later
  }

  constructor(type: string, quantity: number = 1) {
    this.type = ItemType.types.get(type);
    this.quantity = quantity;
  }

  public canStack(item: Item): boolean {
    return this.type === item.type
      && this.name === item.name
      && this.description === item.description
      && this.quality === item.quality;
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
  public static types: Map<string, ItemType> = new Map<string, ItemType>();

  public static addType(type: string): ItemType {
    let itemType = new ItemType();
    itemType._type = type;
    itemType._name = toTitleCase(type.replace('_', ' '));
    this.types.set(type, itemType);
    return itemType;
  }

  private _type: string;
  private _name: string;
  private _image: string;
  private _description: string;
  private _maxQuantity: number = 1;
  private _rarity: ItemRarity;
  private _isWeapon: boolean = false;
  private _isShield: boolean = false;
  private _power: number = 0;
  private _range: number = 1;
  private _action: Function = null;

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
  public get isWeapon(): boolean {
    return this._isWeapon;
  }
  public get isShield(): boolean {
    return this._isShield;
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
  public setWeapon(isWeapon: boolean): ItemType {
    this._isWeapon = isWeapon;
    if (this._action === null) {
      this._action = function (item: Item, world: World, user: EntityLiving) {
        // TODO Finish the default attack with melee weapon
        // Get entities in range and direction facing
        // Call defendAgainst() on them
      }
    }
    return this;
  }
  public setShield(isShield: boolean): ItemType {
    this._isShield = isShield;
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
}

export enum ItemRarity {
  MYTHIC,
  RARE,
  UNCOMMON,
  COMMON
}