import Renderer from 'overmorrow/Renderer';
import { InputEvent, EventTypes } from 'overmorrow/Controller';
import Color from 'overmorrow/primitives/Color';
import Rectangle from 'overmorrow/primitives/Rectangle';
import UIComponent from 'overmorrow/ui/UIComponent';
declare var DEBUG;

// TODO Add static method to set default skin

export interface UISkin {
  img: HTMLImageElement,
  url: string,
  width: number,
  widthScaled: number,
	scale: number,
	paddingDefault: number,
  colorBG: Color,
  colorFG: Color
}

export default class UIPanel extends UIComponent {
  public static setDefaultSkin(skin: string, scale: number, padding: number, colorBG: Color, colorFG: Color) {
		let skinImage = new Image();
		skinImage.src = skin;
		skinImage.onload = () => {
			if (DEBUG) console.log('Loaded default skin');
			this._defaultSkin = {
				img: skinImage,
				url: skin,
				width: skinImage.width / 3,
				widthScaled: (skinImage.width / 3) * scale,
				scale: scale,
				paddingDefault: padding,
				colorBG: colorBG,
				colorFG: colorFG
			};
			for (let p of UIPanel._waitingForSkin) {
				if (p._currentSkinChange > 0) continue;
				p.skin = this._defaultSkin;
				if (DEBUG) console.log(`Set skin to default for UIPanel[${p.title}]`);
			}
		}
	}
	private static _defaultSkin: UISkin;
	private static _waitingForSkin: UIPanel[] = [];

	private _title: string = '';
	private _components: UIComponent[][] = [];
	private _currentSkinChange: number = 0;
	private _draggable: boolean = true;
	private _skin: UISkin;
	protected _padding: number = -1;

