import $ = require('jquery');
import Rectangle from './primitives/Rectangle';
import Color from './primitives/Color';
import { Controller, EventTypes, InputEvent } from './Controller';
import UIComponent from './ui/UIComponent';
import { Filter } from './primitives/Filter';
import Line from './primitives/Line';
import Vector from './primitives/Vector';
import { DEBUG } from './Game';
import Renderer from './Renderer';

// TODO Allow setting of default font

export default class RendererCanvas extends Renderer {
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
  protected _filters: Filter[] = []; // Applied to the temp canvas
  protected _opacityStack: number[] = [];

  constructor(canvasActive: JQuery<HTMLCanvasElement>, canvasBuffer: JQuery<HTMLCanvasElement>) {
    super(canvasActive, canvasBuffer);
  }

  public setAA(enable: boolean): void {
    this._context.imageSmoothingEnabled = enable;
  }

  /**
   * Set the opacity for subsequent draws.
   * @param opacity Opacity as percentage 0-1, leave undefined to revert
   */
  public setOpacity(opacity?: number): void {
    if (opacity === undefined) {
      if (this._opacityStack.length > 0)
        this._context.globalAlpha = this._opacityStack.pop();
      else
        this._context.globalAlpha = 1;
    } else {
      this._opacityStack.push(this._context.globalAlpha);
      this._context.globalAlpha = opacity;
    }
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
    this.setOpacity(opacity * this._context.globalAlpha);
    if (rotation.deg !== 0) {
      this._context.save();
      this._context.translate(rect.x1 + (rect.width*rotation.x), rect.y1 + (rect.height*rotation.y));
      this._context.rotate(Math.PI/180*rotation.deg);
      this._context.drawImage(this._imageCache.get(url), -rect.width*rotation.x, -rect.height*rotation.y, rect.width, rect.height);
      this._context.restore();
    } else {
      this._context.drawImage(this._imageCache.get(url), rect.x1, rect.y1, rect.width, rect.height);
    }
    this.setOpacity();
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
    this.setOpacity(opacity * this._context.globalAlpha);
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
    this.setOpacity();
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
}

