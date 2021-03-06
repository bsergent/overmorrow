import Entity from './Entity';
import Rectangle from '../primitives/Rectangle';
import World from './World';
import Inventory from './Inventory';
import Action, { ActionState, ActionUseItem, ActionMove } from './Action';
import Item, { ItemType } from './Item';
import EntityItem from './EntityItem';
import { Direction, directionToVector } from '../Utilities';
import Vector from '../primitives/Vector';
import { WorldRenderer } from '../ui/UIWorld';
import Color from '../primitives/Color';
import { DEBUG } from '../Game';

export default abstract class EntityLiving extends Entity {
  // Defines entities with inventory that can use items and engage in combat
  private   _fatigueTicks: number = 0;
  protected _health: number;
  protected _stamina: number;
  protected _maxHealth: number;
  protected _maxStamina: number;
  protected _action: Action = null;
  protected _actionQueued: Action = null;
  protected _inventory: Inventory = null;
  protected _speedSprint: number;
  protected _direction: Direction = Direction.SOUTH; // Direction attacking/blocking, not visual
  public itemPrimary: Item = null; // TODO This should be an index into their inventory instead of an item
  public itemSecondary: Item = null;
  public name: string = '';

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
  public get action(): Action {
    return this._action;
  }
  public get inventory(): Inventory {
    return this._inventory;
  }
  public get direction(): Direction {
    return this._direction;
  }
  public set direction(value: Direction) {
    if (this._action !== null
        && this._action instanceof ActionUseItem
        && this._action.state !== ActionState.COMPLETE)
      return;
    this._direction = value;
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
        world.addEntity(new EntityItem(this.x1, this.y1, item, 300));
    // TODO Leave behind some particle effects or something
    world.removeEntity(this);
  }

  // public setAction(action: Action): void {
  //   if (this._action !== null) {
  //     if (typeof(this._action) !== typeof(action)) return;
  //     if (this._action.state !== ActionState.COMPLETE
  //       && !(this._action instanceof ActionMove/* && (this._action as ActionMove).age > 3*/)) return;
  //     if (this._action instanceof ActionUseItem
  //         && this.isFatigued())
  //       return;
  //   }
  //   this._action = action;
  // }

  public queueAction(action: Action): void {
    //if (this.type === 'slime') console.log(`Slime queuing ${action.type} action`);
    this._actionQueued = action;
  }

  private popAction(): void {
    if (this._actionQueued !== null)
      this._action = this._actionQueued;
    if (this._action !== null && !this._action.equals(this._actionQueued))
      this._actionQueued = null;
  }

  public useItem(world: World, item: Item): void {
    if (item !== null) item.type.action(item, world, this);
  }

  public canBlock(): boolean {
    return (this.itemPrimary !== null && this.itemPrimary.type.canBlock)
      || (this.itemSecondary !== null && this.itemSecondary.type.canBlock);
  }

  public isFatigued(): boolean {
    return this._fatigueTicks > 20;
  }

  public defendAgainst(attacker: EntityLiving, item: Item): void {
    if (attacker.action === null || !(attacker.action instanceof ActionUseItem)) return;
    let aAction = attacker.action as ActionUseItem;
    let damage: number = item.power * aAction.force;
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
    // TODO Spawn particles upon damage
  }

  public giveItem(item: Item): Item {
    if (this._inventory === null)
      return item;
    return this._inventory.addItem(item);
  }

  public takeItem(type: ItemType, amt: number): Item {
    throw new Error("Method not implemented.");
  }
  
