import Vector from "./Vector";
import Triangle from "./Triangle";
import Circle from "./Circle";

let EPSILON: number = 1.0 / 1048576.0;

export class Graph {
  private _vertexes: Vector[];
  private _edges: Edge[];
  private _type: GraphType;

  constructor(type: GraphType) {
    this._type = type;
  }

  public get vertexes(): Vector[] {
    return this._vertexes;
  }
  public get edges(): Edge[] {
    return this._edges;
  }
  public addVertex(vertex: Vector): void {
    if (this.hasVertex(vertex)) return;
    this._vertexes.push(vertex);
  }
  public hasVertex(vertex: Vector): boolean {
    let contains: boolean = false;
    for (let v of this._vertexes) {
      if (v.equals(vertex)) {
        contains = true;
        break;
      }
    }
    return contains;
  }
  public addEdge(vertexA: Vector, vertexB: Vector): void {
    if (!this.hasVertex(vertexA)) throw "Vertex A not found in Graph.";
    if (!this.hasVertex(vertexB)) throw "Vertex A not found in Graph.";
    this._edges.push({ a: vertexA, b: vertexB });
  }
  public hasEdge(vertexA: Vector, vertexB: Vector): boolean {
    // Edges will need to be matched based on type, e.g. a,b will match b,a only in an undirected graph
    throw "Not yet implemented.";
  }
  public clear(): void {
    this._edges = [];
    this._vertexes = [];
  }
  public clearEdges(): void {
    this._edges = [];
  }
  public removeVertex(indexOrVector: number | Vector): boolean {
    if (indexOrVector instanceof Vector) {
      for (let i = 0; i < this._vertexes.length; i++) {
        if (this._vertexes[i].equals(indexOrVector)) {
          indexOrVector = i;
          break;
        }
      }
    }
    if (indexOrVector instanceof Vector || indexOrVector < 0 || indexOrVector >= this._vertexes.length)
      return false;
    this._vertexes.splice(indexOrVector as number, 1);
    return true;
  }
  public removeEdge(indexOrVectorA: number | Vector, vectorB: Vector = null): boolean {
    if (indexOrVectorA instanceof Vector) {
      if (this.hasEdge(indexOrVectorA, vectorB)) return false;
      // TODO Get index of edge, matching based on graph type
    } else {
      if (indexOrVectorA < 0 || indexOrVectorA >= this._edges.length) return false;
    }
    // Edges will need to be matched based on type, e.g. a,b will match b,a only in an undirected graph
    throw "Not yet implemented.";
  }

