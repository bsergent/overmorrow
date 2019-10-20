import Vector from "./Vector";
import Triangle from "./Triangle";
import Circle from "./Circle";
import Line from "./Line";

let EPSILON: number = 1.0 / 1048576.0;

export class Graph {
  private _vertexes: Vector[] = [];
  private _edges: Edge[] = [];
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
    if (this.hasEdge(vertexA, vertexB)) return;
    this._edges.push(new Edge(vertexA, vertexB));
  }
  public hasEdge(vertexA: Vector, vertexB: Vector): boolean {
    // Edges will need to be matched based on type, e.g. a,b will match b,a only in an undirected graph
    for (let edge of this._edges) {
      if (edge.a.equals(vertexA) && edge.b.equals(vertexB)) return true;
      if (this._type === GraphType.UNDIRECTED && edge.a.equals(vertexB) && edge.b.equals(vertexA)) return true;
    }
    return false;
  }
  public clear(): void {
    this._edges = [];
    this._vertexes = [];
  }
  public clearEdges(): void {
    this._edges = [];
  }
  public removeVertex(vertex: Vector): boolean {
    let index: number = -1;
    for (let i = 0; i < this._vertexes.length; i++) {
      if (this._vertexes[i].equals(vertex)) {
        index = i;
        break;
      }
    }
    if (index == -1) return false;
    for (let e = 0; e < this._edges.length; e++) {
      if (this._edges[e].a.equals(vertex) || this._edges[e].b.equals(vertex)) {
        this._edges.splice(e, 1);
        e--;
      }
    }
    this._vertexes.splice(index as number, 1);
    return true;
  }
  public removeEdge(vertexA: Vector, vertexB: Vector = null): boolean {
    for (let e = 0; e < this._edges.length; e++) {
      let edge: Edge = this._edges[e];
      if ((edge.a.equals(vertexA as Vector) && edge.b.equals(vertexB))
          || (this._type === GraphType.UNDIRECTED && edge.a.equals(vertexB) && edge.b.equals(vertexA as Vector))) {
        this._edges.splice(e, 1);
        return true;
      }
    }
    return false;
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

    // if (absy1y2 < EPSILON && absy2y3 < EPSILON)
    //   throw "Circumcircle could not be calculated because points coincide.";

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
    return new Circle(center.x, center.y, Math.sqrt(dx * dx + dy * dy));
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

    // Sort the vertex array by x value
    result.vertexes.sort((i: Vector, j: Vector) => {
      return j.x - i.x;
    });

    // Surround everything in a bigger triangle
    let st = this.del_superTriangle(result.vertexes);
    for (let p of st.points)
      result.addVertex(p);

    // Triangulation result as a bunch of triangles to be mapped to the result graph
    let resultTri: Triangle[] = [ st ];

    for (let v of result.vertexes) {
      let badTriangles: Triangle[] = [];
      let badIndexes: number[] = [];

      // Find triangles invalidated by vertex insertion
      for (let t = 0; t < resultTri.length; t++) {
        let tri = resultTri[t];
        if (this.del_circumCircle(tri.a, tri.b, tri.c).contains(v)) {
          badTriangles.push(tri);
          badIndexes.push(t);
        }
      }

      // Find the boundary of the polygonal hole
      let polygon: Line[] = [];
      for (let t of badTriangles) {
        for (let e of t.edges) {
          let shared: boolean = false;
          sharedCheck:
          for (let t2 of badTriangles) {
            if (t.equals(t2)) continue;
            for (let e2 of t2.edges) {
              if (e.equals(e2)) {
                shared = true;
                break sharedCheck;
              }
            }
          }
          if (!shared)
            polygon.push(e);
        }
      }

      // Remove from triangulation
      let offset: number = 0;
      badIndexes.sort();
      for (let t of badIndexes) {
        resultTri.splice(t + offset, 1);
        offset--;
      }

      // Add a new triangle for each edge
      for (let e of polygon)
        resultTri.push(new Triangle(v, e.a, e.b));
    }

    // Map triangles to result graph
    for (let t of resultTri)
      for (let e of t.edges)
        result.addEdge(e.a, e.b);

    // Remove any triangles sharing a vertex with the supertriangle
    result.removeVertex(st.a);
    result.removeVertex(st.b);
    result.removeVertex(st.c);

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

export class Edge extends Line {
  public weight: number;
  
  constructor(a: Vector, b: Vector, weight: number = 0) {
    super(a, b);
    this.weight = weight;
  }

  public equals(e: Edge, directed: boolean = false): boolean {
    return super.equals(e) && this.weight === e.weight;
  }
}