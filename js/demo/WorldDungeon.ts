import * as moment from '../../node_modules/moment/moment';
import WorldSandbox from 'overmorrow/classes/WorldSandbox';
import Tile, { TileType, DiscoveryLevel } from 'overmorrow/classes/Tile'
import Rectangle from 'overmorrow/primitives/Rectangle';
import { Perlin, SeededRandom, Facing, shuffle } from 'overmorrow/Utilities';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Renderer from 'overmorrow/Renderer';
import Vector from 'overmorrow/primitives/Vector';
import Color from 'overmorrow/primitives/Color';
import Matrix from '../overmorrow/primitives/Matrix';

export default class Dungeon extends WorldSandbox {
  private _rooms: Rectangle[];
  private _rand: SeededRandom;

  constructor(defaultTileType: string, seed?: number) {
    super(0, 0, defaultTileType, seed);
    this._rooms = new Array<Rectangle>();
    this._rand = new SeededRandom(this.seed.toString());
    this.generate2();
    for (let r = 0; r < this._height; r++)
      for (let c = 0; c < this._width; c++)
        this._tiles[r][c].fog = DiscoveryLevel.VISIBLE;
  }

  private generate1(): void {
    let rand = new SeededRandom(this.seed.toString());
    
    // Generation settings
    let roomCount = 5;
    let minWidth = 3;
    let maxWidth = 7;
    let squareness = 2; // Set to 0 for perfect squares

    // Create rooms of random sizes
    let w: number, h: number;
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
      console.log(l1, l2);
      this.setTiles(l1, 'dirt');
      this.setTiles(l2, 'dirt');
    }

