import $ = require('jquery');
export class Controller {
  private inputQueue: InputEvent[] = [];
  private $canvas: JQuery;
  private listeners: Listener[] = [];
  private mousePosX: number = 0;
  private mousePosY: number = 0;
  private pressedKeys: Keys[] = [];

  constructor(canvas: JQuery) {
    this.$canvas = canvas;
    canvas.click(event => {
      this.queueInput(InputEvent.new(event));
    });
    canvas.mousedown(event => {
      let mouseEvent = InputEvent.new(event);
      mouseEvent.x = event.clientX - canvas[0].getBoundingClientRect().left;
      mouseEvent.y = event.clientY - canvas[0].getBoundingClientRect().top;
      if (this.pressedKeys.indexOf(event.which as Keys) === -1)
        this.pressedKeys.push(event.which as Keys);
      this.queueInput(mouseEvent);
      return false;
    });
    canvas.mouseup(event => {
      let mouseEvent = InputEvent.new(event);
      mouseEvent.x = event.clientX - canvas[0].getBoundingClientRect().left;
      mouseEvent.y = event.clientY - canvas[0].getBoundingClientRect().top;
      let i = this.pressedKeys.indexOf(event.which as Keys)
      if (i !== -1)
        this.pressedKeys.splice(i, 1);
      this.queueInput(mouseEvent);
    });
    $(document).keydown(event => {
      canvas.focus();
      if (this.pressedKeys.indexOf(event.which as Keys) === -1)
        this.pressedKeys.push(event.which as Keys);
      this.queueInput(InputEvent.new(event));
      if ([9].indexOf(event.which) !== -1) { // Disabled tab key
        event.preventDefault();
        return false;
      }
    });
    $(document).keyup(event => {
      canvas.focus();
      let i = this.pressedKeys.indexOf(event.which as Keys)
      if (i !== -1)
        this.pressedKeys.splice(i, 1);
      this.queueInput(InputEvent.new(event));
      if ([9].indexOf(event.which) !== -1) { // Disabled tab key
        event.preventDefault();
        return false;
      }
    });
    canvas.mousemove(event => {
      let mouseEvent = InputEvent.new(event);
      mouseEvent.x = event.clientX - canvas[0].getBoundingClientRect().left;
      mouseEvent.y = event.clientY - canvas[0].getBoundingClientRect().top;
      mouseEvent.dx = this.mousePosX - event.clientX;
      mouseEvent.dy = this.mousePosY - event.clientY;
      this.mousePosX = event.clientX;
      this.mousePosY = event.clientY;
      this.queueInput(mouseEvent);
    });
    canvas.on('mousewheel', event => {
      let mouseEvent = InputEvent.new(event, EventTypes.SCROLL);
      mouseEvent.x = event.clientX - canvas[0].getBoundingClientRect().left;
      mouseEvent.y = event.clientY - canvas[0].getBoundingClientRect().top;
      mouseEvent.dx = (event.originalEvent as any).wheelDeltaX;
      mouseEvent.dy = (event.originalEvent as any).wheelDeltaY;
      event.preventDefault();
      this.queueInput(mouseEvent);
    })
  }

  public queueInput(event: InputEvent): void {
    this.inputQueue.push(event);
  }

  public processInput(): void {
    for (let e of this.inputQueue) {
      for (let l of this.listeners) {
        if (l.type === EventTypes.ALL || (l.type === e.type && (l.keys === undefined || l.keys.indexOf(e.key) !== -1))) {
          l.action(e);
        }
      }
      e.dispose();
    }
    this.inputQueue = [];
    for (let k of this.pressedKeys) {
      for (let l of this.listeners) {
        if (l.type === EventTypes.ALL || (l.type === EventTypes.KEYHELD && l.keys.indexOf(k) !== -1)) {
          let keyheldEvent = InputEvent.new(null);
          keyheldEvent.type = EventTypes.KEYHELD;
          keyheldEvent.key = k;
          l.action(keyheldEvent);
          keyheldEvent.dispose();
        }
      }
    }
  }

  public addListener(type: EventTypes): Listener {
    let l = new Listener(type);
    this.listeners.push(l);
    return l;
  }

