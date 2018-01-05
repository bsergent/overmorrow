import Item, { ItemType } from "./Item";

export default class Inventory {
  private _contents: Item[] = [];

  public name: string;
  public get size(): number {
    return this._contents.length;
  }

  constructor(size: number) {
    for (let s = 0; s < size; s++)
      this._contents.push(null);
  }

  public addItem(item: Item): Item {
    // Stack with existing items
    for (let i = 0; i < this._contents.length && item.quantity > 0; i++) {
      if (this._contents[i] !== null && this._contents[i].canStack(item)) {
        let amtToAdd = Math.min(item.type.maxQuantity - this._contents[i].quantity, item.quantity);
        item.quantity -= amtToAdd;
        this._contents[i].quantity += amtToAdd;
      }
    }
    // Place remaining in empty slots
    for (let i = 0; i < this._contents.length && item.quantity > 0; i++) {
      if (this._contents[i] === null) {
        this._contents[i] = item;
        return null;
      }
    }
    // Returns whatever item could not be added, null if all were added
    return item.quantity > 0 ? item : null;
  }

  public getItems(): Item[] {
    return this._contents.filter(item => item !== null);
  }

  public getItemsByType(type: string): Item[] {
    return this._contents.filter(item => item !== null && item.type.type === type);
  }

  public removeItem(item: Item): Item {
    // Returns whatever items could not be removed (due to inexistence)
    throw new Error("Method not implemented.");
  }
}