  // Delauny Triangulation
  /**
   * @param vertices Triangles to be contained
   * @returns Triangle containing all other triangles
   */
  private del_superTriangle(vertices: Vector[]): Triangle {
    let xmin = Number.POSITIVE_INFINITY;
    let ymin = Number.POSITIVE_INFINITY;
    let xmax = Number.NEGATIVE_INFINITY;
    let ymax = Number.NEGATIVE_INFINITY;

    for (let i = vertices.length; i--; ) {
      if (vertices[i].x < xmin) xmin = vertices[i].x;
      if (vertices[i].y < ymin) ymin = vertices[i].y;
      if (vertices[i].x > xmax) xmax = vertices[i].x;
      if (vertices[i].y > ymax) ymax = vertices[i].y;
    }

    let dx: number = xmax - xmin;
    let dy: number = ymax - ymin;
    let dmax: number = Math.max(dx, dy);
    let xmid : number = xmin + dx * 0.5;
    let ymid : number = ymin + dy * 0.5;

    return new Triangle(
      new Vector(xmid - 20 * dmax, ymid -      dmax),
      new Vector(xmid            , ymid + 20 * dmax),
      new Vector(xmid + 20 * dmax, ymid -      dmax)
    );
  }
  private del_circumCircle(vertexA: Vector, vertexB: Vector, vertexC: Vector): Circle {
    let center: Vector = new Vector(0, 0);
    let m1: number, m2: number, mx1: number, mx2: number, my1: number, my2: number;
    let absy1y2: number = Math.abs(vertexA.y - vertexB.y);
    let absy2y3: number = Math.abs(vertexB.y - vertexC.y);

    if (absy1y2 < EPSILON && absy2y3 < EPSILON)
      throw "Circumcircle could not be calculated because points coincide.";

    if (absy1y2 < EPSILON) {
      m2  = -((vertexC.x - vertexB.x) / (vertexC.y - vertexB.y));
      mx2 = (vertexB.x + vertexC.x) / 2.0;
      my2 = (vertexB.y + vertexC.y) / 2.0;
      center.x  = (vertexB.x + vertexA.x) / 2.0;
      center.y  = m2 * (center.x - mx2) + my2;
    } else if (absy2y3 < EPSILON) {
      m1  = -((vertexB.x - vertexA.x) / (vertexB.y - vertexA.y));
      mx1 = (vertexA.x + vertexB.x) / 2.0;
      my1 = (vertexA.y + vertexB.y) / 2.0;
      center.x  = (vertexC.x + vertexB.x) / 2.0;
      center.y  = m1 * (center.x - mx1) + my1;
    } else {
      m1  = -((vertexB.x - vertexA.x) / (vertexB.y - vertexA.y));
      m2  = -((vertexC.x - vertexB.x) / (vertexC.y - vertexB.y));
      mx1 = (vertexA.x + vertexB.x) / 2.0;
      mx2 = (vertexB.x + vertexC.x) / 2.0;
      my1 = (vertexA.y + vertexB.y) / 2.0;
      my2 = (vertexB.y + vertexC.y) / 2.0;
      center.x  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
      center.y  = (absy1y2 > absy2y3) ?
        m1 * (center.x - mx1) + my1 :
        m2 * (center.x - mx2) + my2;
    }

    let dx: number = vertexB.x - center.x;
    let dy: number = vertexB.y - center.y;
    return new Circle(center.x, center.y, dx * dx + dy * dy);
  }
  private del_removeDuplicateEdges(edges: Edge[]): void {
    throw "Not yet implemented.";
  }
  /**
   * The triangulation for a given set P such that no point is inside the circumcircle of any triangle in P,
   * maximizing the minimum angle of all the angles of the triangles in the triangulation,
   * tending to avoid sliver triangles.
   * See https://en.wikipedia.org/wiki/Delaunay_triangulation
   * Implemented based off https://github.com/ironwallaby/delaunay/blob/master/delaunay.js
   * @returns Graph containing edges based upon the resulting triangulation
   */
  public delaunay(): Graph {
    if (this._vertexes.length < 3) throw "Graph requires at least three vertexes to calculate Delaunay triangulation.";
    let result: Graph = this.clone();
    result.clearEdges();

    let indices: number[] = new Array<number>(this.vertexes.length);
    for (let i = this.vertexes.length; i--; )
      indices[i] = i;
    indices.sort((i: number, j: number) => {
      let diff = this.vertexes[j].x - this.vertexes[i].x;
      return diff !== 0 ? diff : i - j;
    });

    let st = this.del_superTriangle(result.vertexes);
    for (let p of st.points)
      result.addVertex(p);

    let open: Circle[] = [ this.del_circumCircle(st.a, st.b, st.c) ];
    let closed: Circle[];
    let edges: Edge[];

    // TODO Finish implementation

    return result;
  }

  public clone(): Graph {
    let g = new Graph(this._type);
    for (let v of this._vertexes)
      g.addVertex(v);
    for (let e of this._edges)
      g.addEdge(e.a, e.b);
    return g;
  }
}

export enum GraphType {
  DIRECTED,
  UNDIRECTED,
  WEIGHTED
}
export interface Edge {
  a: Vector;
  b: Vector;
  w?: number; // Weight
}