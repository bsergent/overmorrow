import Item from "./Item";
import { Facing } from "../Utilities";
import EntityLiving from "./EntityLiving";
import Vector from "../primitives/Vector";
import Path from "./Path";
import World from "./World";
import Entity from "./Entity";
import EntityPlayer from "./EntityPlayer";

export default abstract class Action {
  private ticksWarmup = 0; // Decrement with time
  private ticksRecovery = 0;
  public state: ActionState = ActionState.WARMUP;

  constructor(warmup: number, recovery: number) {
    this.ticksWarmup = warmup;
    this.ticksRecovery = recovery;
  }

  public tick(delta: number, world: World, entity: EntityLiving): void {
    switch (this.state) {
      case ActionState.WARMUP:
        this.ticksWarmup--;
        if (this.ticksWarmup < 0)
          this.state = ActionState.ACT;
        else break;
      case ActionState.ACT:
        this.act(world, entity);
        if (this.isActionComplete(world, entity))
          this.state = ActionState.RECOVERY;
        else break;
      case ActionState.RECOVERY:
        this.ticksRecovery--;
        if (this.ticksRecovery < 0)
          this.state = ActionState.COMPLETE;
        else break;
      default:
        return;
    }
  }

  public isActionComplete(world: World, entity: EntityLiving): boolean {
    return true;
  }

  public abstract act(world: World, entity: EntityLiving): void;
}

export enum ActionState {
  WARMUP,
  ACT,
  RECOVERY,
  COMPLETE
}

export class ActionMove extends Action {
  private _age: number = 0;
  public velocity: Vector;

  public get age(): number {
    return this._age;
  }

  constructor(x: number, y: number) {
    super(0, 0);
    this.velocity = Vector.new(x, y);
  }

  public act(world: World, entity: EntityLiving): void {
    this._age++;
    if (entity.isAligned())
      entity.velIntended = this.velocity;
    //if (entity instanceof EntityPlayer && (entity as EntityPlayer).username === 'Wake')
    //  console.log('Acting:', this);
  }

  public isActionComplete(world: World, entity: EntityLiving): boolean {
    // End action if crossed grid boundary
    //if (this._age <= 0) return false;
    //if (entity instanceof EntityPlayer && (entity as EntityPlayer).username === 'Wake')
    //  console.log('Checking move complete:', this);
    return Math.floor(entity.x1) - Math.floor(entity.prevPos.x) > 0
      || Math.ceil(entity.x1) - Math.ceil(entity.prevPos.x) < 0
      || Math.floor(entity.y1) - Math.floor(entity.prevPos.y) > 0
      || Math.ceil(entity.y1) - Math.ceil(entity.prevPos.y) < 0;
  }
}

export class ActionPath extends Action {
  public path: Path;

  constructor(path: Path) {
    super(0, 0);
    this.path = path;
  }

  public act(world: World, entity: EntityLiving): void {
    
  }
}

export class ActionFollow extends Action {
  public target: EntityLiving;

  constructor(target: EntityLiving) {
    super(0, 0);
    this.target = target;
  }

  public act(world: World, entity: EntityLiving): void {

  }
}

export class ActionUseItem extends Action {
  public item: Item;
  public force: number;
  public actTicks: number;

  constructor(item: Item, forceMultiplier: number = 1) {
    super(item.type.weight * forceMultiplier, item.type.weight / 2);
    this.item = item;
    this.force = forceMultiplier;
    this.actTicks = this.item.type.weight;
  }

  public act(world: World, entity: EntityLiving): void {
    this.actTicks--;
    if (entity.isAligned() && this.actTicks <= 0)
      entity.useItem(world, this.item);
  }

  public isActionComplete(world: World, entity: EntityLiving): boolean {
    return this.actTicks <= 0;
  }
}