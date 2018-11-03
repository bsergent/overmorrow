import Inventory from "../classes/Inventory";
import Renderer from "../Renderer";
import { InputEvent } from "../Controller";
import Item from "../classes/Item";
import UIPanel, { UISkin } from "./UIPanel";
import Rectangle from "../primitives/Rectangle";
import Color from "../primitives/Color";

// TODO Make this abstract after testing
// TODO Implement static stuff to handle dragging items between inventories
export default class UIInventory extends UIPanel {
	protected _inventory: Inventory;
	private _selectedItem: Item;
	private _gridWidth: number;
	private _gridHeight: number;
	private _cellWidth: number;
	private _cellColor: Color = new Color(0, 0, 0, 0.2);
	private _cellTextBGColor: Color = new Color(0, 0, 0, 0.5);
	private _cellTextSize: number = 10;

	public get gridWidth(): number {
		return this._gridWidth;
	}
	public get gridHeight(): number {
		return this._gridHeight;
	}
	public get skin(): UISkin {
		return super.skin;
	}
	public set skin(skin: UISkin) {
		super.skin = skin;
		this.updateDimensions();
	}

	// TODO Support InventoryPositional more later
	constructor(x: number, y: number, cellWidth: number, gridWidth: number, gridHeight: number, inv: Inventory) {
		super(x, y, gridWidth * cellWidth, gridHeight * cellWidth + 18);
		this._gridWidth = gridWidth;
		this._gridHeight = gridHeight;
		this._cellWidth = cellWidth;
		this._inventory = inv;
		this.setTitle(inv.name);
	}

	private updateDimensions(): void {
		this.width = this._gridWidth * this._cellWidth + 2 * this.padding;
		this.height = this._gridHeight * this._cellWidth + 2 * this.padding + 18;
	}

	public setPadding(padding: number): UIPanel {
		this._padding = padding;
		this.updateDimensions();
		return this;
	}

	public draw(ui: Renderer): void {
		super.draw(ui);
		
		// Draw item grid
		let rect: Rectangle = new Rectangle(0, 0, this._cellWidth, this._cellWidth);
		for (let y = 0; y < this._gridHeight; y++) {
			for (let x = 0; x < this._gridWidth; x++) {
				rect.x1 = x * rect.width + this.padding + this.x1;
				rect.y1 = y * rect.width + this.padding + this.y1 + 18;
				ui.drawRectWire(rect, this._cellColor);
			}
		}

		// Draw items in grid
		let item: Item;
		for (let y = 0; y < this._gridHeight; y++) {
			for (let x = 0; x < this._gridWidth; x++) {
				rect.x1 = x * rect.width + this.padding + this.x1;
				rect.y1 = y * rect.width + this.padding + this.y1 + 18;
				item = this._inventory.getAllItems()[y*this._gridWidth+x];
				if (item !== null) {
					ui.drawImage(rect, item.image);
					if (item.quantity > 1 && this.skin !== undefined) {
						let textDims = ui.measureText('' + item.quantity, 'Times New Roman', this._cellTextSize);
						ui.drawRect(new Rectangle(
								rect.x1 + this._cellWidth - textDims.x - 2,
								rect.y1 + this._cellWidth - textDims.y,
								textDims.x + 2,
								textDims.y),
							this._cellTextBGColor);
						ui.drawText(rect.offset(this._cellWidth - 1, this._cellWidth - this._cellTextSize + 2),
							'' + item.quantity, 'Times New Roman',
							this._cellTextSize, this.skin.colorFG, 'right');
					}
				}
			}
		}
		
		// Draw selected item at cursor
	}

  public input(ui: Renderer, e: InputEvent): boolean {
		if (super.input(ui, e)) return true;
		// TODO Handle drag and drop
    return false; // Return true if event is consumed
  }
}