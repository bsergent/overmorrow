import $ = require('jquery');
export class Controller {
  private inputQueue:JQuery.Event[] = [];
  private $canvas:JQuery;
  private listeners:Listener[] = [];

  constructor(canvas:JQuery) {
    this.$canvas = canvas;
    canvas.click(event => {
      this.queueInput(event);
    });
    $(document).keydown(event => {
      canvas.focus();
      this.queueInput(event);
      if ([9].indexOf(event.which) !== -1) { // Disabled tab key
        event.preventDefault();
        return false;
      }
    });
    canvas.mousemove(event => {
      this.queueInput(event);
    });
  }

  public queueInput(event:JQuery.Event):void {
    this.inputQueue.push(event);
  }

  public processInput():void {
    for (let e of this.inputQueue) {
      for (let l of this.listeners) {
        if (l.type === e.type && l.keys.indexOf(e.which) !== -1) {
          l.action(e);
        }
      }
    }
    this.inputQueue = [];
  }

  public addListener(type:'click'|'mousemove'|'keydown'):Listener {
    let l = new Listener(type);
    this.listeners.push(l);
    return l;
  }
}

export class Listener {
  private _type:'click'|'mousemove'|'keydown';
  private _keys:Keys[];
  private _action:Function;

  constructor(type:'click'|'mousemove'|'keydown') {
    this._type = type;
  }
  public setKeys(keys:Keys[]):Listener {
    this._keys = keys;
    return this;
  }
  public setAction(action:Function) { // Function will be passed JQuery.Event
    this._action = action;
    return this;
  }

  public get type():'click'|'mousemove'|'keydown' {
    return this._type;
  }
  public get keys():Keys[] {
    return this._keys;
  }
  public get action():Function {
    return this._action;
  }
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