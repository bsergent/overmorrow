import Item from "./Item";
import { Facing } from "../Utilities";
import EntityLiving from "./EntityLiving";
import Vector from "../primitives/Vector";

export default class Action {
  private tickIndex: number = 0;
  public type: ActionType;
  public item: Item;
  public power: number;
  public facing: Facing;
  public targetEntity: EntityLiving;
  public targetPosition: Vector;
  public velX: number;
  public velY: number;
  public state: ActionState = ActionState.WARMUP;
  public warmupTicks: number = 1;
  public actionTicks: number = 1;
  public recoveryTicks: number = 1;

  public Action(type: ActionType) {
    this.type = type;
    switch (this.type) {
      case ActionType.NONE:
        this.state = ActionState.FINISHED;
        break;
      case ActionType.MOVE:
        this.state = ActionState.ACTION;
        break;
    }
  }

  public tick(delta: number): void {
    this.tickIndex += delta;
    if (this.state == ActionState.WARMUP && this.tickIndex >= this.warmupTicks) {
      this.state = ActionState.ACTION;
      this.tickIndex = 0;
      // Trigger useItem() on entity somehow? Maybe pass owner in for tick?
    }
    if (this.state == ActionState.ACTION && this.tickIndex >= this.actionTicks) {
      this.state = ActionState.RECOVERY;
      this.tickIndex = 0;
    }
    if (this.state == ActionState.RECOVERY && this.tickIndex >= this.recoveryTicks) {
      this.state = ActionState.FINISHED;
      this.tickIndex = 0;
    }
  }
}

export enum ActionType {
  NONE,
  MOVE,   // Sets velX and vellY
  MOVETO, // Uses A* pathfinding to navigate to tile/entity
  USEITEM
}
export enum ActionState {
  WARMUP,
  ACTION,
  RECOVERY,
  FINISHED
}