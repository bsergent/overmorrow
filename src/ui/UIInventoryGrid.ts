import UIInventory from "./UIInventory";
import Inventory from "../classes/Inventory";
import Vector from "../primitives/Vector";

export default class UIInventoryGrid extends UIInventory {
	protected _gridWidth: number;
	protected _gridHeight: number;
  
	constructor(x: number, y: number, cellSize: number, gridWidth: number, gridHeight: number, inv: Inventory) {
    if (gridWidth * gridHeight < inv.size)
      throw `Inventory size (${inv.size}) be less than total number of possible cells (${gridWidth*gridHeight}).`;
    let cellPos: Vector[] = [];
    let i = 0;
    outer:
		for (let y = 0; y < gridHeight; y++) {
			for (let x = 0; x < gridWidth; x++) {
        if (i >= inv.size) break outer;
        cellPos.push(new Vector(x * cellSize, y * cellSize));
        i++;
			}
		}
		//cellPos[(gridHeight-1)*(gridWidth+1)] = new Vector(96+2*24, 24+12);
    super(x, y, cellSize, inv, cellPos);
    this._gridWidth = gridWidth;
    this._gridHeight = gridHeight;
		
	}
}