	protected get skin(): UISkin {
		return this._skin;
	}
	protected set skin(skin: UISkin) {
		// Implemented via getter and setter so children can take action when the skin is set (such as UIInventory resizing based on padding)
		this._skin = skin;
	}
	public get title(): string {
		return this._title;
	}
	public get padding(): number {
		if (this._padding !== -1)
			return this._padding;
		if (this._skin !== undefined)
			return this._skin.paddingDefault;
		return 0;
	}

	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);
		if (UIPanel._defaultSkin === undefined) UIPanel._waitingForSkin.push(this);
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
	public setSkin(skin: string, scale: number, padding: number, colorBG: Color, colorFG: Color): UIPanel {
		let skinImage = new Image();
		skinImage.src = skin;
		let skinChangeId = ++this._currentSkinChange;
		skinImage.onload = () => {
			// Prevent race conditions between changing skins too quickly
			if (this._currentSkinChange !== skinChangeId)
				return;
			this._skin = {
				img: skinImage,
				url: skin,
				width: skinImage.width / 3,
				widthScaled: (skinImage.width / 3) * scale,
				scale: scale,
				paddingDefault: padding,
				colorBG: colorBG,
				colorFG: colorFG
			};
		};
		return this;
	}
	public addComponent(component: UIComponent, zindex: number): UIPanel {
		if (this._components[zindex] === undefined)
			this._components[zindex] = [];
		this._components[zindex].push(component);
		return this;
	}
	public draw(ui: Renderer): void {
		// Draw background
		this.drawBackground(ui);
		if (this._title !== '')
			ui.drawText(this.clone().offset(this.padding, this.padding), this._title, 'Times New Roman', 16, Color.WHITE, 'left');

		// Draw components
		ui.translateContext(this.x1 + this.padding, this.y1 + this.padding);
		for (let componentArray of this._components) {
			if (componentArray === undefined)
				continue;
			for (let comp of componentArray)
				comp.draw(ui);
		}
		ui.translateContext(-(this.x1 + this.padding), -(this.y1 + this.padding));
	}
	private drawBackground(ui: Renderer): void {
		if (this._skin === undefined) return;

		// Background
		ui.drawRect(new Rectangle(
				this.x1 + this._skin.widthScaled,
				this.y1 + this._skin.widthScaled,
				this.width - 2*this._skin.widthScaled,
				this.height - 2*this._skin.widthScaled
			), this._skin.colorBG);

		// Border
		/* 0 1 2 (Render order)
				3 - 4
				5 6 7 */
		// Top
		ui.drawSprite(
			new Rectangle(
				this.x1,
				this.y1,
				this._skin.widthScaled,
				this._skin.widthScaled),
			new Rectangle(
				0,
				0,
				this._skin.width,
				this._skin.width),
			this._skin.url
		);
		ui.drawSprite(
			new Rectangle(
				this.x1 + this._skin.widthScaled,
				this.y1,
				this.width - 2*this._skin.widthScaled,
				this._skin.widthScaled),
			new Rectangle(
				this._skin.width,
				0,
				this._skin.width,
				this._skin.width),
			this._skin.url
		);
		ui.drawSprite(
			new Rectangle(
				this.x1 + this.width - this._skin.widthScaled,
				this.y1,
				this._skin.widthScaled,
				this._skin.widthScaled),
			new Rectangle(
				2*this._skin.width,
				0,
				this._skin.width,
				this._skin.width),
			this._skin.url
		);
		// Middle
		ui.drawSprite(
			new Rectangle(
				this.x1,
				this.y1 + this._skin.widthScaled,
				this._skin.widthScaled,
				this.height - 2*this._skin.widthScaled),
			new Rectangle(
				0,
				this._skin.width,
				this._skin.width,
				this._skin.width),
			this._skin.url
		);
		ui.drawSprite(
			new Rectangle(
				this.x1 + this.width - this._skin.widthScaled,
				this.y1 + this._skin.widthScaled,
				this._skin.widthScaled,
				this.height - 2*this._skin.widthScaled),
			new Rectangle(
				2*this._skin.width,
				this._skin.width,
				this._skin.width,
				this._skin.width),
			this._skin.url
		);
		// Bottom
		ui.drawSprite(
			new Rectangle(
				this.x1,
				this.y1 + this.height - this._skin.widthScaled,
				this._skin.widthScaled,
				this._skin.widthScaled),
			new Rectangle(
				0,
				2*this._skin.width,
				this._skin.width,
				this._skin.width),
			this._skin.url
		);
		ui.drawSprite(
			new Rectangle(
				this.x1 + this._skin.widthScaled,
				this.y1 + this.height - this._skin.widthScaled,
				this.width - 2*this._skin.widthScaled,
				this._skin.widthScaled),
			new Rectangle(
				this._skin.width,
				2*this._skin.width,
				this._skin.width,
				this._skin.width),
			this._skin.url
		);
		ui.drawSprite(
			new Rectangle(
				this.x1 + this.width - this._skin.widthScaled,
				this.y1 + this.height - this._skin.widthScaled,
				this._skin.widthScaled,
				this._skin.widthScaled),
			new Rectangle(
				2*this._skin.width,
				2*this._skin.width,
				this._skin.width,
				this._skin.width),
			this._skin.url
		);
	}
	public input(ui: Renderer, e: InputEvent): boolean {
		// Send events to components
		if (e.type === EventTypes.MOUSEDOWN || e.type === EventTypes.MOUSEUP) {
			e.x -= this.x1 + this.padding;
			e.y -= this.y1 + this.padding;
		}
		for (let c = this._components.length - 1; c >= 0; c--) {
			if (this._components[c] === undefined)
				continue;
			for (let comp of this._components[c]) {
				if (comp.input(ui, e))
					return true;
			}
		}
		if (e.type === EventTypes.MOUSEDOWN || e.type === EventTypes.MOUSEUP) {
			e.x += this.x1 + this.padding;
			e.y += this.y1 + this.padding;
		}
		
		// Process panel events such as dragging
		if (e.type === EventTypes.MOUSEDOWN && this.contains(e.x, e.y)) {
			ui.selectComponent(this);
			return true;
		} else if (e.type === EventTypes.MOUSEUP) {
			ui.selectComponent(null);
			return true;
		} else if (e.type === EventTypes.MOUSEMOVE && this.selected && this._draggable) {
			this.x1 -= e.dx;
			this.y1 -= e.dy;
			return true;
		}

		return false;
	}
}