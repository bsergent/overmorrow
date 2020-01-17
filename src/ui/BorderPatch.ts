import Rectangle from "../primitives/Rectangle";
import Color from "../primitives/Color";
import Renderer from "../Renderer";
declare var DEBUG;

export interface PatchJSON {
	x: number,
	y: number,
	width: number,
	height: number,
	method: 'repeat'|'stretch'|undefined
}
export interface PaddingJSON {
	top: number,
	right: number,
	bottom: number,
	left: number
}
export interface BorderPatchJSON {
	image: string,
	scale: number,
	font: string,
	fg_color: string,
	padding: PaddingJSON,
	patches: {
		upperleft: PatchJSON,
		uppermiddle: PatchJSON,
		upperright: PatchJSON,
		middleleft: PatchJSON
		middlemiddle: PatchJSON,
		middleright: PatchJSON,
		lowerleft: PatchJSON,
		lowermiddle: PatchJSON,
		lowerright: PatchJSON
	}
}
export class Patch extends Rectangle {
	public method: 'repeat'|'stretch'|undefined;
	constructor(json: PatchJSON) {
		super(json.x, json.y, json.width, json.height);
		this.method = json.method;
	}
}

export class Padding {
	public top: number = 0;
	public right: number = 0;
	public bottom: number = 0;
	public left: number = 0;
	public get horizontal(): number {
		return this.right + this.left;
	}
	public get vertical(): number {
		return this.top + this.bottom;
	}
	constructor(json: PaddingJSON, scale: number) {
		this.top = json.top * scale;
		this.right = json.right * scale;
		this.bottom = json.bottom * scale;
		this.left = json.left * scale;
	}
}

export class BorderPatch {
	private _loaded: boolean = false;
	public onload: Function[] = [];
	public get loaded(): boolean {
		return this._loaded;
	}
	private _url: string;
	public get url(): string {
		return this._url;
	}

	public patches: {
		upperleft: Patch,
		uppermiddle: Patch,
		upperright: Patch,
		middleleft: Patch
		middlemiddle: Patch,
		middleright: Patch,
		lowerleft: Patch,
		lowermiddle: Patch,
		lowerright: Patch
	};
	public padding: Padding = null;
	public image: string = '';
	public scale: number = 1;
	public font: string = '';
	public fg_color: Color = Color.BLACK;
	public get minwidth(): number {
		return (this.patches.upperleft.width + this.patches.upperright.width) * this.scale;
	}
	public get minheight(): number {
		return (this.patches.upperleft.height + this.patches.upperright.height) * this.scale;
	}
	public get optimaldimensions(): string {
		return `width=${this.scale}(${this.patches.uppermiddle.width}n+${this.patches.upperleft.width + this.patches.upperright.width}), height=${this.scale}(${this.patches.middleleft.height}n+${this.patches.upperleft.height + this.patches.lowerleft.height})`;
	}
	public isOptimal(width: number, height: number): boolean {
		// TODO Completely rewrite this to actually be accurate...
		return false;
		// return (width * this.scale - ((this.patches.upperleft.width + this.patches.upperright.width)) * this.scale) % (this.patches.uppermiddle.width * this.scale) == 0 && (height * this.scale - ((this.patches.upperleft.height + this.patches.lowerleft.height)) * this.scale) % (this.patches.middleleft.height * this.scale) == 0;
	}

	constructor(url: string) {
    if (url.length === 0) return;
		if (url.indexOf('.json') == -1) url += '.json';
		this._url = url;
		$.getJSON(url).then((json: BorderPatchJSON) => {
			// Load image itself
			this.image = json.image;
			let indexOfSlash = this._url.lastIndexOf('/');
			if (indexOfSlash !== -1)
				this.image = this._url.substr(0, indexOfSlash + 1) + this.image;
			let img = new Image();
			img.src = this.image;
			img.onload = () => {
				if (DEBUG) console.log(`Loaded BorderPatch from ${url}.`);
				this._loaded = true;
				for (let f of this.onload)
					f(this);
			};

			// Load patch information
			this.patches = {
				upperleft: new Patch(json.patches.upperleft),
				uppermiddle: new Patch(json.patches.uppermiddle),
				upperright: new Patch(json.patches.upperright),
				middleleft: new Patch(json.patches.middleleft),
				middlemiddle: new Patch(json.patches.middlemiddle),
				middleright: new Patch(json.patches.middleright),
				lowerleft: new Patch(json.patches.lowerleft),
				lowermiddle: new Patch(json.patches.lowermiddle),
				lowerright: new Patch(json.patches.lowerright)
			};
			this.scale = json.scale;
			this.padding = new Padding(json.padding, this.scale);
			this.font = json.font;
			this.fg_color = Color.fromString(json.fg_color);
		});
	}

