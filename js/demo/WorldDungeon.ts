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
import { Graph, GraphType } from '../overmorrow/primitives/Graph';

export default class Dungeon extends WorldSandbox {
  private _rooms: Rectangle[];

  constructor(name: string, backgroundTileType: string, foregroundTileType: string, seed?: number) {
    super(name, 0, 0, backgroundTileType, foregroundTileType, seed);
    this._rooms = new Array<Rectangle>();
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

		this._tilesFG = new Array(height);
    for (let r = 0; r < height; r++) {
      this._tilesFG[r] = new Array(width);
      for (let c = 0; c < width; c++)
        this._tilesFG[r][c] = new Tile(this._defaultTileTypeFG, this._rand.random());
    }
        
		this._tilesBG = new Array(height);
    for (let r = 0; r < height; r++) {
      this._tilesBG[r] = new Array(width);
      for (let c = 0; c < width; c++)
        this._tilesBG[r][c] = new Tile(this._defaultTileTypeBG, this._rand.random());
    }

    // TODO Remove when finished debugging
    for (let r = 0; r < this._height; r++)
      for (let c = 0; c < this._width; c++)
        this._tilesFG[r][c].fog = DiscoveryLevel.VISIBLE;
    for (let r = 0; r < this._height; r++)
      for (let c = 0; c < this._width; c++)
        this._tilesBG[r][c].fog = DiscoveryLevel.VISIBLE;

    console.log(`World dimensions changed to x${width}, y${height}. All tile data lost. `);
  }

  public draw(ui: WorldRenderer): void {
    super.draw(ui);
    if (DEBUG) {
      for (let r = 0; r < this._rooms.length; r++) {
        let room = this._rooms[r];
        ui.drawRectWire(room, Color.RED);
      }
      for (let r = 0; r < this._rooms.length-1; r++) {
        let r1: Rectangle = this._rooms[r];
        let r2: Rectangle = this._rooms[r+1];
        let l1: Rectangle = new Rectangle(r1.center.x, r1.center.y, 0, 0);
        l1.x2 = r2.center.x;
        let l2: Rectangle = new Rectangle(l1.x2, l1.y1, 0, 0);
        l2.y2 = r2.center.y;
        //ui.drawLine(l1, new Color(100, 50, 150));
        //ui.drawLine(l2, new Color(100, 100, 255));
      }
      if (this._gen1DelTri !== null) {
        for (let edge of this._gen1DelTri.edges) {
          let r: Rectangle = new Rectangle(edge.a.x, edge.a.y, 0, 0);
          r.x2 = edge.b.x;
          r.y2 = edge.b.y;
          ui.drawLine(r, new Color(100, 50, 255));
        }
      }
    }
  }

  public tick(delta: number): number {
    let startTime = moment();
    if (this.name === 'SpreadMinTree')
      this._tick1(delta);
    else if (this.name === 'PerfectSparsen')
      this._tick2(delta);
		return moment().diff(startTime);
  }

