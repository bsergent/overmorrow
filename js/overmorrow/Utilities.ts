import * as moment from '../../node_modules/moment/moment';
import Vector from './primitives/Vector';

export class TimeKeep {
  public lastTwentyTickTimes: number[] = [];
  public lastTwentyDrawTimes: number[] = [];
  private _index: number = 0;
  private _avgTPS: number = 1;
  private _delta: number = 1;
  private _globalStartTime: moment.Moment;
  private _currentStartTime: moment.Moment;
  private _totalTicks: number;
  private _lastFrameTime: number = 1;
  private _minFrameTime = 50;//250; // in milliseconds

  constructor() {
    this._globalStartTime = moment();
    this._currentStartTime = moment();
  }

  public addTick(tick: number): void {
    this._totalTicks++;
    if (this.lastTwentyTickTimes.length < 20)
      this.lastTwentyTickTimes.push(tick);
    else
      this.lastTwentyTickTimes[this._index] = tick;
  }
  public addDraw(draw: number): void {
    if (this.lastTwentyDrawTimes.length < 20)
      this.lastTwentyDrawTimes.push(draw);
    else
      this.lastTwentyDrawTimes[this._index] = draw;
  }
  public getTPS(): number {
    if (this._index != 0) return this._avgTPS;
    let frame = this._minFrameTime - this.getTimeToWait();
    if (frame <= 0) frame = 1;
    this._avgTPS = 1000 / frame;
    return this._avgTPS;
  }
  public getDelta(): number {
    this._delta = Math.floor(this._lastFrameTime / this._minFrameTime);
    return this._delta !== 0 ? this._delta : 1;
  }
  public getTimeToWait(): number {
    return this._minFrameTime - this._lastFrameTime < 0 ? 0 : this._minFrameTime - this._lastFrameTime;
  }
  public startUpdate(): void {
    this._currentStartTime = moment();
  }
  public completeUpdate(): void {
    this._lastFrameTime = moment().diff(this._currentStartTime);
    this._index++;
    if (this._index > 20)
      this._index = 0;
  }
}

export enum Facing {
  UP = 2,
  RIGHT = 3,
  DOWN = 0, 
  LEFT = 1,
}

export enum Direction {
  SOUTH = 0,
  SOUTHWEST = 45,
  WEST = 90,
  NORTHWEST = 135,
  NORTH = 180,
  NORTHEAST = 225,
  EAST = 270,
  SOUTHEAST = 315
}

export function degreesToDirection(degrees: number): Direction { // Assuming 0deg = East, 90deg = South, etc.
  // Normalize degrees
  while (degrees < 0) degrees += 360;
  while (degrees >= 360) degrees -= 360;
  // Convert to cardinal number
  degrees += 22.5;
  degrees /= 45;
  // Convert to cardinal string
  var directions = [
    Direction.EAST,
    Direction.SOUTHEAST,
    Direction.SOUTH,
    Direction.SOUTHWEST,
    Direction.WEST,
    Direction.NORTHWEST,
    Direction.NORTH,
    Direction.NORTHEAST,
    Direction.EAST
  ];
  return directions[Math.floor(degrees)];
}

export function facingToDirection(facing: Facing): Direction {
  switch (facing) {
    case Facing.DOWN:
      return Direction.SOUTH;
    case Facing.LEFT:
      return Direction.WEST;
    case Facing.UP:
      return Direction.NORTH;
    case Facing.RIGHT:
      return Direction.EAST;
  }
}

export function directionToVector(dir: Direction): Vector {
  // Returns unit vector in the direction
  let vec = new Vector(0, 0);
  switch (dir) {
    case Direction.SOUTH:
      vec.y = 1;
      break;
    case Direction.SOUTHWEST:
      vec.x = -1;
      vec.y = 1;
      break;
    case Direction.WEST:
      vec.x = -1;
      break;
    case Direction.NORTHWEST:
      vec.x = -1;
      vec.y = -1;
      break;
    case Direction.NORTH:
      vec.y = -1;
      break;
    case Direction.NORTHEAST:
      vec.x = 1;
      vec.y = -1;
      break;
    case Direction.EAST:
      vec.x = 1;
      break;
    case Direction.SOUTHEAST:
      vec.x = 1;
      vec.y = 1;
      break;
  }
  vec.magnitude = 1;
  return vec;
}

export class Perlin {

}

export function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}