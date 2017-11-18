import Renderer from 'overmorrow/Renderer';
import InputEvent from 'overmorrow/Controller';
import Color from 'overmorrow/primitives/Color';
import UIComponent from 'overmorrow/ui/UIComponent';

export default class UILabel extends UIComponent {
    private _text: string;
    private _font: string = 'Times New Roman';
    private _size: number = 16;
    private _color: Color = Color.black;
    private _alignment: 'left'|'center'|'right' = 'left';
  
    constructor(x: number, y: number, text: string) {
      super(x, y, 0, 0);
      this._text = text;
    }
    public setText(text: string): UILabel {
      this._text = text;
      return this;
    }
    public setFont(font: string): UILabel {
      this._font = font;
      return this;
    }
    public setSize(size: number): UILabel {
      this._size = size;
      return this;
    }
    public setColor(color: Color): UILabel {
      this._color = color;
      return this;
    }
    public setAlignment(alignment: 'left'|'center'|'right'): UILabel {
      this._alignment = alignment;
      return this;
    }
  
    public draw(ui: Renderer): void {
      ui.drawText(this, this._text, this._font, this._size, this._color, this._alignment);
    }
  }