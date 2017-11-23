import Renderer from 'overmorrow/Renderer';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import UIComponent from 'overmorrow/ui/UIComponent';
import World from 'overmorrow/classes/World';
import EntityPlayer from 'overmorrow/classes/EntityPlayer';

export default class UIWorld extends UIComponent {
  private _worldRenderer: WorldRenderer = null;
  private _world: World;
  private _player: EntityPlayer = null;

  constructor(x: number, y: number, width: number, height: number, renderer: Renderer) {
    super(x, y, width, height);
    this._worldRenderer = new WorldRenderer(renderer, new Rectangle(0, 0, width, height));
  }

  public setViewport(viewport: Rectangle): UIWorld {
    this._worldRenderer.viewport = viewport;
    return this;
  }
  get viewport(): Rectangle {
    return this._worldRenderer.viewport;
  }
  set viewport(value: Rectangle) {
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
  public centerViewPort(x: number, y: number): void {
    // Center on the middle of the given world coordinates
    this._worldRenderer.viewport.x1 = x * this.tileScale - (this._worldRenderer.viewport.width / 2) + (this.tileScale / 2);
    this._worldRenderer.viewport.y1 = y * this.tileScale - (this._worldRenderer.viewport.height / 2) + (this.tileScale / 2);
    // Account for world boundaries
    if (this._worldRenderer.viewport.x1 <= 0)
      this._worldRenderer.viewport.x1 = 0;
    if (this._worldRenderer.viewport.y1 <= 0)
      this._worldRenderer.viewport.y1 = 0;
    if (this._worldRenderer.viewport.x2 >= this._world.width * this.tileScale)
      this._worldRenderer.viewport.x1 = this._world.width * this.tileScale - this._worldRenderer.viewport.width;
    if (this._worldRenderer.viewport.y2 >= this._world.height * this.tileScale)
      this._worldRenderer.viewport.y1 = this._world.height * this.tileScale - this._worldRenderer.viewport.height;
  }

  public draw(ui: Renderer): void {
    if (this._player !== null)
      this.centerViewPort(this._player.x1, this._player.y1);
    this._world.draw(this._worldRenderer);
    // TODO Should the renderer be passed to the world or the world passed to the renderer? What about the visible tile area?
  }
}

export class WorldRenderer { // Wrapper for Renderer class that handles the viewport
  public viewport: Rectangle;
  public tileScale: number; // Number of pixels a single tile occupies
  public world: World;
  private _renderer: Renderer;

  constructor(renderer: Renderer, viewport: Rectangle, tileScale: number = 16) {
    this._renderer = renderer;
    this.viewport = viewport;
    this.tileScale = tileScale;
  }

  private isOnScreen(rect: Rectangle) {
    return rect.x1 * this.tileScale < this.viewport.x2
      && rect.y1 * this.tileScale < this.viewport.y2
      && rect.x2 * this.tileScale > this.viewport.x1
      && rect.y2 * this.tileScale > this.viewport.y1;
  }

  private rectToViewPort(rect: Rectangle) {
    let rect2 = rect.clone();
    rect2.x1 *= this.tileScale;
    rect2.y1 *= this.tileScale;
    rect2.width *= this.tileScale;
    rect2.height *= this.tileScale;
    rect2.x1 -= this.viewport.x1;
    rect2.y1 -= this.viewport.y1;
    return rect2;
  }
  
  public getVisibleTileArea(): Rectangle {
    if (this.world === null)
      return new Rectangle(0, 0, 0, 0);
    return new Rectangle(0, 0, this.world.width, this.world.height);
  }

  public drawRect(rect: Rectangle, color: Color): void {
    // TODO Instead of offsetting all the rectangles, could the canvas context be translated and scaled as done with UIPanel?
    if (!this.isOnScreen(rect)) return;
    this._renderer.drawRect(this.rectToViewPort(rect), color);
  }
}