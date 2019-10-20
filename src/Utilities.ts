import * as moment from '../node_modules/moment/moment';
import Vector from './primitives/Vector';
import Rectangle from './primitives/Rectangle';

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
  public setMinFrameTime(milliseconds: number = 50): void {
    this._minFrameTime = milliseconds;
  }
}

export enum Facing {
  UP = 2,
  RIGHT = 3,
  DOWN = 0, 
  LEFT = 1,
}

export enum Direction {
  EAST = 0,
  SOUTHEAST = 45,
  SOUTH = 90,
  SOUTHWEST = 135,
  WEST = 180,
  NORTHWEST = 225,
  NORTH = 270,
  NORTHEAST = 315
}

/**
 * Assumes 0deg=East, 90deg=South, etc.
 */
export function degreesToDirection(degrees: number): Direction {
  // Normalize degrees
  while (degrees < 0) degrees += 360;
  while (degrees >= 360) degrees -= 360;
  // Convert to cardinal number
  degrees += 22.5;
  degrees /= 45;
  // Convert to cardinal direction
  let directions = [
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
  //vec.magnitude = 1;
  return vec;
}

export class Perlin {                                                       
  // Found at http://www.xna-connection.com/post/Algorithme-de-Perlin-Noise-en-C
  // Adapted from https://gist.github.com/bellbind/3186926
  // Was already 6 years old when it was added, so no more help on this, might need to create my own

  private _mask: number = 0xff;
  private _size: number;
  private _values: Uint8Array;

  constructor(randomFunc: Function = Math.random) {
    this._size = this._mask + 1;
    this._values = new Uint8Array(this._size * 2)
    for (let i = 0; i < this._size; i++)
      this._values[i] = this._values[this._size + i] = 0|(randomFunc() * 0xff);
  }

  public get1d(x: number): number {
    return this.noise1d(x);
  }
  public get2d(x: number, y: number): number {
    return this.noise2d(x, y);
  }
  public get3d(x: number, y: number, z: number): number {
    return this.noise3d(x, y, z);
  }

  private lerp(t, a, b) {
    return a + t * (b - a);
  }
  private fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private grad1d(hash, x) {
    return (hash & 1) === 0 ? x : -x;
  }
  private grad2d(hash, x, y) {
    let u = (hash & 2) === 0 ? x : -x;
    let v = (hash & 1) === 0 ? y : -y;
    return u + v;
  }
  private grad3d(hash, x, y, z) {
    let h = hash & 15;
    let u = h < 8 ? x : y;
    let v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + (((h & 1) === 0) ? v : -v);
  }

  private noise1d(x) {
    let intX = (0|x) & this._mask;
    let fracX = x - (0|x);
    let t = this.fade(fracX);
    let a = this.grad1d(this._values[intX], fracX);
    let b = this.grad1d(this._values[intX + 1], fracX - 1);
    return this.lerp(t, a, b);
  }
  private noise2d(x, y) {
    let intX = (0|x) & this._mask;
    let intY = (0|y) & this._mask;
    let fracX = x - (0|x);
    let fracY = y - (0|y);
    let r1 = this._values[intX] + intY;
    let r2 = this._values[intX + 1] + intY;
    let t1 = this.fade(fracX);
    let t2 = this.fade(fracY);
    
    let a1 = this.grad2d(this._values[r1], fracX, fracY);
    let b1 = this.grad2d(this._values[r2], fracX - 1, fracY);
    let a2 = this.grad2d(this._values[r1 + 1], fracX, fracY - 1);
    let b2 = this.grad2d(this._values[r2 + 1], fracX - 1, fracY - 1);
    return this.lerp(t2, this.lerp(t1, a1, b1), this.lerp(t1, a2, b2));
  }
  private noise3d(x, y, z) {
    let intX = (0|x) & this._mask;
    let intY = (0|y) & this._mask;
    let intZ = (0|z) & this._mask;
    let fracX = x - (0|x);
    let fracY = y - (0|y);
    let fracZ = z - (0|z);
    let r1 = this._values[intX] + intY;
    let r11 = this._values[r1] + intZ;
    let r12 = this._values[r1 + 1] + intZ;
    let r2 = this._values[intX + 1] + intY;
    let r21 = this._values[r2] + intZ;
    let r22 = this._values[r2 + 1] + intZ;
    let t1 = this.fade(fracX);
    let t2 = this.fade(fracY);
    let t3 = this.fade(fracZ);
    
    let a11 = this.grad3d(this._values[r11], fracX, fracY, fracZ);
    let b11 = this.grad3d(this._values[r21], fracX - 1, fracY, fracZ);
    let a12 = this.grad3d(this._values[r12], fracX, fracY - 1, fracZ);
    let b12 = this.grad3d(this._values[r22], fracX - 1, fracY - 1, fracZ);
    
    let a21 = this.grad3d(this._values[r11 + 1], fracX, fracY, fracZ - 1);
    let b21 = this.grad3d(this._values[r21 + 1], fracX - 1, fracY, fracZ - 1);
    let a22 = this.grad3d(this._values[r12 + 1], fracX, fracY - 1, fracZ - 1);
    let b22 = this.grad3d(this._values[r22 + 1], fracX - 1, fracY - 1, fracZ - 1);
    
    return this.lerp(t3,
      this.lerp(t2, this.lerp(t1, a11, b11), this.lerp(t1, a12, b12)),
      this.lerp(t2, this.lerp(t1, a21, b21), this.lerp(t1, a22, b22)));
  }
}

export class SeededRandom {
  // Taken from https://github.com/skratchdot/random-seed
  // Included in Utilities since I couldn't get requirejs to correctly import it
	private _n = 0xefc8249d;
  private mash(data?): number {
    if (data) {
			data = data.toString();
			for (let i = 0; i < data.length; i++) {
				this._n += data.charCodeAt(i);
				let h = 0.02519603282416938 * this._n;
				this._n = h >>> 0;
				h -= this._n;
				h *= this._n;
				this._n = h >>> 0;
				h -= this._n;
				this._n += h * 0x100000000; // 2^32
			}
			return (this._n >>> 0) * 2.3283064365386963e-10; // 2^-32
		} else {
			this._n = 0xefc8249d;
		}
  }

  private _o = 48; // Order of ENTROPY-holding 32-bit values
  private _c = 1; // Carry used by the multiply-with-carry (MWC) algorithm
  private _p; // = this._o // Phase (max-1) of the intermediate variable pointer
  private _s; // = new Array(this._o)

  constructor(seed?: string) {
    this._p = this._o;
    this._s = new Array(this._o);
		for (let i = 0; i < this._o; i++)
      this._s[i] = this.mash(Math.random());
    if (seed !== null)
      this.seed(seed);
  }

  private rawprng() {
    if (++this._p >= this._o)
      this._p = 0;
    let t = 1768863 * this._s[this._p] + this._c * 2.3283064365386963e-10; // 2^-32
    return this._s[this._p] = t - (this._c = t | 0);
  }

  private seed(seed: string) {
    if (typeof seed === 'undefined' || seed === null)
      seed = Math.random().toString();
    this.initState();
    this.hashString(seed);
  }

  private initState() {
    this.mash(); // pass a null arg to force mash hash to init
    for (let i = 0; i < this._o; i++) {
      this._s[i] = this.mash(' '); // fill the array with initial mash hash values
    }
    this._c = 1; // init our multiply-with-carry carry
    this._p = this._o; // init our phase
  };
  
  private hashString(inStr) {
    inStr = this.cleanString(inStr);
    this.mash(inStr); // use the string to evolve the 'mash' state
    for (let i = 0; i < inStr.length; i++) { // scan through the characters in our string
      let k = inStr.charCodeAt(i); // get the character code at the location
      for (let j = 0; j < this._o; j++) { //	"mash" it into the UHEPRNG state
        this._s[j] -= this.mash(k);
        if (this._s[j] < 0)
          this._s[j] += 1;
      }
    }
  }

  private cleanString(inStr) {
    inStr = inStr.replace(/(^\s*)|(\s*$)/gi, ''); // remove any/all leading spaces
    inStr = inStr.replace(/[\x00-\x1F]/gi, ''); // remove any/all control characters
    inStr = inStr.replace(/\n /, '\n'); // remove any/all trailing spaces
    return inStr; // return the cleaned up result
  }

  /**
   * @returns Random integer between 0 (inclusive) and range (exclusive)
   */
  public range(range: number): number {
    return Math.floor(range * (this.rawprng() + (this.rawprng() * 0x200000 | 0) * 1.1102230246251565e-16)); // 2^-53
  }

  /**
   * @returns Random float between 0 (inclusive) and 1 (exclusive)
   */
  public random(): number {
    return this.range(Number.MAX_VALUE - 1) / Number.MAX_VALUE;
  }

  /**
   * @returns Random float between min (inclusive) and max (exclusive)
   */
  public floatBetween(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  /**
   * @returns Random integer between min (inclusive) and max (inclusive)
   */
  public intBetween(min, max): number {
    if (min > max) {
      min = min ^ max;
      max = min ^ max;
      min = min ^ max;
    }
    return Math.floor(this.random() * (max - min + 1)) + min;
  };

  /**
   * @returns Random boolean
   */
  public bool(): boolean {
    return this.range(2) === 0;
  }
}

export function toTitleCase(str: string): string {
  if (str === undefined) return 'Undefined';
  return str.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

// So there's no such thing as output parameters in JavaScript/TypeScript
// export function swap(x: any, y: any): void {
//   x = x ^ y;
//   y = x ^ y;
//   x = x ^ y;
// }

export function shuffle<T>(list: T[], randomFunc: Function = Math.random): T[] {
  let temp: any;
  for (let i = list.length - 1; i >= 0; i--) {
    let k = Math.floor(randomFunc()*(list.length-i));
    temp = list[k];
    list[k] = list[i];
    list[i] = temp;
  }
  return list;
}