	public draw(ui: WorldRenderer): void {
    if (DEBUG) {
      ui.drawRectWire(this, this.isFatigued() ? Color.WHITE : Color.GREEN);
      ui.drawRect(new Rectangle(this.x1, this.y1 + 1.02, this.width, 0.05), Color.RED);
      ui.drawRect(new Rectangle(this.x1, this.y1 + 1.02, this.width * this.health / this.maxHealth , 0.05), Color.LIME);
      let vec = directionToVector(this.direction);
      vec.magnitude = 1;
      ui.drawLine(new Rectangle(this.x1 + 0.5, this.y1 + 0.5, vec.x, vec.y), Color.RED, 3);
      ui.drawText(this.clone().offset(this.width / 2, 1.2),
        this._action === null ? 'Rest' : `${this._action.constructor.name} - ${ActionState[this._action.state]}`,
        'Courier', 10, Color.WHITE, 'center');
    }
    if (this.name !== '')
      ui.drawText(this.clone().offset(this.width / 2, 1.1), DEBUG ? `${this.name} [${this.id}]`: this.name, 'Courier', 12, Color.WHITE, 'center');
  }

  public tick(delta: number, world: World): void {
		// Action
		// Allow only walking action while fatigued
		if (this.isFatigued() && this._actionQueued !== null && (this._actionQueued.type !== 'move'
				|| (this._actionQueued.type === 'move' && (this._actionQueued as ActionMove).velocity.magnitude > this.speed)))
      this._actionQueued = null;
    if (this._action === null || this._action.state == ActionState.COMPLETE && this.isAligned(world))
      this.popAction();
    if (this._action !== null)
      this._action.tick(delta, world, this);

    super.tick(delta, world);
    // if (this.type === 'player' && (this as EntityPlayer).username === 'Wake'
    //     && this._action !== null && this._action.type === 'move')
    //   console.log('Action:', (this._action as ActionMove).velocity);

    // Align to grid and stop
    if (this._action !== null && this._action.isActionComplete(world, this) && !this._action.equals(this._actionQueued)) {
      // Alignment
      this.forceAlign(world);

      // Stop movement
      this._action = null;
      this.vel.magnitude = 0;
    }

    // Stamina and Fatigue
    if (this.vel.magnitude === this._speedSprint)
      this.stamina -= 0.05 * delta;
    else if (this._fatigueTicks <= 0)
      this.stamina += 0.03 * delta;
    this._fatigueTicks -= delta;

    // Health
    if (this._health <= 0)
      this.die(world);

    this._actionQueued = null;
  }

  public isAligned(world: World): boolean {
    return this.x1 * world.subGridDivisions % 1 === 0
      && this.y1 * world.subGridDivisions % 1 === 0;
  }

  public isMajorAligned(): boolean {
    return this.x1 % 1 === 0 && this.y1 % 1 === 0;
  }

  private floorSubDiv(val: number, world: World): number {
    return Math.floor(val * world.subGridDivisions) / world.subGridDivisions;
  }

  private ceilSubDiv(val: number, world: World): number {
    return Math.ceil(val * world.subGridDivisions) / world.subGridDivisions;
  }

  private roundSubDiv(val: number, world: World): number {
    return Math.round(val * world.subGridDivisions) / world.subGridDivisions;
  }
  
  public forceAlign(world: World, round: boolean = false) {
    if (round) {
      this.x1 = this.roundSubDiv(this._prevPos.x, world);
      this.y1 = this.roundSubDiv(this._prevPos.y, world);
    } else {
      if (this.floorSubDiv(this.x1, world) - this.floorSubDiv(this._prevPos.x, world) > 0)
        this.x1 = this.floorSubDiv(this.x1, world);
      if (this.ceilSubDiv(this.x1, world) - this.ceilSubDiv(this._prevPos.x, world) < 0)
        this.x1 = this.ceilSubDiv(this.x1, world);
      if (this.floorSubDiv(this.y1, world) - this.floorSubDiv(this._prevPos.y, world) > 0)
        this.y1 = this.floorSubDiv(this.y1, world);
      if (this.ceilSubDiv(this.y1, world) - this.ceilSubDiv(this._prevPos.y, world) < 0)
        this.y1 = this.ceilSubDiv(this.y1, world);
    }
  }

	public revertMovement(world: World): void {
		this.forceAlign(world, true);
		this.vel.magnitude = 0;
		this._action = null;
	}
}