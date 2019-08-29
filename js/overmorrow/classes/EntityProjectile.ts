import Entity from 'overmorrow/classes/Entity';
import World from 'overmorrow/classes/World';
import { WorldRenderer } from '../ui/UIWorld';
import EntityItem from './EntityItem';
import Item from './Item';
import Color from '../primitives/Color';
import Vector from '../primitives/Vector';
import EntityLiving from './EntityLiving';

export default class EntityProjectile extends Entity {
  protected _trajectory: number = 0; // Direction of movement in degrees
  public item: Item = null;

  public get trajectory(): number {
    return this._trajectory;
  }
  public set trajectory(value: number) {
    while (value >= 360) value -= 360;
    while (value < 0) value += 360;
    this._trajectory = value;
    this.vel = Vector.unitVecFromDeg(this._trajectory);
    this.vel.magnitude = this._speed;
  }

  constructor(x: number, y: number, width: number, height: number, speed: number, trajectory: number, item: Item) {
    super(x, y, width, height, 'projectile', speed);
    this.trajectory = trajectory;
    this.item = item;
  }

  protected die(world: World) {
    // Drop items into world
    if (this.item !== null)
      world.addEntity(new EntityItem(this.x1, this.y1, this.item, 30));
    world.removeEntity(this);
  }
  
	public draw(ui: WorldRenderer): void {
    if (DEBUG) ui.drawRectWire(this, Color.WHITE);
    ui.drawSprite(this, null, this.item.image, 1, { deg: this._trajectory+45, x: 0.5, y: 0.5 });
  }

  public tick(delta: number, world: World): void {
    super.tick(delta, world);
    if (this.vel.magnitude === 0)
      this.die(world);
  }

  public collide(world: World, collider: Entity): void {
    // TODO Fix arrows colliding w/ themselves
    if (collider instanceof EntityLiving)
      collider.health -= this.item.power;
    else
      this.die(world);
  }
}