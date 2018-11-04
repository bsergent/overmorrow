import Item, { ItemType } from "./Item";

export default class Inventory {
  protected _contents: Item[] = [];

  public name: string;
  public get size(): number {
    return this._contents.length;
  }

  constructor(size: number, name: string = 'Inventory') {
    for (let s = 0; s < size; s++)
      this._contents.push(null);
    this.name = name;
  }

  public addItem(item: Item): Item {
    // Stack with existing items
    for (let i = 0; i < this._contents.length && item.quantity > 0; i++)
      if (this._contents[i] !== null)
        this._contents[i].stack(item);
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

  public getItemAt(index: number): Item {
    this.refresh();
    if (index < 0 || index > this._contents.length) return null;
    return this._contents[index];
  }

  public getItems(): Item[] {
    this.refresh();
    return this._contents.filter(item => item !== null);
  }

  public getAllItems(): Item[] {
    this.refresh();
    return this._contents;
  }

  public getItemsByType(type: string): Item[] {
    this.refresh();
    return this._contents.filter(item => item !== null && item.type.type === type);
  }

  // Returns whatever used to be at the index
  public putItemAt(item: Item, index: number): Item {
    if (index < 0 || index > this._contents.length) throw `Index ${index} out of bounds for Inv[${this.name}] of size ${this.size}.`;
    let prev = this._contents[index];
    this._contents[index] = item;
    this.refresh();
    return prev;
  }

  public removeItem(item: Item): Item {
    // Returns whatever items could not be removed (due to inexistence)
    throw new Error("Method not implemented.");
  }

  public removeItemAt(index: number): Item {
    let item = this._contents[index];
    this._contents[index] = null;
    return item;
  }

  /**
   * Set all items of quantity 0 to null
   */
  protected refresh() {
    for (let i = 0; i < this._contents.length; i++)
      if (this._contents[i] !== null && this._contents[i].quantity === 0)
        this._contents[i] = null;
  }
}