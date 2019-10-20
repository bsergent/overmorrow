import $ = require('jquery');
import * as moment from 'moment';
import Rectangle from './primitives/Rectangle';
import Color from './primitives/Color';
import { Controller, EventTypes, InputEvent } from './Controller';
import UIComponent from './ui/UIComponent';
import { Filter } from './primitives/Filter';
import Line from './primitives/Line';
import Vector from './primitives/Vector';
declare var DEBUG;

// TODO Allow setting of default font

export default class Renderer {
  private _canvasActive: JQuery<HTMLCanvasElement>;
  private _canvasBuffer: JQuery<HTMLCanvasElement>;
  private _canvasTemp: JQuery<HTMLCanvasElement>;
  private _contextActive: CanvasRenderingContext2D;
  private _contextBuffer: CanvasRenderingContext2D;
  private _contextTemp: CanvasRenderingContext2D;
  private _context: CanvasRenderingContext2D;
  private _imageCache: Map<string, HTMLImageElement> = new Map();
  private _components: UIComponent[][] = [];
  private _width: number;
  private _height: number;
  private _filters: Filter[] = []; // Applied to the temp canvas

  constructor(canvasActive: JQuery<HTMLCanvasElement>, canvasBuffer: JQuery<HTMLCanvasElement>, canvasTemp: JQuery<HTMLCanvasElement>) {
    this._canvasActive = canvasActive;
    this._canvasBuffer = canvasBuffer;
    this._canvasTemp = canvasTemp;
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
    if (this._canvasTemp !== null && this._canvasTemp.length > 0) {
      this._contextTemp = (this._canvasTemp[0] as HTMLCanvasElement).getContext('2d');
      this._contextTemp.imageSmoothingEnabled = false;
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
    let startTime = moment();
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
    return moment().diff(startTime);
  }

  private processInput(e: InputEvent): void {
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

  public setAA(enable: boolean): void {
    this._context.imageSmoothingEnabled = enable;
  }

  public translateContext(x: number, y: number): void {
    this._context.translate(x ,y);
  }

  public drawRect(rect: Rectangle, color: Color): void {
    this._context.beginPath();
    this._context.fillStyle = color.rgba;
    // Start with x,y on original canvas
    // Translate by the viewPort x,y
    // Scale to fill viewPort
    this._context.rect(
        rect.x1,
        rect.y1,
        rect.width,
        rect.height);
    this._context.fill();
    this._context.closePath();
  }

  public drawRectWire(rect: Rectangle, color: Color): void {
    this._context.strokeStyle = color.rgba;
    this._context.strokeRect(rect.x1, rect.y1, rect.width, rect.height);
  }

  public drawLine(line: Line, color: Color, lineWidth: number = 1): void {
    let prevWidth = this._context.lineWidth;
    this._context.strokeStyle = color.rgba;
    this._context.lineWidth = lineWidth;
    this._context.beginPath();
    this._context.moveTo(line.a.x, line.a.y);
    this._context.lineTo(line.b.x, line.b.y);
    this._context.stroke();
    this._context.lineWidth = prevWidth;
  }

  // Rotation pivot should range from (0,0) to (1,1)
  public drawImage(rect: Rectangle, url: string, opacity: number = 1, rotation: { deg: number, x: number, y: number } = { deg: 0, x: 0, y: 0 }): void {
    if (!this._imageCache.has(url)) {
      this._imageCache.set(url, new Image());
      this._imageCache.get(url).src = url;
    }
    this._context.globalAlpha = opacity;
    if (rotation.deg !== 0) {
      this._context.save();
      this._context.translate(rect.x1 + (rect.width*rotation.x), rect.y1 + (rect.height*rotation.y));
      this._context.rotate(Math.PI/180*rotation.deg);
      this._context.drawImage(this._imageCache.get(url), -rect.width*rotation.x, -rect.height*rotation.y, rect.width, rect.height);
      this._context.restore();
    } else {
      this._context.drawImage(this._imageCache.get(url), rect.x1, rect.y1, rect.width, rect.height);
    }
    this._context.globalAlpha = 1;
    if (DEBUG && rotation.deg !== 0) this.drawRect(new Rectangle(rect.x1 + (rect.width*rotation.x) - 3, rect.y1 + (rect.height*rotation.y) - 3, 6, 6), Color.RED);
  }

  // TODO Fix drect to not be pixel based, but range from 0 to 1 to allow any resolution of textures
  public drawSprite(rect: Rectangle, drect: Rectangle, url: string, opacity: number = 1, rotation: { deg: number, x: number, y: number } = { deg: 0, x: 0, y: 0 }): void {
    // Check for cache
    if (!this._imageCache.has(url)) {
      this._imageCache.set(url, new Image());
      this._imageCache.get(url).src = url;
    }

    // Translate from 0 to 1 to 0 to width or height
    let dr: Rectangle = null;
    if (drect !== null) {
      dr = drect.clone();
      // dr.x1 /= this._imageCache.get(url).width;
      // dr.y1 /= this._imageCache.get(url).height;
      // dr.width /= this._imageCache.get(url).width;
      // dr.height /= this._imageCache.get(url).height;
    }

    // Draw while handling opacity and rotation
    this._context.globalAlpha = opacity;
    if (rotation.deg !== 0) {
      this._context.save();
			this._context.translate(rect.x1 + (rect.width/2), rect.y1 + (rect.height/2));
      this._context.rotate(Math.PI/180*rotation.deg);
      if (dr === null || (dr.width === 0 && dr.height === 0))
        this._context.drawImage(this._imageCache.get(url), -rect.width*rotation.x, -rect.height*rotation.y, rect.width, rect.height);
      else
        this._context.drawImage(this._imageCache.get(url), dr.x1, dr.y1, dr.width, dr.height, -rect.width*rotation.x, -rect.height*rotation.y, rect.width, rect.height);
      this._context.restore();
    } else {
      if (dr === null || (dr.width === 0 && dr.height === 0))
        this._context.drawImage(this._imageCache.get(url), rect.x1, rect.y1, rect.width, rect.height);
      else
        this._context.drawImage(this._imageCache.get(url), dr.x1, dr.y1, dr.width, dr.height, rect.x1, rect.y1, rect.width, rect.height);
    }
    // TODO Implement colorization and color replacement
    if (DEBUG && rotation.deg !== 0) this.drawRect(new Rectangle(rect.x1 + (rect.width*rotation.x) - 3, rect.y1 + (rect.height*rotation.y) - 3, 6, 6), Color.RED);
  }

  public drawText(rect: Rectangle, text: string, font: string, size: number, color: Color, alignment: 'left'|'center'|'right', linePadding: number = 0): void {
    if (DEBUG) this.drawRect(new Rectangle(rect.x1, rect.y1, 5, 5), new Color(0, 0, 255, 0.5));
    let lines = text.split('\n');
    this._context.beginPath();
    this._context.fillStyle = color.rgba;
    this._context.textAlign = alignment;
    this._context.textBaseline = 'hanging';
    this._context.font = size + 'px ' + font;
    if (lines.length > 1) {
      let rectInt = rect.clone();
      for (let line of lines) {
        this._context.fillText(line, rectInt.x1, rectInt.y1);
        rectInt.y1 += this._context.measureText('M').width + linePadding;
      }
    } else {
      this._context.fillText(text, rect.x1, rect.y1);
    }
    this._context.closePath();
  }

  public measureText(text: string, font: string, size: number, linePadding: number = 0): Vector {
    this._context.font = size + 'px ' + font;
    let dims = new Vector(0, 0);
    let lines = text.split('\n');
    // Note that this assumes 'M' is a perfect square. Still better than just using the font size though.
    let lineHeight = this._context.measureText('M').width;
    for (let l of lines) {
      dims.x = Math.max(dims.x, this._context.measureText(l).width);
      dims.y += lineHeight + linePadding;
    }
    dims.y -= linePadding;
    return dims;
  }

  public drawBuffer(): void {
    this._contextActive.drawImage(this._canvasBuffer[0], 0, 0);
  }

  public beginTemp(width: number, height: number): void {
    if (this._contextTemp === undefined) return;
    this._canvasTemp.width(width);
    this._canvasTemp.height(height);
    this._contextTemp = (this._canvasTemp[0] as HTMLCanvasElement).getContext('2d');
    this._contextTemp.imageSmoothingEnabled = false;
    this._context = this._contextTemp;
    this._context.clearRect(0, 0, this._canvasTemp.width(), this._canvasTemp.height());
    //this._context.clearRect(0, 0, this._width, this._height);
  }
  
  public closeTemp(x: number, y: number): void {
    if (this._context === undefined || this._context !== this._contextTemp) return;

    // Apply filters
    let imageData = this._context.getImageData(0, 0, this._width, this._height);
    let pixelChannels = imageData.data;
    let pixel: Color;
    for (let i = 0; i < pixelChannels.length; i+= 4) {
      pixel = new Color(pixelChannels[i],
        pixelChannels[i+1],
        pixelChannels[i+2],
        pixelChannels[i+3] / 255);
      for (let f of this._filters)
        pixel = f.apply(pixel);
      pixelChannels[i  ] = pixel.rgbaObject.r;
      pixelChannels[i+1] = pixel.rgbaObject.g;
      pixelChannels[i+2] = pixel.rgbaObject.b;
      pixelChannels[i+3] = Math.floor(pixel.rgbaObject.a * 255);
    }
    this._context.clearRect(0, 0, this._canvasTemp.width(), this._canvasTemp.height());
    this._context.putImageData(imageData, 0, 0);

    // Draw the filtered image to the main canvas
    this._context = this._contextBuffer;
    this._context.drawImage(this._canvasTemp[0], x, y);
  }

  public applyFilter(filter: Filter): void {
    this._filters.push(filter);
  }

  public applyFilters(filters: Filter[]): void {
    this._filters = this._filters.concat(filters);
  }

  public clearFilters(): void {
    this._filters = [];
  }
}

