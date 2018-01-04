import Entity from 'overmorrow/classes/Entity';
import Rectangle from 'overmorrow/primitives/Rectangle';
import World from 'overmorrow/classes/World';
import { Direction } from '../Utilities';
import Inventory from './Inventory';
import Action from './Action';
import Item from './Item';
import EntityItem from './EntityItem';

export default abstract class EntityLiving extends Entity {
  // Defines entities with inventory that can use items and engage in combat
  private _health: number;
  private _maxHealth: number;
  private _action: Action = null;
  private _inventory: Inventory = null;

  public get health(): number {
    return this._health;
  }
  public set health(value: number) {
    this._health = value;
  }
  public get maxHealth(): number {
    return this._maxHealth;
  }

  constructor(x: number, y: number, width: number, height: number, type: string, speed1: number, speed2: number, maxHealth: number) {
    super(x, y, width, height, type, speed1, speed2);
    this._maxHealth = maxHealth;
    this._health = this._maxHealth;
  }

  public defendAgainst(attacker: EntityLiving, item: Item, dir: Direction): void {
    // Handle combat and damage
    throw new Error("Method not implemented.");
  }

  protected useItem(world: World): void {
    // For weapons, check for entities using world.getEntityAt() and then call defend() on them
    // For consumables, just cause whatever effects are needed
    throw new Error("Method not implemented.");
  }

  private die(world: World) {
    // Drop items into world
    for (let item of this._inventory.getItems())
      world.addEntity(new EntityItem(this.x1, this.y1, item));
    // TODO Leave behind some particle effects or something
    world.removeEntity(this);
  }

  public tick(delta: number, world: World): void {
    super.tick(delta, world);
    if (this._health <= 0)
      this.die(world);
  }
}