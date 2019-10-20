import Rectangle from "./Rectangle";

export default class Matrix<T> {
  private _width: number
  private _height: number;
  private _data: T[][];
  private _defaultValue: T;

  constructor(width: number, height: number, defaultValue?: T) {
    this._width = width;
    this._height = height;
    this._defaultValue = defaultValue;
    this._data = new Array<Array<T>>(this._height);
    for (let y = 0; y < this._height; y++) {
      this._data[y] = new Array<T>(this._width);
      for (let x = 0; x < this._width; x++)
        this._data[y][x] = defaultValue;
    }
  }

  public get width(): number {
    return this._width;
  }
  public get height(): number {
    return this._height;
  }

  public get(x: number, y: number): T {
    if (x < 0 || y < 0 || x >= this._width || y >= this._height)
      throw `Position ${x}x, ${y}y not within bounds of matrix.`;
    return this._data[y][x];
  }
  public set(x: number, y: number, value: T): void {
    if (x < 0 || y < 0 || x >= this._width || y >= this._height)
      throw `Position ${x}x, ${y}y not within bounds of matrix.`;
    this._data[y][x] = value;
  }

  public setArea(area: Rectangle, value: T): void {
    if (area.x1 < 0 || area.y1 < 0 || area.x2 >= this._width || area.y2 >= this._height)
      throw "Area not within bounds of matrix.";
    for (let y = area.y1; y < area.y2; y++)
      for (let x = area.x1; x < area.x2; x++)
          this._data[y][x] = value;
  }
  public clear(): void {
    this.setArea(new Rectangle(0, 0, this._width, this._height), this._defaultValue);
  }
}