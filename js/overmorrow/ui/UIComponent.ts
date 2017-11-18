import Renderer from 'overmorrow/Renderer';
import { InputEvent } from 'overmorrow/Controller';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Drawable from 'overmorrow/interfaces/Drawable';

export default abstract class UIComponent extends Rectangle implements Drawable {
  public selected: boolean = false;
  public abstract draw(ui: Renderer): void;
  public input(ui: Renderer, e: InputEvent): boolean {
    return false; // Return true if event is consumed
  }
}