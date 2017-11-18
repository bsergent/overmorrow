import Renderer from 'overmorrow/Renderer';
import Rectangle from 'overmorrow/primitives/Rectangle';
import UIComponent from 'overmorrow/ui/UIComponent';

export class UIWorld extends UIComponent {
  private _viewport: Rectangle;
  private _tileScale: number;

  public draw(ui: Renderer): void {

  }
  public getVisibleTileArea(): Rectangle {
    return null;
  }
}