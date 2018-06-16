import * as moment from '../../node_modules/moment/moment';
import WorldSandbox from 'overmorrow/classes/WorldSandbox';
import Tile, { TileType, DiscoveryLevel } from 'overmorrow/classes/Tile'
import Rectangle from 'overmorrow/primitives/Rectangle';
import { Perlin, SeededRandom } from 'overmorrow/Utilities';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Renderer from 'overmorrow/Renderer';
import Vector from 'overmorrow/primitives/Vector';
import Color from 'overmorrow/primitives/Color';

export default class Dungeon extends WorldSandbox {
  private _rooms: Rectangle[];

  constructor(defaultTileType: string, seed: number = -1) {
    super(0, 0, defaultTileType, seed);
    this.generate(); // TODO Don't generate if constructing from a WorldDungeon packet
  }

  private generate(): void {
    let rand = new SeededRandom(this.seed.toString());
    // for (let x = 0; x < 10; x++)
    //   console.log(rand.random());
    // console.log('-----');
    // let per = new Perlin(() => rand.random());
    // for (let x = 0; x < 1.0; x += 0.1)
    //   console.log(per.get1d(x));
    
    // Generation settings
    let roomCount = 5;
    let minWidth = 3;
    let maxWidth = 7;
    let squareness = 2; // Set to 0 for perfect squares

    // Create rooms of random sizes
    let w: number, h: number;
    this._rooms = new Array<Rectangle>();
    for (let r = 0; r < roomCount; r++) {
      w = rand.intBetween(minWidth, maxWidth);
      h = w + rand.intBetween(-squareness, squareness);
      this._rooms.push(new Rectangle(-Math.floor(w/2), -Math.floor(h/2), w, h));
    }

    // New spread rooms
    let intersecting: Rectangle = null;
    let intersectingId: number = -1;
    for (let r1 = 0; r1 < this._rooms.length; r1++) {
      let room = this._rooms[r1];
      // Check intersection
      let tries = 0;
      while (true) {
        intersecting = null;
        intersectingId = -1;
        for (let r2 = 0; r2 < this._rooms.length; r2++) {
          if (r1 === r2) continue;
          if (room.intersects(this._rooms[r2])) {
            intersecting = this._rooms[r2];
            intersectingId = r2;
            break;
          }
        }
        if (intersecting === null) break;
        console.log(`Rect#${r1} intersects Rect#${intersectingId} at x${room.x1}, y${room.y1}.`);
        // Spread
        let offX = Math.sign(room.center.x - intersecting.center.x);
        let offY = Math.sign(room.center.y - intersecting.center.y);
        if (offX === 0 && offY === 0) {
          offX = rand.intBetween(-1, 1);
          offY = rand.intBetween(-1, 1);
        }
        room.offset(offX, offY);
        if (tries++ > 100) break;
      }
    }
    console.log(this._rooms);
    // TODO Probably will need to shrink rooms afterwards since some will be touching and we need at least one tile between

    // Define width and height at that point
    let mx1: number = 0, mx2: number = 0, my1: number = 0, my2: number = 0;
    for (let r = 0; r < this._rooms.length; r++) {
      mx1 = Math.min(mx1, this._rooms[r].x1);
      my1 = Math.min(my1, this._rooms[r].y1);
      mx2 = Math.max(mx2, this._rooms[r].x2+1);
      my2 = Math.max(my2, this._rooms[r].y2+1);
    }
    this.setDimensions(mx2-mx1, my2-my1);

    // Move all rooms to positive locations
    let negative: boolean;
    while (true) {
      negative = false;
      for (let r = 0; r < this._rooms.length; r++) {
        if (this._rooms[r].x1 < 0) {
          negative = true;
          break;
        }
      }
      if (!negative) break;
      for (let r = 0; r < this._rooms.length; r++)
        this._rooms[r].offset(1, 0);
    };
    while (true) {
      negative = false;
      for (let r = 0; r < this._rooms.length; r++) {
        if (this._rooms[r].y1 < 0) {
          negative = true;
          break;
        }
      }
      if (!negative) break;
      for (let r = 0; r < this._rooms.length; r++)
        this._rooms[r].offset(0, 1);
    };
    console.log(this._rooms);

    // Connect rooms via cooridors

    // Carve rooms and corridors into tilemap
    for (let r = 0; r < this._rooms.length; r++)
      this.setTiles(this._rooms[r], 'dirt');
    for (let r = 0; r < this._rooms.length-1; r++) {
      let r1: Rectangle = this._rooms[r];
      let r2: Rectangle = this._rooms[r+1];
      // TODO There are still lots of problems with this
      let l1: Rectangle = new Rectangle(Math.floor(r1.center.x), Math.floor(r1.center.y), 1, 1);
      l1.x2 = Math.floor(r2.center.x);
      let l2: Rectangle = new Rectangle(l1.x2, l1.y1, 1, 1);
      l2.y2 = Math.floor(r2.center.y);
      this.setTiles(l1, 'dirt');
      this.setTiles(l2, 'dirt');
    }

    // Construct rooms
    // Connect rooms (probably use the union-find stuff from CS302, like generating a maze, but with rooms)
    // Decide path (probably minimum spanning tree)
    // Decorate rooms (placing doors and keys so that backtracking is necessary)
  }

  /**
   * This method resizes the world. All tile data will be lost. 
   */
  private setDimensions(width: number, height: number): void {
    this._width = width;
    this._height = height;
    
		this._entityCollision = new Array(height);
    for (let r = 0; r < height; r++)
      this._entityCollision[r] = new Array(width);

		this._tiles = new Array(height);
    for (let r = 0; r < height; r++) {
      this._tiles[r] = new Array(width);
      for (let c = 0; c < width; c++)
        this._tiles[r][c] = new Tile(this._defaultTileType);
    }

    console.log(`World dimensions changed to x${width}, y${height}. All tile data lost. `);
  }

  public draw(ui: WorldRenderer): void {
    super.draw(ui);
    //let rend: Renderer = ui.rendererAbsolute;
    ui.drawRect(new Rectangle(Math.floor(this.width/2)+0.4, Math.floor(this.height/2)+0.4, 0.2, 0.2), Color.green);
    for (let r = 0; r < this._rooms.length; r++) {
      let room = this._rooms[r];
      ui.drawRectWire(room, Color.red);
    }
    for (let r = 0; r < this._rooms.length-1; r++) {
      let r1: Rectangle = this._rooms[r];
      let r2: Rectangle = this._rooms[r+1];
      let line: Rectangle = new Rectangle(r1.center.x, r1.center.y, 0, 0);
      line.x2 = r2.center.x;
      line.y2 = r2.center.y;
      ui.drawLine(line, Color.blue);
    }
  }
}