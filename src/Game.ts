// import Renderer from "../js/overmorrow/Renderer";
// import { Controller } from "../js/overmorrow/Controller";
// <reference path="../node_modules/pixi.js/pixi.js.d.ts" />
//import PIXI = require('pixi.js');
//import * as PIXI from '../node_modules/pixi.js/pixi.js';
//import PIXI = require('pixi.js');

// export default class Game {
//   public ctrl: Controller;
//   public render: Renderer;

//   constructor() {
//     const app = new PIXI.Application();
//     document.body.appendChild(app.view);

//     // this.ctrl = new Controller();
//     // this.render = new Renderer();
//   }
// }

export let DEBUG: boolean = false;

export default class Game {
  public test: string = 'test1';

  constructor() {
    console.log('Loaded game');
    // let app = new PIXI.Application({ width: 720, height: 480, antialias: false });
    // app.renderer.autoResize = true;
    // document.body.appendChild(app.view);
  }
}