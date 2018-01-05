import Entity from 'overmorrow/classes/Entity';
import Rectangle from 'overmorrow/primitives/Rectangle';
import World from 'overmorrow/classes/World';
import Inventory from './Inventory';
import Action from './Action';
import Item, { ItemType } from './Item';
import EntityItem from './EntityItem';
import { Direction } from '../Utilities';

export default abstract class EntityLiving extends Entity {
  // Defines entities with inventory that can use items and engage in combat
  protected _health: number;
  protected _maxHealth: number;
  protected _action: Action = null;
  protected _inventory: Inventory = null;
  protected _speedSprint: number;
  public direction: Direction = Direction.SOUTH; // Direction attacking/blocking, not visual

  public get health(): number {
    return this._health;
  }
  public set health(value: number) {
    this._health = value;
  }
  public get maxHealth(): number {
    return this._maxHealth;
  }
	public get speedSprint(): number {
		return this._speedSprint;
  }

  constructor(x: number, y: number, width: number, height: number, type: string, speedWalk: number, speedSprint: number, maxHealth: number) {
    super(x, y, width, height, type, speedWalk);
    this._speedSprint = speedSprint;
    this._maxHealth = maxHealth;
    this._health = this._maxHealth;
  }

  protected die(world: World) {
    // Drop items into world
    if (this._inventory !== null)
      for (let item of this._inventory.getItems())
        world.addEntity(new EntityItem(this.x1, this.y1, item, 30));
    // TODO Leave behind some particle effects or something
    world.removeEntity(this);
  }

  protected useItem(world: World, item: Item): void {
    item.type.action(item, world, this);
  }

  public defendAgainst(attacker: EntityLiving, item: Item, direction: number): void {
    // Handle combat and damage
    // Check blocking direction
    // Check is item can even block
    throw new Error("Method not implemented.");
  }

  public giveItem(item: Item): Item {
    if (this._inventory === null)
      return item;
    return this._inventory.addItem(item);
  }

  public takeItem(type: ItemType, amt: number): Item {
    throw new Error("Method not implemented.");
  }

  public tick(delta: number, world: World): void {
    super.tick(delta, world);
    if (this._health <= 0)
      this.die(world);
  }
}