// var Overmorrow = {
//   // Game: require('./Game'),
//   // Renderer: require('./Renderer'),
//   // Controller: require('./Controller'),
//   // Utilities: require('./Utilities')
// }

// module.exports = Overmorrow;
// global.Overmorrow = Overmorrow;

export let DEBUG = true;

import Game from './Game';
import Renderer from './Renderer';
import * as Controller from './Controller';
import * as Utilities from './Utilities';

export default {
  Game: Game,
  Renderer: Renderer,
  Controller: Controller,
  Utilities: Utilities
};