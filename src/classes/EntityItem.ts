import Entity from './Entity';
import World from './World';
import Item, { ItemType } from './Item';
import * as moment from 'moment';
import { WorldRenderer } from '../ui/UIWorld';
import Color from '../primitives/Color';
import EntityLiving from './EntityLiving';

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
      ui.drawRectWire(this.clone().offset(0, (1 - this._pulseOffset) / 4), this._pulseSpeed < Math.PI * 4 / 16 ? Color.GREEN : Color.RED);
    ui.drawImage(
      this.clone().offset(0, (1 - this._pulseOffset) / 4),
      this.item.image,
      this._pulseOpacity); // Opacity can make the canvas laggy, definitely need to convert to WebGL
  }
  
  public tick(delta: number, world: World): void {
    super.tick(delta, world);
    if (this._despawnTime != null) {
      let diff = moment().diff(this._despawnTime, 'second');
      if (diff > 0)
        world.removeEntity(this);
      else if (diff > -5)
        this._pulseSpeed = Math.PI * 4 / 16;
    }
    this._pulseAngle += this._pulseSpeed * delta;
    if (this._pulseAngle > Math.PI * 4) this._pulseAngle -= Math.PI * 4;
    this._pulseOpacity = Math.sin(this._pulseAngle) * 0.15 + 0.85;
    this._pulseOffset = Math.sin(this._pulseAngle / 2 - Math.PI / 4) * 0.15;
    // Check collision with other EntityLiving
    // Try to pick up if they have inventory space
    // Remove current EntityItem if picked up
    // Probably spawn some "pickup" particles
  }

  public collidedBy(world: World, collider: Entity): void {
    super.collidedBy(world, collider);
    if (collider instanceof EntityLiving) {
      this.item = collider.inventory.addItem(this.item);
      if (this.item === null || this.item.quantity <= 0)
        world.removeEntity(this);
    }
  }
}