import ui = require('ui');
export default interface Drawable { // TODO Does ui really need to be passed around? It's probably already static
  draw():void;
}