import Inventory from "../classes/Inventory";
import Renderer from "../Renderer";
import { InputEvent, Event, EventTypes, Controller, Keys, Listener } from "../Controller";
import Item, { ItemQuality, ItemRarity } from "../classes/Item";
import UIPanel, { UISkin } from "./UIPanel";
import Rectangle from "../primitives/Rectangle";
import Color from "../primitives/Color";
import Vector from "../primitives/Vector";
import { toTitleCase } from "../Utilities";
declare var DEBUG;

export default abstract class UIInventory extends UIPanel {
	protected static _selectedItem: Item = null;
	protected static _selectedItemSource: UIInventory = null;

	protected _inventory: Inventory;
  protected _listeners: Listener[] = [];
	protected _cellPositions: Vector[] = []; // Positions relative to padding
	protected _cellSize: number;
	protected _cellColor: Color = Color.BLACK.clone().setAlpha(0.2);
	protected _cellColorHover: Color = Color.BLACK.clone().setAlpha(0.3);
	protected _cellTextBGColor: Color = new Color(0, 0, 0, 0.7);
	protected _cellTextSize: number = 10;
	protected _autoResize: boolean = true;
	protected _cellHovered: number = -1;
	protected _cellSelected: number = -1;
	// Ex: (12, 3) will be 12 pixels right of the left padding and 3 pixels below the upper padding and title

	public get skin(): UISkin {
		return super.skin;
	}
	public set skin(skin: UISkin) {
		super.skin = skin;
		this.updateDimensions();
	}

	constructor(x: number, y: number, cellSize: number, inv: Inventory, cellPositions: Vector[]) {
		super(x, y, 0, 0);
		this._cellSize = cellSize;
		this._inventory = inv;
		this._cellPositions = cellPositions;
		this.setTitle(inv.name);
		this.updateDimensions();
		// TODO Figure out how inventory positional is going to work with an array of cell positions (adjacency list)
	}

	// TODO Support custom dimensions
	protected updateDimensions(): void {
		if (!this._autoResize) return;
		let width = 0;
		let height = 0;
		for (let pos of this._cellPositions) {
			width = Math.max(width, pos.x + this._cellSize);
			height = Math.max(height, pos.y + this._cellSize);
		}
		this.width = width + 2 * this.padding;
		this.height = height + 2 * this.padding + (this.title !== '' ? 18 : 0);
		//console.log(`Inv[${this.title}] dimensions set to ${this.width}x,${this.height}y`);
	}

	protected setCellPositions(positions: Vector[]): UIInventory {
		if (positions.length !== this._inventory.size) throw `Length of positions vector for Inv[${this.title}] (${positions.length}) must equal the inventory size (${this._inventory.size}).`;
		this._cellPositions = positions;
		this.updateDimensions();
		return this;
	}

	public setPadding(padding: number): UIInventory {
		// if (padding !== this._padding)
		// 	this.width = this.width - 2*this._padding + 2*padding;
		this._padding = padding;
		return this;
	}

	public setInventory(inventory: Inventory): UIInventory {
		if (inventory === null) throw 'Cannot set UIInventory\'s inventory to null.';
		this._inventory = inventory;
		return this;
	}

	public draw(ui: Renderer): void {
		super.draw(ui);
		
		// Draw item grid
		let rect: Rectangle = new Rectangle(0, 0, this._cellSize - 2, this._cellSize - 2);
		for (let c = 0; c < this._cellPositions.length; c++) {
			let cell = this._cellPositions[c];
			rect.x1 = this.x1 + this.padding + cell.x + 1;
			rect.y1 = this.y1 + this.padding + cell.y + (this.title !== '' ? 18 : 0) + 1;
			ui.drawRect(rect, c === this._cellHovered ? this._cellColorHover : this._cellColor);
		}

		// Draw items in grid
		let item: Item;
		rect.width = this._cellSize;
		rect.height = this._cellSize;
		for (let c = 0; c < this._cellPositions.length; c++) {
			let pos = this._cellPositions[c];
			rect.x1 = this.x1 + this.padding + pos.x;
			rect.y1 = this.y1 + this.padding + pos.y + (this.title !== '' ? 18 : 0);
			item = this._inventory.getItemAt(c);
			if (item !== null) {
				ui.drawImage(rect, item.image, c === this._cellSelected ? 0.2 : 1.0);
				if (item.quantity > 1 && this.skin !== undefined) {
					let textDims = ui.measureText('' + item.quantity, 'Times New Roman', this._cellTextSize);
					ui.drawRect(new Rectangle(
							rect.x1 + this._cellSize - textDims.x - 2,
							rect.y1 + this._cellSize - textDims.y,
							textDims.x + 2,
							textDims.y),
						this._cellTextBGColor);
					ui.drawText(rect.offset(this._cellSize - 1, this._cellSize - this._cellTextSize + 2),
						'' + item.quantity, 'Times New Roman',
						this._cellTextSize, this.skin.colorFG, 'right');
				}
			}
		}
		
		// Draw selected item at cursor
		if (UIInventory._selectedItem !== null && this._cellSelected !== -1) {
			let cur = Controller.getCursor();
			rect.x1 = cur.x - this._cellSize / 2;
			rect.y1 = cur.y - this._cellSize / 2;
			ui.drawImage(rect, UIInventory._selectedItem.image);
		}

		// Draw hovered item label
		if (this._inventory.getItemAt(this._cellHovered) !== null) {
			let cur = Controller.getCursor();
			let item = this._inventory.getItemAt(this._cellHovered);
			let text = item.name;
			if (Controller.isKeyDown(Keys.KEY_SHIFT)) {
				text += `\nQuality: ${toTitleCase(ItemQuality[item.quality])}`;
				text += `\nRarity: ${toTitleCase(ItemRarity[item.type.rarity])}`;
				if (item.description !== '') text += `\n${item.description}`;
			}
			let textSize = ui.measureText(text, 'Times New Roman', 16, 2);
			let padding = 3;
			rect.x1 = cur.x - padding;
			rect.y1 = cur.y - textSize.y - 2*padding - 2;
			rect.width = textSize.x + 2*padding;
			rect.height = textSize.y + 2*padding;
			if (rect.x1 < 0) rect.x1 = 0;
			if (rect.y1 < 0) rect.y1 = 0;
			if (rect.x2 > ui.width) rect.x1 = ui.width - rect.width;
			if (rect.y2 > ui.height) rect.y1 = ui.height - rect.height;
			ui.drawRect(rect, this._cellTextBGColor);
			ui.drawRectWire(rect, this.skin.colorFG);
			rect.x1 += padding;
			rect.y1 += padding;
			ui.drawText(rect, text, 'Times New Roman', 16, Color.WHITE, 'left', 2);
			// TODO Draw this above all other UIInventory on same layer, not sure how to go about that yet though
		}
	}

