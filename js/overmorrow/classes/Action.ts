import Item from "./Item";
import { Facing } from "../Utilities";
import EntityLiving from "./EntityLiving";

export default class Action {
  public type: ActionType;
  public item: Item;
  public power: number;
  public facing: Facing;
  public target: EntityLiving;
  public currentTick: number;
  public totalTicks: number;
}

export enum ActionType {
  NONE,
  MOVE,
  USEITEM
}