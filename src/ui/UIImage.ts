import Renderer from '../Renderer';
import UIComponent from './UIComponent';
import { InputEvent, EventTypes} from '../Controller';
import Rectangle from '../primitives/Rectangle';
import AnimationSheet from '../classes/AnimationSheet';

export default class UIImage extends UIComponent {
    private _image: string;
    private _aniSheet: AnimationSheet = null;
    private _sprite: Rectangle = null;
  
    constructor(x: number, y: number, width: number, height: number, imgUrl: string = '') {
      super(x, y, width, height);
      this._image = imgUrl;
    }

    public setImage(imgUrl: string): UIImage {
      this._image = imgUrl;
      return this;
    }
    public setAnimationSheet(aniSheet: AnimationSheet): UIImage {
      this._aniSheet = aniSheet;
      return this;
    }
    public setSpriteCoords(rect: Rectangle): UIImage {
      this._sprite = rect;
      return this;
    }
  
    public draw(ui: Renderer): void {
      if (this._aniSheet !== null)
        this._aniSheet.draw(ui, this);
      else if (this._sprite !== null)
        ui.drawSprite(this, this._sprite, this._image);
      else
        ui.drawImage(this, this._image);
		}
  }