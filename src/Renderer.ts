import $ = require('jquery');
import Rectangle from './primitives/Rectangle';
import Color from './primitives/Color';
import { Controller, EventTypes, InputEvent } from './Controller';
import UIComponent from './ui/UIComponent';
import { Filter } from './primitives/Filter';
import Line from './primitives/Line';
import Vector from './primitives/Vector';
import { DEBUG } from './Game';

// TODO Allow setting of default font

export default abstract class Renderer {
  protected _canvasActive: JQuery<HTMLCanvasElement>;
  protected _canvasBuffer: JQuery<HTMLCanvasElement>;
  protected _canvasTemp: JQuery<HTMLCanvasElement>;
  protected _contextActive: CanvasRenderingContext2D;
  protected _contextBuffer: CanvasRenderingContext2D;
  protected _contextTemp: CanvasRenderingContext2D;
  protected _context: CanvasRenderingContext2D;
  protected _imageCache: Map<string, HTMLImageElement> = new Map();
  protected _components: UIComponent[][] = [];
  protected _width: number;
  protected _height: number;
  protected _opacityStack: number[] = [];

  constructor(canvasActive: JQuery<HTMLCanvasElement>, canvasBuffer: JQuery<HTMLCanvasElement>) {
    this._canvasActive = canvasActive;
    this._canvasBuffer = canvasBuffer;
    if (this._canvasActive !== null && this._canvasActive.length > 0) {
      this._contextActive = (this._canvasActive[0] as HTMLCanvasElement).getContext('2d');
      this._width = this._canvasActive.width();
      this._height = this._canvasActive.height();
      this._canvasActive.on('contextmenu', function(event) { return false; });
    }
    if (this._canvasBuffer !== null && this._canvasBuffer.length > 0) {
      this._contextBuffer = (this._canvasBuffer[0] as HTMLCanvasElement).getContext('2d');
      this._contextBuffer.imageSmoothingEnabled = false;
    }
    this._context = this._contextBuffer;
    Controller.addListener(EventTypes.ALL).setAction((e) => this.processInput(e));
  }

  public preloadImages(urls: string[]) {
    for (let url of urls) {
      if (this._imageCache.has(url)) continue;
      let img = new Image();
      img.src = url;
      this._imageCache.set(url, img);
    }
  }

  public draw(): number {
    let startTime = Date.now();
    this.drawRect(new Rectangle(0, 0, this._width, this._height), Color.BLACK);
    for (let componentArray of this._components) {
      if (componentArray === undefined)
        continue;
      // Move currently selected component to forefront of layer
      for (let c = 0; c < componentArray.length; c++) {
        let comp = componentArray[c];
        if (comp.selected && c !== componentArray.length - 1) {
          componentArray.splice(c, 1);
          componentArray.push(comp);
        }
      }
      for (let comp of componentArray)
        comp.draw(this);
    }
    this.drawBuffer();
    return Date.now() - startTime;
  }

  protected processInput(e: InputEvent): void {
    // Check higher indices first
    outer:
    for (let layer = this._components.length - 1; layer >= 0; layer--) {
      if (this._components[layer] === undefined)
        continue;
      for (let c = this._components[layer].length - 1; c >= 0; c--)
        if (this._components[layer][c].input(this, e))
          break outer;
    }
  }

  public selectComponent(component: UIComponent) {
    for (let componentArray of this._components) {
      if (componentArray === undefined)
        continue;
      // TODO Buttons not receiving event when panel was just moved, something to do with array ordering?
      for (let comp of componentArray)
        comp.selected = comp === component;
    }
  }

  public addComponent(component: UIComponent, zindex: number): void {
    if (this._components[zindex] === undefined)
      this._components[zindex] = [];
    this._components[zindex].push(component);
  }

  public removeComponent(component: UIComponent): boolean {
    for (let componentArray of this._components)
      for (let p of componentArray)
        if (p === component) {
          componentArray.splice(componentArray.indexOf(p), 1);
          return true;
        }
    return false;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public abstract setAA(enable: boolean): void;

  /**
   * Set the opacity for subsequent draws.
   * @param opacity Opacity as percentage 0-1, leave undefined to revert
   */
  public abstract setOpacity(opacity?: number): void;

  public abstract translateContext(x: number, y: number): void;

  public abstract drawRect(rect: Rectangle, color: Color): void;

  public abstract drawRectWire(rect: Rectangle, color: Color): void;

  public abstract drawLine(line: Line, color: Color, lineWidth?: number): void;

  // Rotation pivot should range from (0,0) to (1,1)
  public abstract drawImage(rect: Rectangle, url: string, opacity?: number , rotation?: { deg: number, x: number, y: number }): void;

  // TODO Fix drect to not be pixel based, but range from 0 to 1 to allow any resolution of textures
  public abstract drawSprite(rect: Rectangle, drect: Rectangle, url: string, opacity?: number, rotation?: { deg: number, x: number, y: number }): void;

  public abstract drawText(rect: Rectangle, text: string, font: string, size: number, color: Color, alignment: 'left'|'center'|'right', linePadding?: number): void;

  public abstract measureText(text: string, font: string, size: number, linePadding?: number): Vector;

  public drawBuffer(): void {
    this._contextActive.drawImage(this._canvasBuffer[0], 0, 0);
  }
}

