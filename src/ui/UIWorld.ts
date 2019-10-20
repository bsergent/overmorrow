import Renderer from 'overmorrow/Renderer';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import UIComponent from 'overmorrow/ui/UIComponent';
import World from 'overmorrow/classes/World';
import EntityPlayer from 'overmorrow/classes/EntityPlayer';
import Vector from '../primitives/Vector';
import { Viewport } from '../primitives/Viewport';

export default class UIWorld extends UIComponent {
  private _worldRenderer: WorldRenderer = null;
  private _world: World;
  private _player: EntityPlayer = null;

  constructor(x: number, y: number, width: number, height: number, renderer: Renderer) {
    super(x, y, width, height);
    this._worldRenderer = new WorldRenderer(renderer, new Viewport(0, 0, width, height, 16));
  }

  public setViewport(viewport: Viewport): UIWorld {
    this._worldRenderer.viewport = viewport;
    return this;
  }
  get viewport(): Viewport {
    return this._worldRenderer.viewport;
  }
  set viewport(value: Viewport) {
    this._worldRenderer.viewport = value;
  }
  public setTileScale(pixels: number): UIWorld {
    this._worldRenderer.tileScale = pixels;
    return this;
  }
  get tileScale(): number {
    return this._worldRenderer.tileScale;
  }
  set tileScale(value: number) {
    this._worldRenderer.tileScale = value;
  }



  public setWorld(world: World): UIWorld {
    this._world = world;
    this._worldRenderer.world = world;
    return this;
  }
  public setPlayer(player: EntityPlayer): UIWorld {
    this._player = player;
    return this;
  }
  public centerViewPort(x: number, y: number, obeyBorders: boolean = true): UIWorld {
    // Center on the middle of the given world coordinates
    this._worldRenderer.viewport.x1 = x * this.tileScale - (this._worldRenderer.viewport.width / 2) + (this.tileScale / 2);
    this._worldRenderer.viewport.y1 = y * this.tileScale - (this._worldRenderer.viewport.height / 2) + (this.tileScale / 2);
    // Account for world boundaries
    if (obeyBorders) {
      if (this._worldRenderer.viewport.x1 <= 0)
        this._worldRenderer.viewport.x1 = 0;
      if (this._worldRenderer.viewport.y1 <= 0)
        this._worldRenderer.viewport.y1 = 0;
      if (this._worldRenderer.viewport.x2 >= this._world.width * this.tileScale)
        this._worldRenderer.viewport.x1 = this._world.width * this.tileScale - this._worldRenderer.viewport.width;
      if (this._worldRenderer.viewport.y2 >= this._world.height * this.tileScale)
        this._worldRenderer.viewport.y1 = this._world.height * this.tileScale - this._worldRenderer.viewport.height;
    }
    return this;
  }

  public draw(ui: Renderer): void {
    if (this._player !== null) {
      if (this._player.health <= 0) {
        ui.drawRect(this, Color.BLACK);
        ui.drawText(new Rectangle(this.width / 2, this.height / 2 - 36, 0, 0), 'You died.', 'Comic Sans', 72, Color.RED, 'center');
        return;
      }
      this.centerViewPort(this._player.x1, this._player.y1);
    }
    this._world.draw(this._worldRenderer);
  }
}

export class WorldRenderer extends Renderer { // Wrapper for Renderer class that handles the viewport
  public viewport: Viewport;
  public world: World;
  private _renderer: Renderer;

  public get tileScale(): number { // Number of pixels a single tile occupies
    return this.viewport.scale;
  }
  public set tileScale(scale: number) {
    this.viewport.scale = scale;
  }

  constructor(renderer: Renderer, viewport: Viewport) {
    super(null, null, null); // Ignore own render functions and just call them on the given Renderer with needed transformations
    this._renderer = renderer;
    this.viewport = viewport;
  }

  private isOnScreen(rect: Rectangle): boolean {
    // Returns true if either corner is visible
    return (rect.x1 * this.tileScale < this.viewport.x2
        && rect.y1 * this.tileScale < this.viewport.y2)
      || (rect.x2 * this.tileScale > this.viewport.x1
        && rect.y2 * this.tileScale > this.viewport.y1);
  }
  
  public getVisibleTileArea(): Rectangle {
    if (this.world === null)
      return new Rectangle(0, 0, 0, 0);
    let area = new Rectangle(
      Math.floor(Math.max(this.viewport.x1 / this.tileScale, 0)),
      Math.floor(Math.max(this.viewport.y1 / this.tileScale, 0)),
      0, 0);
    area.x2 = Math.ceil(Math.min(this.viewport.x2 / this.tileScale, this.world.width));
    area.y2 = Math.ceil(Math.min(this.viewport.y2 / this.tileScale, this.world.height));
    return area;
  }

  public drawRect(rect: Rectangle, color: Color): void {
    // TODO Instead of offsetting all the rectangles, could the canvas context be translated and scaled as done with UIPanel?
    if (!this.isOnScreen(rect)) return;
    this._renderer.drawRect(this.viewport.toAbsolute(rect) as Rectangle, color);
  }

  public drawRectWire(rect: Rectangle, color: Color): void {
    if (!this.isOnScreen(rect)) return;
    this._renderer.drawRectWire(this.viewport.toAbsolute(rect) as Rectangle, color);
  }

  public drawLine(rect: Rectangle, color: Color, lineWidth: number = 1): void {
    if (!this.isOnScreen(rect)) return;
    this._renderer.drawLine(this.viewport.toAbsolute(rect) as Rectangle, color, lineWidth);
  }

  public drawImage(rect: Rectangle, url: string, opacity: number = 1, rotation: { deg: number, x: number, y: number } = { deg: 0, x: 0, y: 0 }): void {
    if (!this.isOnScreen(rect)) return;
    this._renderer.drawImage(this.viewport.toAbsolute(rect) as Rectangle, url, opacity, rotation);
  }

  public drawSprite(rect: Rectangle, drect: Rectangle, url: string, opacity: number = 1, rotation: { deg: number, x: number, y: number } = { deg: 0, x: 0, y: 0 }): void {
    if (!this.isOnScreen(rect)) return;
    this._renderer.drawSprite(this.viewport.toAbsolute(rect) as Rectangle, drect, url, opacity, rotation);
  }

  public drawText(rect: Rectangle, text: string, font: string, size: number, color: Color, alignment: 'left'|'center'|'right'): void {
    if (!this.isOnScreen(rect)) return;
    this._renderer.drawText(this.viewport.toAbsolute(rect) as Rectangle, text, font, size, color, alignment);
  }

  public get rendererAbsolute(): Renderer {
    return this._renderer;
  }
}