  public isKeyDown(key: Keys): boolean {
    return this.pressedKeys.indexOf(key) !== -1;
  }
}

export class Listener {
  private _type: EventTypes;
  private _keys: Keys[];
  private _action: Function;
  private _duration: number;

  constructor(type: EventTypes) {
    this._type = type;
  }
  public setKeys(keys: Keys[]): Listener {
    this._keys = keys;
    return this;
  }
  public setAction(action: Function): Listener { // Function will be passed InputEvent
    this._action = action;
    return this;
  }
  public setDuration(seconds: number): Listener { // TODO Implement keyheld not going through until held for duration
    this._duration = seconds;
    return this;
  }

  public get type(): EventTypes {
    return this._type;
  }
  public get keys(): Keys[] {
    return this._keys;
  }
  public get action(): Function {
    return this._action;
  }
}

export class InputEvent {
  key: Keys;
  type: EventTypes;
  x: number;
  y: number;
  dx: number;
  dy: number;

  private static _heap: InputEvent[] = [];
  public static new(event: JQuery.Event, type: EventTypes = null): InputEvent {
    if (this._heap.length <= 0) return new InputEvent(event, type);
    let e = this._heap.pop();
    if (event === null) return e;
    e.key = event.which;
    e.type = type === null ? EventTypes[event.type.toUpperCase()] : type;
    return e;
  }
  constructor(event: JQuery.Event, type: EventTypes = null) {
    if (event === null) return;
    this.key = event.which;
    this.type = type === null ? EventTypes[event.type.toUpperCase()] : type;
  }
  public dispose(): void {
    InputEvent._heap.push(this);
  }

  get d(): number { return this.dx + this.dy; }
}

export enum Keys {
  MOUSE_LEFT = 1,
  MOUSE_MIDDLE = 2,
  MOUSE_RIGHT = 3,
  KEY_A = 65,
  KEY_B = 66,
  KEY_C = 67,
  KEY_D = 68,
  KEY_E = 69,
  KEY_F = 70,
  KEY_G = 71,
  KEY_H = 72,
  KEY_I = 73,
  KEY_J = 74,
  KEY_K = 75,
  KEY_L = 76,
  KEY_M = 77,
  KEY_N = 78,
  KEY_O = 79,
  KEY_P = 80,
  KEY_Q = 81,
  KEY_R = 82,
  KEY_S = 83,
  KEY_T = 84,
  KEY_U = 85,
  KEY_V = 86,
  KEY_W = 87,
  KEY_X = 88,
  KEY_Y = 89,
  KEY_Z = 90,
  KEY_0 = 48,
  KEY_1 = 49,
  KEY_2 = 50,
  KEY_3 = 51,
  KEY_4 = 52,
  KEY_5 = 53,
  KEY_6 = 54,
  KEY_7 = 55,
  KEY_8 = 56,
  KEY_9 = 57,
  KEY_UP = 38,
  KEY_DOWN = 40,
  KEY_LEFT = 37,
  KEY_RIGHT = 39,
  KEY_SPACE = 32,
  KEY_TAB = 9,
  KEY_ENTER = 13,
  KEY_SHIFT = 16,
  KEY_EQUALS = 187,
  KEY_MINUS = 189,
  KEY_ESCAPE = 27,
  KEY_BACKSPACE = 8,
  KEY_CAPSLOCK = 20,
  KEY_CONTROL = 17,
  KEY_ALT = 18,
  KEY_TILDE = 192,
  KEY_PERIOD = 190,
  KEY_FORWARD_SLASH = 191,
  KEY_COMMA = 188,
  KEY_APOSTROPHE = 222,
  KEY_SEMICOLON = 186,
  KEY_SQUARE_BRACKET_LEFT = 219,
  KEY_SQUARE_BRACKET_RIGHT = 221,
  KEY_BACKSLASH = 220,
}

export enum EventTypes {
  CLICK,
  MOUSEMOVE,
  MOUSEDOWN,
  MOUSEUP,
  SCROLL,
  KEYDOWN,
  KEYUP,
  KEYHELD,
  ALL
}