import Item, { ItemType } from "./Item";

export default class Inventory {
  private _contents: Item[];

  public name: string;
  public get size(): number {
    return this._contents.length;
  }

  constructor(size: number) {
    this._contents = new Item[size];
  }

  public addItem(item: Item): Item {
    // Returns whatever items could not be added (due to inventory full)
    throw new Error("Method not implemented.");
  }

  public getItems(): Item[] {
    return this._contents;
  }

  public getItemsByType(type: ItemType): Item[] {
    throw new Error("Method not implemented.");
  }

  public removeItem(item: Item): Item {
    // Returns whatever items could not be removed (due to inexistence)
    throw new Error("Method not implemented.");
  }
}