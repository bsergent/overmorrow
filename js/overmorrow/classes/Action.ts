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
  private _type: string = '';
  public state: ActionState = ActionState.WARMUP;

  constructor(warmup: number, recovery: number, typeID: string) {
    this.ticksWarmup = warmup;
    this.ticksRecovery = recovery;
    this._type = typeID;
  }

  public get type(): string {
    return this._type;
  }

  public tick(delta: number, world: World, entity: EntityLiving): void {
    switch (this.state) {
      case ActionState.WARMUP:
        if (--this.ticksWarmup < 0)
          this.state = ActionState.ACT;
        else break;
      case ActionState.ACT:
        this.act(world, entity);
        if (this.isActionComplete(world, entity))
          this.state = ActionState.RECOVERY;
        else break;
      case ActionState.RECOVERY:
        if (--this.ticksRecovery < 0)
          this.state = ActionState.COMPLETE;
        else break;
      default:
        return;
    }
  }

  public isActionComplete(world: World, entity: EntityLiving): boolean {
    return true;
  }

  public equals(action: Action): boolean {
    return action !== null && this._type === action._type;
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
    super(0, 0, 'move');
    this.velocity = new Vector(x, y);
  }

  public act(world: World, entity: EntityLiving): void {
    this._age++;
    entity.vel = this.velocity;
  }

  // private static LASTSTATE: boolean = true;
  public isActionComplete(world: World, entity: EntityLiving): boolean {
    // End action if crossed subgrid boundary
    let completed = Math.floor(entity.x1 * world.subGridDivisions) - Math.floor(entity.prevPos.x * world.subGridDivisions) > 0
    || Math.ceil(entity.x1 * world.subGridDivisions) - Math.ceil(entity.prevPos.x * world.subGridDivisions) < 0
    || Math.floor(entity.y1 * world.subGridDivisions) - Math.floor(entity.prevPos.y * world.subGridDivisions) > 0
    || Math.ceil(entity.y1 * world.subGridDivisions) - Math.ceil(entity.prevPos.y * world.subGridDivisions) < 0;
    // if (entity.type === 'player' && (entity as EntityPlayer).username === 'Wake' && ActionMove.LASTSTATE !== completed)
    //   console.log('Move completed: ' + completed);
    // ActionMove.LASTSTATE = completed;
    return completed;
  }

  public equals(action: Action): boolean {
    return super.equals(action) && this.velocity.equals((action as ActionMove).velocity);
  }
}

export class ActionPath extends Action {
  public path: Path;

  constructor(path: Path) {
    super(0, 0, 'path');
    this.path = path;
  }

  public act(world: World, entity: EntityLiving): void {
    
  }
}

export class ActionFollow extends Action {
  public target: EntityLiving;

  constructor(target: EntityLiving) {
    super(0, 0, 'follow');
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
    super(item.type.weight * forceMultiplier, item.type.weight / 2, 'useitem');
    this.item = item;
    this.force = forceMultiplier;
    this.actTicks = this.item.type.weight;
  }

  public act(world: World, entity: EntityLiving): void {
    if (this.actTicks-- === this.item.type.weight)
      entity.useItem(world, this.item);
  }

  public isActionComplete(world: World, entity: EntityLiving): boolean {
    return this.actTicks <= 0;
  }
}