	public draw(ui: Renderer, loc: Rectangle): void {
    // TODO Handle imperfect sizes (currently draws under/over)
		if (loc.width < this.minwidth || loc.height < this.minheight) {
      // Draw only center patch
			let draw = new Rectangle(0, 0, 0, 0);
			let drawwidth = this.patches.middlemiddle.width * this.scale;
			let drawheight = this.patches.middlemiddle.height * this.scale;
			for (let y = loc.y1; y < loc.y2; y += drawheight) {
				for (let x = loc.x1; x < loc.x2; x += drawwidth) {
					draw.x1 = x;
					draw.y1 = y;
					draw.width = drawwidth;
					draw.height = drawheight;
					ui.drawSprite(draw, this.patches.middlemiddle, this.image);
				}
			}
		} else {
			// Draw all nine patches
			// Draw central area
			for (let y = loc.y1 + this.patches.upperleft.height * this.scale; y < loc.y2 - this.patches.lowerleft.height * this.scale; y += this.patches.middlemiddle.height * this.scale)
			  for (let x = loc.x1 + this.patches.upperleft.width * this.scale; x < loc.x2 - this.patches.lowerleft.width * this.scale; x += this.patches.middlemiddle.width * this.scale)
				  ui.drawSprite(new Rectangle(
					x, y, this.patches.middlemiddle.width * this.scale, this.patches.middlemiddle.height * this.scale
					), this.patches.middlemiddle, this.image);

			// Draw sides
			for (let y = loc.y1 + this.patches.upperleft.height * this.scale; y < loc.y2 - this.patches.lowerleft.height * this.scale; y += this.patches.middleleft.height * this.scale) {
				ui.drawSprite(new Rectangle(
					loc.x1,
					y,
					this.patches.middleleft.width * this.scale,
					this.patches.middleleft.height * this.scale
				), this.patches.middleleft, this.image);
				ui.drawSprite(new Rectangle(
					loc.x2 - this.patches.upperright.width * this.scale,
					y,
					this.patches.middleright.width * this.scale,
					this.patches.middleright.height * this.scale
				), this.patches.middleright, this.image);
			}
			for (let x = loc.x1 + this.patches.upperleft.width * this.scale; x < loc.x2 - this.patches.lowerleft.width * this.scale; x += this.patches.uppermiddle.width * this.scale) {
				ui.drawSprite(new Rectangle(
					x,
					loc.y1,
					this.patches.uppermiddle.width * this.scale,
					this.patches.uppermiddle.height * this.scale
				), this.patches.uppermiddle, this.image);
				ui.drawSprite(new Rectangle(
					x,
					loc.y2 - this.patches.lowerleft.height * this.scale,
					this.patches.lowermiddle.width * this.scale,
					this.patches.lowermiddle.height * this.scale
				), this.patches.lowermiddle, this.image);
			}

			// Draw corners
			ui.drawSprite(new Rectangle(
				loc.x1,
				loc.y1,
				this.patches.upperleft.width * this.scale,
				this.patches.upperleft.height * this.scale
			), this.patches.upperleft, this.image);
			ui.drawSprite(new Rectangle(
				loc.x2 - this.patches.upperright.width * this.scale,
				loc.y1,
				this.patches.upperright.width * this.scale,
				this.patches.upperright.height * this.scale
			), this.patches.upperright, this.image);
			ui.drawSprite(new Rectangle(
				loc.x1,
				loc.y2 - this.patches.lowerleft.height * this.scale,
				this.patches.lowerleft.width * this.scale,
				this.patches.lowerleft.height * this.scale
			), this.patches.lowerleft, this.image);
			ui.drawSprite(new Rectangle(
				loc.x2 - this.patches.upperright.width * this.scale,
				loc.y2 - this.patches.lowerleft.height * this.scale,
				this.patches.lowerright.width * this.scale,
				this.patches.lowerright.height * this.scale
			), this.patches.lowerright, this.image);
		}
	}
}