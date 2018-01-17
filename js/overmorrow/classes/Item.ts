import World from "./World";
import EntityLiving from "./EntityLiving";
import { toTitleCase, directionToVector, degreesToDirection } from "../Utilities";

export default class Item {
  public quantity: number;
  public quality: ItemQuality;
  public name: string;
  public description: string;
  public power: number;

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
    if (this._type === undefined || this.power === this._type.power)
      this.power = type.power;
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
  private _canAttack: boolean = false;
  private _canBlock: boolean = false;
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
    this._canAttack = isWeapon;
    if (this._action === null) {
      this._action = function (item: Item, world: World, user: EntityLiving) {
        // TODO Implement range for weapons like spears (will need to also rework defendAgainst() to multiple the attack vector's magnitude by the range)
        // Call defendAgainst() on all the entities within the attack area

        // Ahead
        for (let e of world.getEntitiesAt(user.x1 + directionToVector(user.direction).x, user.y1 + directionToVector(user.direction).y))
          if (e instanceof EntityLiving)
            (e as EntityLiving).defendAgainst(user, item);
        // Right
        for (let e of world.getEntitiesAt(user.x1 + directionToVector(degreesToDirection(user.direction + 45)).x, user.y1 + directionToVector(degreesToDirection(user.direction + 45)).y))
          if (e instanceof EntityLiving)
            (e as EntityLiving).defendAgainst(user, item);
        // Left
        for (let e of world.getEntitiesAt(user.x1 + directionToVector(degreesToDirection(user.direction - 45)).x, user.y1 + directionToVector(degreesToDirection(user.direction - 45)).y))
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
}

export enum ItemRarity {
  MYTHIC,
  RARE,
  UNCOMMON,
  COMMON
}