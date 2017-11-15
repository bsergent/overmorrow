import $ = require('jquery');
//import moment from 'moment';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import Drawable from 'overmorrow/interfaces/Drawable';



export class Renderer {
  private _canvasActive: JQuery;
  private _canvasBuffer: JQuery;
  private _contextActive: any;
  private _contextBuffer: any;
  private _imageCache: Map<string, HTMLImageElement>;
  private _viewport: Rectangle;
  private _components: UIComponent[][] = [];

  constructor(canvasActive: JQuery, canvasBuffer: JQuery) {
    this._canvasActive = canvasActive;
    this._canvasBuffer = canvasBuffer;
    this._contextActive = (this._canvasActive[0] as HTMLCanvasElement).getContext('2d');
    this._contextBuffer = (this._canvasBuffer[0] as HTMLCanvasElement).getContext('2d');
    this._contextBuffer.imageSmoothingEnabled = false;
    this._viewport = new Rectangle(0, 0, 100, 100);
  }

  public loadImages(urls: string[]) {
    for (let url of urls) {
      if (this._imageCache.has(url)) continue;
      let img = new Image();
      img.src = url;
      this._imageCache.set(url, img);
    }
  }

  public draw() {
    this.drawRect(new Rectangle(0, 0, 100, 100), Color.blue);
    for (let componentArray of this._components) {
      if (componentArray === undefined)
        continue;
      for (let comp of componentArray)
        comp.draw(this);
    }
    this.drawBuffer();
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

  public isOnScreen(rect: Rectangle) {
    return rect.x1 < this._viewport.x2
      && rect.y1 < this._viewport.y2
      && rect.x2 > this._viewport.x1
      && rect.y2 > this._viewport.y1;
  }

  public getVisibleTileArea(): Rectangle {
    // TODO Get this working again once I figure out the tileScale stuff
    return null;
  }

  public setAA(enable: boolean): void {
    this._contextBuffer.imageSmoothingEnabled = enable;
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

  public drawRectRel(): void {
    // TODO Should there even be relative functions or should they all be relative to the UIPanels?
  }

  public drawImage(): void {

  }

  public drawImageRel(): void {

  }

  public drawSprite(): void {

  }

  public drawSpriteRel(): void {

  }

  public drawText(): void {

  }

  public drawTextRel(): void {

  }

  public drawBuffer(): void {
    this._contextActive.drawImage(this._canvasBuffer[0], 0, 0);
  }
}

export abstract class UIComponent extends Rectangle implements Drawable {
  public abstract draw(ui: Renderer): void;
}

export class UIPanel extends UIComponent {
  private _title: string;
  private _children: UIPanel[];
  public draw(ui: Renderer): void {
    // TODO Also pass offset for panel (so that it can be later moved and such)
    ui.drawRect(this, Color.blue);
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
    return this;
  }
  public setFont(font: string): UILabel {
    return this;
  }
  public setSize(size: number): UILabel {
    return this;
  }
  public setColor(color: Color): UILabel {
    return this;
  }
  public setCentered(center: boolean): UILabel {
    return this;
  }

  public draw(ui: Renderer): void {
    ui.drawText();
    ui.drawRect(new Rectangle(this.x1, this.y1, this._size, this._size), this._color);
  }
}

export class UIWorld extends UIComponent {
  public draw(ui: Renderer): void {

  }
}