  private _gen1State: Gen1State = Gen1State.RANDOM_ROOMS;
  private _gen1RoomCount: number = 15;
  private _gen1RoomWidthMin: number = 4;
  private _gen1RoomWidthMax: number = 8;
  private _gen1RoomSquareness: number = 2;
  private _gen1CurrentRoomIndex: number = 0;
  private _gen1RoomOffset: Vector = new Vector(0, 0);
  private _gen1DelTri: Graph = null;
  private _tick1(delta: number): void {
    let prevState: Gen1State = this._gen1State;
    switch (this._gen1State) {
      case Gen1State.RANDOM_ROOMS:
        // Create room of random sizes
        let w: number, h: number;
        w = this._rand.intBetween(this._gen1RoomWidthMin, this._gen1RoomWidthMax*1.3);
        if (w > this._gen1RoomWidthMax) w = Math.floor(w/4);
        if (w < this._gen1RoomWidthMin) w = this._gen1RoomWidthMin;
        h = w + this._rand.intBetween(-this._gen1RoomSquareness, this._gen1RoomSquareness);
        h = Math.min(h, this._gen1RoomWidthMax);
        h = Math.max(h, this._gen1RoomWidthMin);
        w++; // Add padding to be removed later
        h+=2;
        this._rooms.push(new Rectangle(-Math.floor(w/2), -Math.floor(h/2), w, h));
        this._gen1State = Gen1State.SPREAD_ROOMS;
        break;

      case Gen1State.SPREAD_ROOMS:
        let intersectingRoom: number = -1;
        
        // Check if room intersects others
        let room = this._rooms[this._gen1CurrentRoomIndex];
        for (let r2 = 0; r2 < this._rooms.length; r2++) {
          if (this._gen1CurrentRoomIndex === r2) continue;
          if (room.intersects(this._rooms[r2])) {
            intersectingRoom = r2;
            break;
          }
        }
        // Break and go to the next if it does not
        if (intersectingRoom === -1) {
          this._gen1RoomOffset = new Vector(0, 0);
          // Move to next state if just checked last room
          this._gen1CurrentRoomIndex++;
          if (this._gen1CurrentRoomIndex >= this._gen1RoomCount*2)
            this._gen1State = Gen1State.SPARSEN_ROOMS;
          else
            this._gen1State = Gen1State.RANDOM_ROOMS;
          break;
        }
        // Spread room (direction dependent on previous direction, then closest room, then random)
        if (this._gen1RoomOffset.magnitude === 0) {
          while (this._gen1RoomOffset.magnitude === 0) {
            this._gen1RoomOffset = new Vector(
              this._rand.intBetween(-1, 1),
              this._rand.intBetween(-1, 1)
            );
          }
        }
        // Randomize subdirection
        this._gen1RoomOffset.x *= this._rand.intBetween(0, 10);
        this._gen1RoomOffset.y *= this._rand.intBetween(0, 10);
        // Randomize cardinal directions
        if (this._rand.random() > 0.7) {
          this._gen1RoomOffset.x *= Math.sign(this._rand.random()-0.5);
          this._gen1RoomOffset.y *= Math.sign(this._rand.random()-0.5);
        }
        // Always spread outwards
        if (Math.sign(room.center.x) !== Math.sign(this._gen1RoomOffset.x)) this._gen1RoomOffset.x *= -1;
        if (Math.sign(room.center.y) !== Math.sign(this._gen1RoomOffset.y)) this._gen1RoomOffset.y *= -1;
        // Move room
        room.offset(Math.sign(this._gen1RoomOffset.x), Math.sign(this._gen1RoomOffset.y));
        break;

      case Gen1State.SPARSEN_ROOMS:
        if (this._rooms.length > this._gen1RoomCount)
          this._rooms.splice(this._rand.intBetween(0, this._rooms.length-1), 1);
        else
          this._gen1State = Gen1State.MOVE_ONSCREEN;
        break;

      case Gen1State.MOVE_ONSCREEN:
        // Define width and height at that point
        let mx1: number = 0, mx2: number = 0, my1: number = 0, my2: number = 0;
        for (let r = 0; r < this._rooms.length; r++) {
          mx1 = Math.min(mx1, this._rooms[r].x1);
          my1 = Math.min(my1, this._rooms[r].y1);
          mx2 = Math.max(mx2, this._rooms[r].x2+1);
          my2 = Math.max(my2, this._rooms[r].y2+1);
        }
        this.setDimensions(mx2-mx1, my2-my1);

        // Move positive
        let negative: boolean;
        while (true) {
          negative = false;
          for (let r = 0; r < this._rooms.length; r++) {
            if (this._rooms[r].x1 <= 0) {
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
            if (this._rooms[r].y1 <= 0) {
              negative = true;
              break;
            }
          }
          if (!negative) break;
          for (let r = 0; r < this._rooms.length; r++)
            this._rooms[r].offset(0, 1);
        };

        // Remove room padding
        for (let r = 0; r < this._rooms.length; r++) {
          let room = this._rooms[r];
          room.width--;
          room.height-=2;
        }

        // Carve rooms into tilemap
        for (let r = 0; r < this._rooms.length; r++)
          this.setTiles(this._rooms[r], 'air');
        this._gen1State = Gen1State.MIN_TREE;
        break;

      case Gen1State.MIN_TREE:
        for (let r = 0; r < this._rooms.length-1; r++) {
          let r1: Rectangle = this._rooms[r];
          let r2: Rectangle = this._rooms[r+1];
          // TODO Fix bottom-right corner not carving
          let horz: Rectangle = new Rectangle(Math.floor(r1.center.x), Math.floor(r1.center.y), 1, 1);
          horz.x2 = Math.floor(r2.center.x);
          let vert: Rectangle = new Rectangle(horz.x2, horz.y1, 1, 1);
          vert.y2 = Math.floor(r2.center.y);
          //console.log(horz, vert);
          this.setTiles(horz, 'air');
          this.setTiles(vert, 'air');
        }
        // TODO Carve passages in a maze-like manner based off the minimum spanning tree

        let g: Graph = new Graph(GraphType.UNDIRECTED);
        for (let r of this._rooms)
          g.addVertex(r.center);
        this._gen1DelTri = g.delaunay();

        this._gen1State = Gen1State.DECORATE;
        
        break;

      case Gen1State.DECORATE:
        let stone = TileType.getType('stone');
        let air = TileType.getType('air');
        for (let r = 1; r < this.height; r++)
          for (let c = 0; c < this.width; c++)
            if (this.getTile(c, r-1).type === stone
                && this.getTile(c, r).type === air)
              this.setTile(c, r-1, 'wall');
        for (let r = 0; r < this.height-1; r++)
          for (let c = 0; c < this.width; c++)
            if (this.getTile(c, r+1).type === stone
                && this.getTile(c, r).type === air)
              this.setTile(c, r+1, 'wall_bottom');
        this._gen1State = Gen1State.COMPLETE;
        break;
    }
    if (prevState !== this._gen1State)
      console.log(Gen1State[this._gen1State]);
  }

  private _gen2DirtFilled: number = 0;
  private _gen2DirtToFill: number = 800;
  private _gen2State: Gen2State = Gen2State.INITIAL;
  private _gen2Edges: Array<Rectangle>;
  private _gen2Visited: Matrix<boolean>;
  private _gen2Directions: Vector[];
  private _gen2Bounds: Rectangle;
  private _gen2Active: Vector[];
  private _gen2RoomCount: number;
  private _gen2RoomMaxWidth: number;
  private _gen2RoomMaxHeight: number;
  private _tick2(delta: number): void {
    switch (this._gen2State) {
      case Gen2State.INITIAL:
        this.setDimensions(51, 51);
        this._gen2RoomMaxWidth = this._rand.intBetween(7, 15);
        this._gen2RoomMaxHeight = this._rand.intBetween(7, 15);
        this._gen2RoomCount = this._rand.intBetween(10, 20);
        this._gen2State = Gen2State.PERFECT;
        this._gen2Edges = new Array<Rectangle>();
        this._gen2Visited = new Matrix<boolean>(Math.floor(this.width / 2), Math.floor(this.height / 2), false);
        this._gen2Directions = new Array<Vector>(
          new Vector(-1,  0),
          new Vector( 1,  0),
          new Vector( 0, -1),
          new Vector( 0,  1));
        this._gen2Bounds = new Rectangle(0, 0, this._gen2Visited.width, this._gen2Visited.height);
        this._gen2Active = new Array<Vector>();
        this._gen2Active.push(new Vector(this._rand.intBetween(0, this._gen2Visited.width-1), this._rand.intBetween(0, this._gen2Visited.height-1)));
        // Carve maze
        for (let r = 1; r < this.height; r += 2)
          for (let c = 1; c < this.width; c += 2)
            this.setTile(c, r, 'air');
        break;

      case Gen2State.PERFECT:
        // Generate perfect maze via Recursive Backtracking (without recursion)
        let current: Vector;
        if (this._gen2Active.length > 0) {
          current = this._gen2Active[this._gen2Active.length-1];
          this._gen2Directions = shuffle(this._gen2Directions, () => this._rand.random());
          
          let d: number;
          let next: Vector;
          for (d = 0; d < this._gen2Directions.length; d++) {
            next = current.add(this._gen2Directions[d]);
            // If direction is feasible, take it
            if (this._gen2Bounds.contains(next) && !this._gen2Visited.get(next.x, next.y)) {
              // Make connection
              let edge: Rectangle = new Rectangle(current.x, current.y, this._gen2Directions[d].x, this._gen2Directions[d].y);
              this._gen2Edges.push(edge);
              this.setTile((edge.x1) * 2 + edge.width + 1, (edge.y1) * 2 + edge.height + 1, 'air');
              this._gen2Active.push(next);
              break;
            }
          }
          this._gen2Visited.set(current.x, current.y, true); // Mark current location visited
          if (d >= this._gen2Directions.length) this._gen2Active.pop(); // Backtrack if all directions exhausted
        } else this._gen2State = Gen2State.SPARSEN;
        break;

      case Gen2State.SPARSEN:
        let toFill: Matrix<boolean> = new Matrix(this.width, this.height, false);
        // Find what to carve
        for (let r = 0; r < this.height; r++) {
          for (let c = 0; c < this.width; c++) {
            if (this.getTile(c, r).type == TileType.getType('air')
                && this.countSurroundingTiles(c, r, 'stone') >= 3) {
              toFill.set(c, r, true);
              this._gen2DirtFilled++;
            }
          }
        }
        // Carve
        for (let r = 0; r < this.height; r++)
          for (let c = 0; c < this.width; c++)
            if (toFill.get(c, r))
              this.setTile(c, r, 'stone');
        if (this._gen2DirtFilled >= this._gen2DirtToFill) this._gen2State = Gen2State.DOORS;
        break;
      
      case Gen2State.DOORS:
        for (let r = 0; r < this.height; r++) {
          for (let c = 0; c < this.width; c++) {
            if (this.getTile(c, r).type == TileType.getType('stone')
                && this.checkOppositeTiles(c, r, 'air')
                && this.countSurroundingTiles(c, r, 'air') === 2
                && this._rand.range(60) === 0) {
              let opened: boolean = this._rand.bool();
              console.log(`Door at ${c}x, ${r}y with state ${opened?'open':'closed'}.`);
              this.setTile(c, r, 'door');
              this.getTile(c, r).meta['open'] = opened;
            }
          }
        }
        this._gen2State = Gen2State.ROOMS;
        break;
      
      case Gen2State.ROOMS:
        // Generate room to place
        let room: Rectangle = new Rectangle(
          0,
          0,
          this._rand.intBetween(3, this._gen2RoomMaxWidth),
          this._rand.intBetween(3, this._gen2RoomMaxHeight));
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
          this.setTiles(room, 'air');
        }
        if (this._rooms.length >= this._gen2RoomCount) this._gen2State = Gen2State.CONNECT_ROOMS;
        break;

      case Gen2State.CONNECT_ROOMS:
        // Carve rooms and corridors into tilemap
        for (let r = 0; r < this._rooms.length-1; r++) {
          let r1: Rectangle = this._rooms[r];
          let r2: Rectangle = this._rooms[r+1];
          let l1: Rectangle = new Rectangle(Math.floor(r1.center.x), Math.floor(r1.center.y), 1, 1);
          l1.x2 = Math.floor(r2.center.x);
          let l2: Rectangle = new Rectangle(l1.x2, l1.y1, 1, 1);
          l2.y2 = Math.floor(r2.center.y);
          this.setTiles(l1, 'air');
          this.setTiles(l2, 'air');
        }
        this._gen2State = Gen2State.DECORATE;
        break;

      case Gen2State.DECORATE:
        let stone = TileType.getType('stone');
        let air = TileType.getType('air');
        for (let r = 1; r < this.height; r++)
          for (let c = 0; c < this.width; c++)
            if (this.getTile(c, r-1).type === stone
                && this.getTile(c, r).type === air)
              this.setTile(c, r-1, 'wall');
        break;
    }
  }
}

enum Gen1State {
  RANDOM_ROOMS,
  SPREAD_ROOMS,
  SPARSEN_ROOMS,
  MOVE_ONSCREEN,
  MIN_TREE,
  DECORATE,
  COMPLETE
}

enum Gen2State {
  INITIAL,
  PERFECT,
  SPARSEN,
  DOORS,
  ROOMS,
  CONNECT_ROOMS,
  DECORATE,
  COMPLETE
}