    // Construct rooms
    // Connect rooms (probably use the union-find stuff from CS302, like generating a maze, but with rooms)
    // Decide path (probably minimum spanning tree)
    // Decorate rooms (placing doors and keys so that backtracking is necessary)
  }

  private generate2(): void {
    let width = 51; let height = 51;
    this.setDimensions(width, height);

    // Generate perfect maze via Recursive Backtracking (without recursion)
    let directions: Vector[] = new Array<Vector>(
      new Vector(-1,  0),
      new Vector( 1,  0),
      new Vector( 0, -1),
      new Vector( 0,  1));
    let edges = Array<Rectangle>();

    let visited: Matrix<boolean> = new Matrix<boolean>(Math.floor(width / 2), Math.floor(height / 2), false);
    let bounds = new Rectangle(0, 0, visited.width, visited.height);
    let active: Vector[] = new Array<Vector>();
    active.push(new Vector(this._rand.intBetween(0, visited.width-1), this._rand.intBetween(0, visited.height-1)));
    console.log(`Starting at ${active[0].x}x, ${active[0].y}y.`);
    let current: Vector;
    while (active.length > 0) {
      current = active[active.length-1];
      directions = shuffle(directions, () => this._rand.random());
      
      let d: number;
      let next: Vector;
      for (d = 0; d < directions.length; d++) {
        next = current.add(directions[d]);
        // If direction is feasible, take it
        if (bounds.contains(next) && !visited.get(next.x, next.y)) {
          // Make connection
          edges.push(new Rectangle(current.x, current.y, directions[d].x, directions[d].y));
          active.push(next);
          break;
        }
      }

      visited.set(current.x, current.y, true); // Mark current location visited
      if (d >= directions.length) active.pop(); // Backtrack if all directions exhausted
    }
    // Carve maze
    for (let r = 1; r < height; r += 2)
      for (let c = 1; c < width; c += 2)
        this.setTile(c, r, 'dirt');
    for (let e = 0; e < edges.length; e++) {
      this.setTile((edges[e].x1) * 2 + edges[e].width + 1, (edges[e].y1) * 2 + edges[e].height + 1, 'dirt');
    }

    // Sparsen by removing dead ends by iteratively looking for sections with three adjacent walls
    // let dirtToFill: number = 2300;
    // let dirtFilled: number = 0;
    // outer:
    // while (true) {
    //   for (let r = 0; r < height; r++) {
    //     for (let c = 0; c < width; c++) {
    //       if (this.countSurroundingWalls(c, r, 'wall') >= 3) {
    //         this.setTile(c, r, 'wall');
    //         dirtFilled++;
    //         console.log(`Filled dirt at ${c}x, ${r}y. (total ${dirtFilled})`);
    //       }
    //       if (dirtFilled >= dirtToFill)
    //         break outer;
    //     }
    //   }
    // }

    // Connect some dead ends
    // Place rooms
    // Connect rooms
  }

  /**
   * This method resizes the world. All tile data will be lost. 
   */
  private setDimensions(width: number, height: number): void {
    this._width = width;
    this._height = height;
    this._bounds.width = width;
    this._bounds.height = height;
    
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
      let l1: Rectangle = new Rectangle(r1.center.x, r1.center.y, 0, 0);
      l1.x2 = r2.center.x;
      let l2: Rectangle = new Rectangle(l1.x2, l1.y1, 0, 0);
      l2.y2 = r2.center.y;
      ui.drawLine(l1, new Color(100, 50, 150));
      ui.drawLine(l2, new Color(100, 100, 255));
    }
  }

  private _dirtFilled: number = 0;
  private _dirtToFill: number = 800;
  private _genState: GenState = GenState.PERFECT;
  private _aniTimer: number = 0;
  public tick(delta: number): number {
    let startTime = moment();
    //if (this._aniTimer++ < 3) return 0;
    //this._aniTimer = 0;

    let toFill: Matrix<boolean> = new Matrix(this.width, this.height, false);
    switch (this._genState) {
      case GenState.PERFECT:
        // Find what to carve
        for (let r = 0; r < this.height; r++) {
          for (let c = 0; c < this.width; c++) {
            if (this.getTile(c, r).type == TileType.getType('dirt')
                && this.countSurroundingTiles(c, r, 'wall') >= 3) {
              toFill.set(c, r, true);
              this._dirtFilled++;
            }
          }
        }
        // Carve
        for (let r = 0; r < this.height; r++)
          for (let c = 0; c < this.width; c++)
            if (toFill.get(c, r))
              this.setTile(c, r, 'wall');
        if (this._dirtFilled >= this._dirtToFill) this._genState = GenState.DOORS;
        break;
      
      case GenState.DOORS:
        for (let r = 0; r < this.height; r++) {
          for (let c = 0; c < this.width; c++) {
            if (this.getTile(c, r).type == TileType.getType('wall')
                && this.checkOppositeTiles(c, r, 'dirt')
                && this.countSurroundingTiles(c, r, 'dirt') === 2
                && this._rand.range(60) === 0) {
              console.log(`Opened ${c}x, ${r}y.`);
              this.setTile(c, r, 'dirt');
            }
          }
        }
        this._genState = GenState.ROOMS;
        break;
      
      case GenState.ROOMS:
        // Generate room to place
        let maxRoomWidth: number = 15;
        let maxRoomHeight: number = 15;
        let room: Rectangle = new Rectangle(
          0,
          0,
          this._rand.intBetween(3, maxRoomWidth),
          this._rand.intBetween(3, maxRoomHeight));
        // Add padding around room
        room.width += 2;
        room.height += 2;
        // Generate all possible locations to try in a random order
        let locations: Array<Vector> = new Array<Vector>();
        for (let r = 0; r < this.height - room.height; r++)
          for (let c = 0; c < this.width - room.width; c++)
            locations.push(new Vector(c, r));
        locations = shuffle(locations);
        // Attempt to place room at every location until a suitable one is found
        let placed: boolean = false;
        let dirtWithin: boolean;
        outer:
        for (let l = 0; l < locations.length; l++) {
          room.x1 = locations[l].x;
          room.y1 = locations[l].y;
          let typeCounts: Map<TileType, number> = this.countTileTypesInArea(room);
          let typeIt = typeCounts.keys();
          let type: IteratorResult<TileType>;
          // Check if colliding with tunnels
          dirtWithin = false;
          while (true) {
            type = typeIt.next();
            if (type.done) break;
            if (!type.value.solid) {
              dirtWithin = true;
              continue outer;
            }
          }
          // Place if no collision
          if (!dirtWithin) {
            placed = true;
            break outer;
          }
        }
        if (placed) {
          room.x1++;
          room.y1++;
          room.width -= 2;
          room.height -= 2;
          this._rooms.push(room);
          this.setTiles(room, 'dirt');
        }
        if (this._rooms.length >= 10) this._genState = GenState.CONNECT_ROOMS;
        break;

      case GenState.CONNECT_ROOMS:
      // Carve rooms and corridors into tilemap
      for (let r = 0; r < this._rooms.length-1; r++) {
        let r1: Rectangle = this._rooms[r];
        let r2: Rectangle = this._rooms[r+1];
        let l1: Rectangle = new Rectangle(Math.floor(r1.center.x), Math.floor(r1.center.y), 1, 1);
        l1.x2 = Math.floor(r2.center.x);
        let l2: Rectangle = new Rectangle(l1.x2, l1.y1, 1, 1);
        l2.y2 = Math.floor(r2.center.y);
        this.setTiles(l1, 'dirt');
        this.setTiles(l2, 'dirt');
      }
        this._genState = GenState.COMPLETE;
        break;
    }
		return moment().diff(startTime);
  }
}

enum GenState {
  PERFECT,
  DOORS,
  ROOMS,
  CONNECT_ROOMS,
  COMPLETE
}