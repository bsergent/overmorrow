export default class Item {
  public quantity: number;
  public quality: ItemQuality;
  public name: string;
  public description: string;

  private _type: ItemType;
  private _rarity: ItemRarity;
  private _isWeapon: boolean;
  private _hasAction: boolean;

  public get type(): ItemType {
    return this._type;
  }
  public set type(type: ItemType) {
    this._type = type;
    // TODO Update rarity and flags
  }
  public get image(): string {
    return `assets/item_${ItemType[this.type].toLowerCase()}.png`;
  }

  constructor(type: ItemType, quantity: number = 1) {
    this.type = type;
    this.quantity = quantity;
  }
}

export enum ItemType {
  SWORD_OBSIDIAN,
  TORCH,
  LANTERN,
  SHIELD_WOODEN,
  BOOK_OF_WYNN,
  BOW
}

export enum ItemQuality {
  EXCELLENT,
  GOOD,
  AVERAGE,
  POOR,
  AWFUL
}

export enum ItemRarity {
  MYTHIC,
  RARE,
  UNCOMMON,
  COMMON
}