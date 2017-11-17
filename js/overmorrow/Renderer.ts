import $ = require('jquery');
import * as moment from '../../node_modules/moment/moment';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import Drawable from 'overmorrow/interfaces/Drawable';
import { Controller, EventTypes, InputEvent } from 'overmorrow/Controller';
declare var DEBUG;

export class Renderer {
  private _canvasActive: JQuery;
  private _canvasBuffer: JQuery;
  private _contextActive: any;
  private _contextBuffer: any;
  private _imageCache: Map<string, HTMLImageElement> = new Map();
  private _viewport: Rectangle;
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
    this._viewport = new Rectangle(0, 0, this._width, this._height);
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

  public getViewport(): Rectangle {
    return this._viewport;
  }

  public isOnScreen(rect: Rectangle) { // TODO Actually use the isOnScreen in all the other draw functions
    return rect.x1 < this._viewport.x2
      && rect.y1 < this._viewport.y2
      && rect.x2 > this._viewport.x1
      && rect.y2 > this._viewport.y1;
  }

  public getVisibleTileArea(): Rectangle {
    // TODO Get this working again once I figure out the tileScale stuff
    return null;
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
    // TODO Check on screen
    // TODO Handle scaling
    this._contextBuffer.beginPath();
    this._contextBuffer.fillStyle = color.rgba;
    // Start with x,y on original canvas
    // Translate by the viewPort x,y
    // Scale to fill viewPort
    this._contextBuffer.rect(
        (rect.x1 - this._viewport.x1),
        (rect.y1 - this._viewport.y1),
        rect.width,
        rect.height);
    this._contextBuffer.fill();
    this._contextBuffer.closePath();
  }

  public drawRectRel(rect: Rectangle, color: Color): void {
    // TODO Should there even be relative functions or should they all be relative to the UIPanels?
    //  Maybe just do something special inside the UIWorld to handle tile scaling
  }

  public drawImage(): void {

  }

