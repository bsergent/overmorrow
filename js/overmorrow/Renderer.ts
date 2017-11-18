import $ = require('jquery');
import * as moment from '../../node_modules/moment/moment';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import Drawable from 'overmorrow/interfaces/Drawable';
import { Controller, EventTypes, InputEvent } from 'overmorrow/Controller';
import UIComponent from 'overmorrow/ui/UIComponent';
import UILabel from 'overmorrow/ui/UILabel';
import UIPanel from 'overmorrow/ui/UIPanel';
declare var DEBUG;

export default class Renderer {
  private _canvasActive: JQuery;
  private _canvasBuffer: JQuery;
  private _contextActive: any;
  private _contextBuffer: any;
  private _imageCache: Map<string, HTMLImageElement> = new Map();
  private _components: UIComponent[][] = [];
  private _width: number;
  private _height: number;

  constructor(canvasActive: JQuery, canvasBuffer: JQuery, controller: Controller) {
    this._canvasActive = canvasActive;
    this._canvasBuffer = canvasBuffer;
    this._contextActive = (this._canvasActive[0] as HTMLCanvasElement).getContext('2d');
    this._contextBuffer = (this._canvasBuffer[0] as HTMLCanvasElement).getContext('2d');
    this._contextBuffer.imageSmoothingEnabled = false;
    this._width = this._canvasActive.width();
    this._height = this._canvasActive.height();
    controller.addListener(EventTypes.ALL).setAction((e) => this.processInput(e));
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
    let startTime = moment();
    this.drawRect(new Rectangle(0, 0, this._width, this._height), Color.black);
    for (let componentArray of this._components) {
      if (componentArray === undefined)
        continue;
      for (let comp of componentArray)
        comp.draw(this);
    }
    this.drawBuffer();
    return moment().diff(startTime);
  }

  private processInput(e: InputEvent): void {
    // Check higher indices first
    for (let c = this._components.length - 1; c >= 0; c--) {
      if (this._components[c] === undefined)
        continue;
      for (let comp of this._components[c]) {
        if (comp.input(this, e))
          break;
      }
    }
  }

  public selectComponent(component: UIComponent) {
    for (let componentArray of this._components) {
      if (componentArray === undefined)
        continue;
      for (let comp of componentArray)
        comp.selected = comp === component;
    }
  }

  public addComponent(component: UIComponent, zindex: number): void {
    if (this._components[zindex] === undefined)
      this._components[zindex] = [];
    this._components[zindex].push(component);
  }

  public removePanel(panel: UIPanel): boolean {
    for (let panelArray of this._components)
      for (let p of panelArray)
        if (p === panel) {
          p = null; // TODO Check if this actually works
          return true;
        }
    return false;
  }

  public getWidth(): number {
    return this._width;
  }

  public getHeight(): number {
    return this._height;
  }

  public setAA(enable: boolean): void {
    this._contextBuffer.imageSmoothingEnabled = enable;
  }

  public translateContext(x: number, y: number): void {
    this._contextBuffer.translate(x ,y);
  }

  public drawRect(rect: Rectangle, color: Color): void {
    this._contextBuffer.beginPath();
    this._contextBuffer.fillStyle = color.rgba;
    // Start with x,y on original canvas
    // Translate by the viewPort x,y
    // Scale to fill viewPort
    this._contextBuffer.rect(
        rect.x1,
        rect.y1,
        rect.width,
        rect.height);
    this._contextBuffer.fill();
    this._contextBuffer.closePath();
  }

  public drawRectRel(rect: Rectangle, color: Color): void {
    // TODO Should there even be relative functions or should they all be relative to the UIPanels?
    //  Maybe just do something special inside the UIWorld to handle tile scaling
    //  Ya, move the viewport into the UIWorld
  }

  public drawImage(rect: Rectangle, url: string, rotationDeg: number = 0, opacity: number = 1): void {
    if (!this._imageCache.has(url)) {
      this._imageCache.set(url, new Image());
      this._imageCache.get(url).src = url;
    }
    this._contextBuffer.globalAlpha = opacity;
    // TODO Implement rotation
    this._contextBuffer.drawImage(this._imageCache.get(url), rect.x1, rect.y1, rect.width, rect.height);
    this._contextBuffer.globalAlpha = 1;
  }

  public drawSprite(rect: Rectangle, drect: Rectangle, url: string, rotationDeg: number = 0, opacity: number = 1): void {
    if (!this._imageCache.has(url)) {
      this._imageCache.set(url, new Image());
      this._imageCache.get(url).src = url;
    }
    this._contextBuffer.globalAlpha = opacity;
    // TODO Implement rotation
    if (drect.width == 0 && drect.height == 0)
      this._contextBuffer.drawImage(this._imageCache.get(url), rect.x1, rect.y1, rect.width, rect.height);
    else
      this._contextBuffer.drawImage(this._imageCache.get(url), drect.x1, drect.y1, drect.width, drect.height, rect.x1, rect.y1, rect.width, rect.height);
    this._contextBuffer.globalAlpha = 1;
  }

  public drawText(rect: Rectangle, text: string, font: string, size: number, color: Color, alignment: 'left'|'center'|'right'): void {
    if (DEBUG) this.drawRect(new Rectangle(rect.x1, rect.y1, 5, 5), Color.red);
    this._contextBuffer.beginPath();
    this._contextBuffer.fillStyle = color.rgba;
    this._contextBuffer.textAlign = alignment;
    this._contextBuffer.textBaseline = 'hanging';
    this._contextBuffer.font = size + 'px ' + font;
    this._contextBuffer.fillText(text, rect.x1, rect.y1);
    this._contextBuffer.closePath();
  }

  public drawBuffer(): void {
    this._contextActive.drawImage(this._canvasBuffer[0], 0, 0);
  }
}