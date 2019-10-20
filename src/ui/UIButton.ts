import Renderer from '../Renderer';
import Color from '../primitives/Color';
import UIComponent from './UIComponent';
import { InputEvent, EventTypes} from '../Controller';
import Rectangle from '../primitives/Rectangle';

export default class UIButton extends UIComponent {
    private _text: string;
    private _font: string = 'Times New Roman';
    private _size: number = 16;
    private _colorBG: Color = Color.BLACK;
    private _colorFG: Color = Color.WHITE;
		private _alignment: 'left'|'center'|'right' = 'left';
		private _hovered: boolean = false;
		private _action: Function;
  
    constructor(x: number, y: number, width: number, height: number, text: string) {
      super(x, y, width, height);
      this._text = text;
    }
    public setText(text: string): UIButton {
      this._text = text;
      return this;
    }
    public setFont(font: string): UIButton {
      this._font = font;
      return this;
    }
    public setSize(size: number): UIButton {
      this._size = size;
      return this;
    }
    public setColorBG(color: Color): UIButton {
      this._colorBG = color;
      return this;
    }
    public setColorFG(color: Color): UIButton {
      this._colorFG = color;
      return this;
    }
    public setAlignment(alignment: 'left'|'center'|'right'): UIButton {
      this._alignment = alignment;
      return this;
		}
		public setAction(action: Function): UIButton {
      this._action = action;
      return this;
		}
  
    public draw(ui: Renderer): void {
			// TODO Add some more robust button rendering with a border patch, as well as hover and select skins
      ui.drawRect(this, this._colorBG);
			ui.drawText(new Rectangle(this.x1 + this.width / 2, this.y1 + 2, 0, 0), this._text, this._font, this._size, this._colorFG, 'center');
		}
		
		public input(ui: Renderer, e: InputEvent): boolean {
      if (e.type === EventTypes.MOUSEDOWN && this.contains(e.x, e.y)) {
        ui.selectComponent(this);
        return true;
      } else if (e.type === EventTypes.MOUSEUP && this.contains(e.x, e.y)) {
				this._action();
        ui.selectComponent(null);
        return true;
      } else if (e.type === EventTypes.MOUSEMOVE) {
        this._hovered = this.contains(e.x, e.y);
        return false;
      }
      return false;
    }
  }