  public drawImageRel(): void {

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

  public drawSpriteRel(): void {

  }

  public drawText(rect: Rectangle, text: string, font: string, size: number, color: Color, centered: boolean): void {
    if (DEBUG) this.drawRect(new Rectangle(rect.x1, rect.y1, 5, 5), Color.red);
    this._contextBuffer.beginPath();
    this._contextBuffer.fillStyle = color.rgba;
    this._contextBuffer.textAlign = centered ? 'center' : 'left';
    this._contextBuffer.textBaseline = 'hanging';
    this._contextBuffer.font = size + 'px ' + font;
    this._contextBuffer.fillText(text, rect.x1, rect.y1);
    this._contextBuffer.closePath();
  }

  public drawTextRel(): void {

  }

  public drawBuffer(): void {
    this._contextActive.drawImage(this._canvasBuffer[0], 0, 0);
  }
}

export abstract class UIComponent extends Rectangle implements Drawable {
  public selected: boolean = false;
  public abstract draw(ui: Renderer): void;
  public input(ui: Renderer, e: InputEvent): boolean {
    return false; // Return true if event is consumed
  }
}

interface UISkin {
  img: HTMLImageElement,
  url: string,
  width: number,
  widthScaled: number,
  scale: number,
  color: Color
}

export class UIPanel extends UIComponent {
  private _title: string;
  private _padding: number = 0;
  private _skin: UISkin;
  private _components: UIComponent[][] = [];
  private _currentSkinChange: number = 0;
  private _draggable: boolean = true;
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
    this.setSkin('assets/borderPatch.png', 1, Color.blue);
  }
  public setTitle(title: string): UIPanel {
    this._title = title;
    return this;
  }
  public setPadding(padding: number): UIPanel {
    this._padding = padding;
    return this;
  }
  public setDraggable(draggable: boolean): UIPanel {
    this._draggable = draggable;
    return this;
  }
  public setSkin(skin: string, scale: number, color: Color): UIPanel {
    let skinImage = new Image();
    skinImage.src = skin;
    let skinChangeId = ++this._currentSkinChange;
    skinImage.onload = () => {
      // Prevent race conditions between changing skins too quickly
      if (this._currentSkinChange !== skinChangeId)
        return;
      this._skin = {
        img: skinImage,
        url: skin,
        width: skinImage.width / 3,
        widthScaled: (skinImage.width / 3) * scale,
        scale: scale,
        color: color
      };
    };
    return this;
  }
  public addComponent(component: UIComponent, zindex: number): UIPanel {
    if (this._components[zindex] === undefined)
      this._components[zindex] = [];
    this._components[zindex].push(component);
    return this;
  }
  public draw(ui: Renderer): void {
    // Draw background
    this.drawBackground(ui);

    // Draw components
    ui.translateContext(this.x1 + this._padding, this.y1 + this._padding);
    for (let componentArray of this._components) {
      if (componentArray === undefined)
        continue;
      for (let comp of componentArray)
        comp.draw(ui);
    }
    ui.translateContext(-(this.x1 + this._padding), -(this.y1 + this._padding));
  }
  private drawBackground(ui: Renderer): void {
    if (this._skin === undefined) return;

    // Background
    ui.drawRect(new Rectangle(
        this.x1 + this._skin.widthScaled,
        this.y1 + this._skin.widthScaled,
        this.width - 2*this._skin.widthScaled,
        this.height - 2*this._skin.widthScaled
      ), this._skin.color);

    // Border
    /* 0 1 2 (Render order)
       3 - 4
       5 6 7 */
    // Top
    ui.drawSprite(
      new Rectangle(
        this.x1,
        this.y1,
        this._skin.widthScaled,
        this._skin.widthScaled),
      new Rectangle(
        0,
        0,
        this._skin.width,
        this._skin.width),
      this._skin.url
    );
    ui.drawSprite(
      new Rectangle(
        this.x1 + this._skin.widthScaled,
        this.y1,
        this.width - 2*this._skin.widthScaled,
        this._skin.widthScaled),
      new Rectangle(
        this._skin.width,
        0,
        this._skin.width,
        this._skin.width),
      this._skin.url
    );
    ui.drawSprite(
      new Rectangle(
        this.x1 + this.width - this._skin.widthScaled,
        this.y1,
        this._skin.widthScaled,
        this._skin.widthScaled),
      new Rectangle(
        2*this._skin.width,
        0,
        this._skin.width,
        this._skin.width),
      this._skin.url
    );
    // Middle
    ui.drawSprite(
      new Rectangle(
        this.x1,
        this.y1 + this._skin.widthScaled,
        this._skin.widthScaled,
        this.height - 2*this._skin.widthScaled),
      new Rectangle(
        0,
        this._skin.width,
        this._skin.width,
        this._skin.width),
      this._skin.url
    );
    ui.drawSprite(
      new Rectangle(
        this.x1 + this.width - this._skin.widthScaled,
        this.y1 + this._skin.widthScaled,
        this._skin.widthScaled,
        this.height - 2*this._skin.widthScaled),
      new Rectangle(
        2*this._skin.width,
        this._skin.width,
        this._skin.width,
        this._skin.width),
      this._skin.url
    );
    // Bottom
    ui.drawSprite(
      new Rectangle(
        this.x1,
        this.y1 + this.height - this._skin.widthScaled,
        this._skin.widthScaled,
        this._skin.widthScaled),
      new Rectangle(
        0,
        2*this._skin.width,
        this._skin.width,
        this._skin.width),
      this._skin.url
    );
    ui.drawSprite(
      new Rectangle(
        this.x1 + this._skin.widthScaled,
        this.y1 + this.height - this._skin.widthScaled,
        this.width - 2*this._skin.widthScaled,
        this._skin.widthScaled),
      new Rectangle(
        this._skin.width,
        2*this._skin.width,
        this._skin.width,
        this._skin.width),
      this._skin.url
    );
    ui.drawSprite(
      new Rectangle(
        this.x1 + this.width - this._skin.widthScaled,
        this.y1 + this.height - this._skin.widthScaled,
        this._skin.widthScaled,
        this._skin.widthScaled),
      new Rectangle(
        2*this._skin.width,
        2*this._skin.width,
        this._skin.width,
        this._skin.width),
      this._skin.url
    );
  }
  public input(ui: Renderer, e: InputEvent): boolean {
    if (e.type === EventTypes.MOUSEDOWN && this.inside(e.x, e.y)) {
      ui.selectComponent(this);
      return true;
    } else if (e.type === EventTypes.MOUSEUP) {
      ui.selectComponent(null);
      return true;
    } else if (e.type === EventTypes.MOUSEMOVE && this.selected && this._draggable) {
      // Move self
      this.x1 -= e.dx;
      this.y1 -= e.dy;
      return true;
    }
    return false;
  }
}

export class UILabel extends UIComponent {
  private _text: string;
  private _font: string = 'Times New Roman';
  private _size: number = 16;
  private _color: Color = Color.black;
  private _centered: boolean = false;

  constructor(x: number, y: number, text: string) {
    super(x, y, 0, 0);
    this._text = text;
  }
  public setText(text: string): UILabel {
    this._text = text;
    return this;
  }
  public setFont(font: string): UILabel {
    this._font = font;
    return this;
  }
  public setSize(size: number): UILabel {
    this._size = size;
    return this;
  }
  public setColor(color: Color): UILabel {
    this._color = color;
    return this;
  }
  public setCentered(center: boolean): UILabel {
    this._centered = center;
    return this;
  }

  public draw(ui: Renderer): void {
    ui.drawText(this, this._text, this._font, this._size, this._color, this._centered);
  }
}

export class UIWorld extends UIComponent {
  public draw(ui: Renderer): void {

  }
}