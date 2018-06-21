import Vector from "../primitives/Vector";
import World from "./World";

export default interface Passage {
  srcPos: Vector;
  destPos: Vector;
  destWorld: World;
}