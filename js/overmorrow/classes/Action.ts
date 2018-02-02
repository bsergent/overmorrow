import Item from "./Item";
import { Facing } from "../Utilities";
import EntityLiving from "./EntityLiving";
import Vector from "../primitives/Vector";
import Path from "./Path";
import World from "./World";
import Entity from "./Entity";

export default abstract class Action {
  private ticksWarmup = 0; // Decrement with time
  private ticksRecovery = 0;
  public state: ActionState = ActionState.WARMUP;

  constructor(warmup: number, recovery: number) {
    this.ticksWarmup = warmup;
    this.ticksRecovery = recovery;
    if (this.ticksWarmup > 0) console.log('Warming up');
  }

  public tick(delta: number, world: World, entity: EntityLiving): void {
    switch (this.state) {
      case ActionState.WARMUP:
        this.ticksWarmup--;
        if (this.ticksWarmup <= 0) {
          this.state = ActionState.ACT;
          if (!this.isActionComplete(world, entity)) console.log('Acting');
        }
        break;
      case ActionState.ACT:
        if (this.isActionComplete(world, entity)) {
          this.state = ActionState.RECOVERY;
          if (this.ticksRecovery > 0) console.log('Recovering');
        } else
          this.act(world, entity);
        break;
      case ActionState.RECOVERY:
        this.ticksRecovery--;
        if (this.ticksRecovery <= 0) {
          this.state = ActionState.COMPLETE;
          console.log('Idle');
        }
        break;
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
  public velocity: Vector;
  private hasBeenUnaligned: boolean = false;

  constructor(x: number, y: number) {
    super(0, 0);
    this.velocity = new Vector(x, y);
  }

  public act(world: World, entity: EntityLiving): void {
    this.hasBeenUnaligned = this.hasBeenUnaligned || !entity.isAligned();
    if (entity.isAligned())
      entity.velIntended = this.velocity;
  }

  public isActionComplete(world: World, entity: EntityLiving): boolean {
    return this.hasBeenUnaligned && entity.isAligned();
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
    super(item.type.weight * forceMultiplier, item.type.weight);
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