import Renderer from '../Renderer';
import { InputEvent, EventTypes } from '../Controller';
import Color from '../primitives/Color';
import Rectangle from '../primitives/Rectangle';
import UIComponent from './UIComponent';
import { BorderPatch } from './BorderPatch';
declare var DEBUG;

export default class UIPanel extends UIComponent {
  public static setDefaultBorderPatch(url: string) {
		this._defaultBorderPatch = new BorderPatch(url);
		// this._defaultBorderPatch.onload.push(() => {
		// 	if (DEBUG) console.log('Loaded default skin');
		// });
	}
	private static _defaultBorderPatch: BorderPatch = new BorderPatch('');

	protected _title: string = '';
	private _components: UIComponent[][] = [];
	protected _draggable: boolean = true;
	protected _borderPatch: BorderPatch;
	protected _padding: number = -1;
	protected _drawTitle: boolean = true;

	protected get borderPatch(): BorderPatch {
		return this._borderPatch;
	}
	protected set borderPatch(bp: BorderPatch) {
		// Implemented via getter and setter so children can take action when the skin is set (such as UIInventory resizing based on padding)
		this._borderPatch = bp;
	}
	public get title(): string {
		return this._title;
	}
	public get drawSpace(): Rectangle {
		if (!this._borderPatch.loaded) return new Rectangle(0, 0, 0, 0);
		return this.clone()
				.offset(this._borderPatch.padding.left, this._borderPatch.padding.top)
				.shrink(this._borderPatch.padding.horizontal, this._borderPatch.padding.vertical);
	}

	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);
		this._borderPatch = UIPanel._defaultBorderPatch;
	}

	public setTitle(title: string): UIPanel {
		this._title = title;
		return this;
	}
	public setPadding(padding: number): UIPanel {
		this._padding = padding;
		return this;
	}
	public setDraggable(draggable: boolean): UIPanel {
		this._draggable = draggable;
		return this;
	}
	public setBorderPatch(url: string): UIPanel {
		this._borderPatch = new BorderPatch(url);
		this._borderPatch.onload.push(() => {
		});
		return this;
	}
	public addComponent(component: UIComponent, zindex: number): UIPanel {
		if (this._components[zindex] === undefined)
			this._components[zindex] = [];
		this._components[zindex].push(component);
		return this;
	}
	public draw(ui: Renderer): void {
		if (!this._borderPatch.loaded) return;
		// Draw background
		this._borderPatch.draw(ui, this);
		if (this._title !== '' && this._borderPatch.loaded && this._drawTitle)
			ui.drawText(this.clone().offset(this._borderPatch.padding.left, this._borderPatch.padding.top), this._title, this._borderPatch.font, 16, this._borderPatch.loaded ? this._borderPatch.fg_color : Color.WHITE, 'left');

		// Draw components
		ui.translateContext(this.x1 + this._borderPatch.padding.left, this.y1 + this._borderPatch.padding.top);
		for (let componentArray of this._components) {
			if (componentArray === undefined)
				continue;
			for (let comp of componentArray)
				comp.draw(ui);
		}
		ui.translateContext(-(this.x1 + this._borderPatch.padding.left), -(this.y1 + this._borderPatch.padding.top));

		if (DEBUG && this._borderPatch.loaded) {
			ui.drawText(
				new Rectangle(this.x1 + 24, this.y2 + 2, 0, 0),
				this._borderPatch.image, 'Courier New', 12,
				Color.WHITE.clone().setAlpha(0.5), 'left');
			ui.drawRectWire(this.clone()
				.shrink(
					2 * this._borderPatch.padding.right,
					2 * this._borderPatch.padding.bottom)
				.offset(
					this._borderPatch.padding.left,
					this._borderPatch.padding.top)
				, Color.WHITE.clone().setAlpha(0.3));
		}
	}
	public input(ui: Renderer, e: InputEvent): boolean {
		if (!this._borderPatch.loaded) return;
		// Send events to components
		if (e.type === EventTypes.MOUSEDOWN || e.type === EventTypes.MOUSEUP || e.type === EventTypes.MOUSEMOVE) {
			e.x -= this.x1 + this._borderPatch.padding.left;
			e.y -= this.y1 + this._borderPatch.padding.top;
		}
		for (let c = this._components.length - 1; c >= 0; c--) {
			if (this._components[c] === undefined)
				continue;
			for (let comp of this._components[c]) {
				if (comp.input(ui, e))
					return true;
			}
		}
		if (e.type === EventTypes.MOUSEDOWN || e.type === EventTypes.MOUSEUP || e.type === EventTypes.MOUSEMOVE) {
			e.x += this.x1 + this._borderPatch.padding.left;
			e.y += this.y1 + this._borderPatch.padding.top;
		}
		
		// Process panel events such as dragging
		if (e.type === EventTypes.MOUSEDOWN && this.contains(e.x, e.y)) {
			ui.selectComponent(this);
			return true;
		} else if (e.type === EventTypes.MOUSEUP || e.type === EventTypes.MOUSELEAVE) {
			ui.selectComponent(null);
			return true;
		} else if (e.type === EventTypes.MOUSEMOVE && this.selected && this._draggable) {
			this.x1 -= e.dx;
			this.y1 -= e.dy;
			if (this.x1 < 0) this.x1 = 0;
			if (this.y1 < 0) this.y1 = 0;
			if (this.x2 > ui.width) this.x1 = ui.width - this.width;
			if (this.y2 > ui.height) this.y1 = ui.height - this.height;
			return true;
		}

		return false;
	}
}