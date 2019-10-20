import Renderer from 'Renderer';
export default interface Drawable {
  draw(ui: Renderer):void;
}