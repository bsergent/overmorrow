import Renderer from '../Renderer';
import { InputEvent } from '../Controller';
import Rectangle from '../primitives/Rectangle';
import Drawable from '../interfaces/Drawable';

export default abstract class UIComponent extends Rectangle implements Drawable {
  public selected: boolean = false;
  public visible: boolean = true; // TODO Implement visible (use for things like player inventory)
  public abstract draw(ui: Renderer): void;
  public input(ui: Renderer, e: InputEvent): boolean {
    return false; // Return true if event is consumed
  }
}