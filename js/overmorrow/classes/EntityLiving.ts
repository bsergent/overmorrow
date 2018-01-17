import Entity from 'overmorrow/classes/Entity';
import Rectangle from 'overmorrow/primitives/Rectangle';
import World from 'overmorrow/classes/World';
import Inventory from './Inventory';
import Action from './Action';
import Item, { ItemType } from './Item';
import EntityItem from './EntityItem';
import { Direction, directionToVector } from '../Utilities';
import Vector from '../primitives/Vector';

export default abstract class EntityLiving extends Entity {
  // Defines entities with inventory that can use items and engage in combat
  private   _fatigueTicks: number = 0;
  protected _health: number;
  protected _stamina: number;
  protected _maxHealth: number;
  protected _maxStamina: number;
  protected _action: Action = null;
  protected _inventory: Inventory = null;
  protected _speedSprint: number;
  public    direction: Direction = Direction.SOUTH; // Direction attacking/blocking, not visual
  public    itemPrimary: Item = null;
  public    itemSecondary: Item = null;
  public    action: Action = null;

  public get health(): number {
    return this._health;
  }
  public set health(value: number) {
    this._health = value;
  }
  public get maxHealth(): number {
    return this._maxHealth;
  }
  public get stamina(): number {
    return this._stamina;
  }
  public set stamina(value: number) {
    if (value < this._stamina)
      this._fatigueTicks = Math.max(value > 0 ? 20 : 100, this._fatigueTicks);
    if (value > this._maxStamina)
      value = this._maxStamina;
    this._stamina = value < 0 ? 0 : value;
  }
  public get maxStamina(): number {
    return this._maxStamina;
  }
	public get speedSprint(): number {
		return this._speedSprint;
  }

  constructor(x: number, y: number, width: number, height: number, type: string, speedWalk: number, speedSprint: number, maxHealth: number, maxStamina: number) {
    super(x, y, width, height, type, speedWalk);
    this._speedSprint = speedSprint;
    this._maxHealth = maxHealth;
    this._health = this._maxHealth;
    this._maxStamina = maxStamina;
    this._stamina = this._maxStamina;
  }

  protected die(world: World) {
    // Drop items into world
    if (this._inventory !== null)
      for (let item of this._inventory.getItems())
        world.addEntity(new EntityItem(this.x1, this.y1, item, 30));
    // TODO Leave behind some particle effects or something
    world.removeEntity(this);
  }

  public useItem(world: World, item: Item): void {
    item.type.action(item, world, this);
  }

  public canBlock(): boolean {
    return (this.itemPrimary !== null && this.itemPrimary.type.canBlock)
      || (this.itemSecondary !== null && this.itemSecondary.type.canBlock);
  }

  public isFatigued(): boolean {
    return this._fatigueTicks > 20;
  }

  public defendAgainst(attacker: EntityLiving, item: Item): void {
    //if (attacker.action == null) return;
    //let damage: number = attacker.action.power; // Strong/weak attack damage is handled by the Action initialization
    let damage: number = item.power; // Replace once actions are implemented
    let aVec: Vector = directionToVector(attacker.direction);
    let dVec: Vector = directionToVector(this.direction);

    // Check direct attack
    if (!attacker.clone().offsetByVector(aVec).intersects(this))
      damage /= 2;

    if (DEBUG) {
      console.log(`xP: ${attacker.x1}-${this.x1} == ${dVec.x}-${aVec.x}`);
      console.log(`yP: ${attacker.y1}-${this.y1} == ${dVec.y}-${aVec.y}`);
      console.log(`xV: ${aVec.x}*(=x?1:-1) == ${dVec.x}`);
      console.log(`yV: ${aVec.y}*(=y?1:-1) == ${dVec.y}`);
    }
    // Check if direct block based on relative positions
    //  No real idea how this works.
    if (Math.sign(attacker.x1 - this.x1) === Math.sign(dVec.x - aVec.x)
        && Math.sign(attacker.y1 - this.y1) === Math.sign(dVec.y - aVec.y)
        && ((aVec.x == 0 && dVec.y === 0)
          || (aVec.y === 0 && dVec.x === 0)
          || (aVec.x * (attacker.x1 === this.x1 ? 1 : -1) === dVec.x
            && aVec.y * (attacker.y1 === this.y1 ? 1 : -1) === dVec.y)))
      damage /= 8;

    this._health -= damage;
    if (DEBUG) console.log(`${this.type}#${this.id} took ${damage} damage.`);

    // Cancel defender's action
    if (this._action !== null && Math.random() < 0.7)
      this._action = null;
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
    if (this.stamina <= 0)
      this.velIntended.magnitude = Math.min(this.velIntended.magnitude, this._speed);
    super.tick(delta, world);

    if (this.vel.magnitude === this._speedSprint)
      this.stamina -= 0.05 * delta;
    else if (this._fatigueTicks <= 0)
      this.stamina += 0.03 * delta;

    this._fatigueTicks -= delta;
    if (this._health <= 0)
      this.die(world);
  }
}