	protected getCellAtCursor(x: number, y: number): number {
		let cell: Rectangle = new Rectangle(0, 0, this._cellSize, this._cellSize);
		for (let c = 0; c < this._cellPositions.length; c++) {
			let pos = this._cellPositions[c];
			cell.x1 = this.x1 + this.padding + pos.x;
			cell.y1 = this.y1 + this.padding + pos.y + (this.title !== '' ? 18 : 0);
			if (cell.contains(x, y)) return c;
		}
		return -1;
	}

  public input(ui: Renderer, e: InputEvent): boolean {
		switch (e.type) {
			case EventTypes.MOUSEMOVE:
				// Hovered cells
				this._cellHovered = this.getCellAtCursor(e.x, e.y);
				break;
			case EventTypes.MOUSEUP:	
				if (UIInventory._selectedItem !== null && this._cellHovered !== -1) {
					// Dropping/swapping/stacking items
					// TODO Implement picking up half of a stack
					// TODO Implement putting down one item of a stack
					if (DEBUG) console.log(`Moving Item[${UIInventory._selectedItem.name}] from Inv[${UIInventory._selectedItemSource.title}][${UIInventory._selectedItemSource._cellSelected}] to Inv[${this.title}][${this._cellHovered}]`);
					let src = UIInventory._selectedItem;
					let dest = this._inventory.getItemAt(this._cellHovered);
					if (dest === null) {
						this._inventory.putItemAt(src, this._cellHovered);
						UIInventory._selectedItemSource._inventory.removeItemAt(UIInventory._selectedItemSource._cellSelected);
						if (DEBUG) console.log('Moved');
					} else {
						if (dest.canStack(src)) {
							src.quantity = dest.stack(src);
							if (DEBUG) console.log('Stacked');
						} else {
							this._inventory.putItemAt(src, this._cellHovered);
							UIInventory._selectedItemSource._inventory.putItemAt(dest, UIInventory._selectedItemSource._cellSelected);
							if (DEBUG) console.log('Swapped');
						}
					}
					let e: InventoryEvent = new InventoryEvent(
						UIInventory._selectedItemSource._inventory, 
						UIInventory._selectedItemSource._cellSelected,
						this._inventory, 
						this._cellHovered,
						UIInventory._selectedItem);
					for (let l of this._listeners)
						l.action(e);
					UIInventory._selectedItemSource._cellSelected = -1;
					UIInventory._selectedItem = null;
					ui.selectComponent(null);
					return true;
				}
			case EventTypes.MOUSEDOWN:
				// Picking up items
				if (UIInventory._selectedItem === null && this._cellHovered !== -1 && this._inventory.getItemAt(this._cellHovered) !== null) {
					this._cellSelected = this._cellHovered;
					UIInventory._selectedItem = this._inventory.getItemAt(this._cellSelected);
					UIInventory._selectedItemSource = this;
					ui.selectComponent(this);
					return true;
				}
		}
		if (this._cellHovered === -1 && UIInventory._selectedItem === null)
			if (super.input(ui, e))
				return true;
		return false; // Return true if event is consumed
	}

  public addListener(type: EventTypes): Listener {
    let l = new Listener(type);
    this._listeners.push(l);
    return l;
  }
}

export class InventoryEvent extends Event {
	fromInv: Inventory;
	fromIndex: number;
	toInv: Inventory;
	toIndex: number;
	item: Item;
	constructor(fromInv: Inventory, fromIndex: number, toInv: Inventory, toIndex: number, item: Item) {
		super(EventTypes.INVMOVE);
		this.fromInv = fromInv;
		this.fromIndex = fromIndex;
		this.toInv = toInv;
		this.toIndex = toIndex;
		this.item = item;
	}
}