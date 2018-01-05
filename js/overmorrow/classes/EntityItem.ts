import Entity from 'overmorrow/classes/Entity';
import World from 'overmorrow/classes/World';
import Item, { ItemType } from './Item';
import * as moment from '../../../node_modules/moment/moment';
import { WorldRenderer } from '../ui/UIWorld';
import Color from '../primitives/Color';

export default class EntityItem extends Entity {
  private _despawnTime: moment.Moment = null;
  private _pulseOpacity: number = 1.0;
  private _pulseSpeed: number = Math.PI * 2 / 16;
  private _pulseAngle: number = 0;
  private _pulseOffset: number = 0;
  public item: Item;

  constructor(x: number, y: number, item: Item, despawnSeconds: number = -1) {
    super(x + 0.25, y + 0.25, 0.5, 0.5, 'item', 0);
    this._collidable = false;
    this.item = item;
    if (despawnSeconds !== -1)
      this._despawnTime = moment().add(despawnSeconds, 'second');
  }

  public draw(ui: WorldRenderer): void {
    if (DEBUG)
      ui.drawRectWire(this.clone().offset(0, (1 - this._pulseOffset) / 4), this._pulseSpeed < 0.05 ? Color.green : Color.red);
    ui.drawImage(
      this.clone().offset(0, (1 - this._pulseOffset) / 4),
      this.item.image,
      0,
      this._pulseOpacity); // Opacity can make the canvas laggy, definitely need to convert to WebGL
  }
  
  public tick(delta: number, world: World): void {
    super.tick(delta, world);
    if (this._despawnTime != null) {
      let diff = moment().diff(this._despawnTime, 'second');
      if (diff > 0)
        world.removeEntity(this);
      else if (diff > -5)
        this._pulseSpeed = Math.PI * 2 / 8;
    }
    this._pulseAngle += this._pulseSpeed * delta;
    if (this._pulseAngle > Math.PI * 4) this._pulseAngle -= Math.PI * 4;
    this._pulseOpacity = Math.sin(this._pulseAngle) * 0.15 + 0.85;
    this._pulseOffset = Math.sin(this._pulseAngle / 2 - Math.PI / 4) * 0.15;
    // Check collision with other EntityLiving
    // Try to pick up if they have inventory space
    // Remove current EntityItem is picked up
    // Probably spawn some "pickup" particles
  }
}