import util = require('util');
import ui = require('ui');
import Tickable from 'Tickable';
import Drawable from 'Drawable';
declare var DEBUG:boolean;

export class Ship implements Tickable, Drawable {
  // Constants
  private static WAKE_LIMIT:number = 14;

  // Ship attributes
  private _type:string;
  private _maxVelocity:number = 0.205776; // 8 knots should be 0.0205776 tiles/s if 1 tile = 10m, but too slow, so doing 1tile=100m
  private _hulk:number = 1;
  private _maxAcceleration:number = 0.1;
  private _maxHealth = 100;
  private _dimensions:util.Box = {
    width: 2, //0.083*30; // Length of full image, not just the ship itself
    height: 2 //0.042*30; // Ships are draw at 30x scale
  }
  
  // Properties
  private _skin;
  private _name:string;
  private _rudder:number = 0;
  private _rudderCooldown:number = 0;
  private _anchor:boolean = false;
  private _anchorCooldown:number = 0;
  private _sails:number = 0;
  private _velocity:number = 0;
  private _position:util.Vector = {
    x: 0,
    y: 0,
    d: 0
  }
  private _health = 100;
  private _ai = false;
  private _wake:util.Vector[] = []; // Array of last 10 locations to draw wakes at
  private _wakeCooldown:number = 0;

  constructor(type:string = 'caravel', name:string) {
    this._name = name;
    this.type = type;
  }
  get type():string {
    return this._type;
  }
  set type(newType:string) {
    // Load json
    var json;
    $.ajax({
      type: 'GET',
      url: 'assets/'+newType+'.json',
      dataType: 'json',
      success: function(data) {
        json = data;
      },
      async: false
    });
    this._skin = {
      url: 'assets/'+newType+'.png',
      layers: json.meta.layers,
      layerHeight: json.meta.size.h,
      layerWidth: json.meta.size.w
    };
    // TODO Set attributes per ship
    this._type = newType;
  }
  adjustRudder(degrees:number):void {
    this._rudder += degrees;
    if (this._rudder < -60) this._rudder = -60;
    if (this._rudder > 60) this._rudder  = 60;
    this._rudderCooldown = 5;
  }
  adjustSails(percent:number):void {
    this._sails += percent;
    if (this._sails < 0) this._sails = 0;
    if (this._sails > 1) this._sails = 1;
  }
  toggleAnchor():void {
    if (this._anchorCooldown <= 0) {
      this._anchor = !this._anchor;
      this._anchorCooldown = 60;
    }
  }
  tick(delta:number):void {
    this._velocity += this._maxAcceleration * (this._sails-0.1) / 5 * delta;
    if (this._anchor) this._velocity -= 0.05;
    if (this._velocity > this._maxVelocity*this._sails) this._velocity = this._maxVelocity*this._sails;
    if (this._velocity < 0) this._velocity = 0;

    var prevX = this._position.x;
    var prevY = this._position.y;
    this._position.x += this._velocity * Math.cos(Math.PI / 180 * this._position.d) / 5 * delta;
    if (this.__world.isOccupied(this._position.x, this._position.y))
      this._position.x = prevX;
    this._position.y += this._velocity * Math.sin(Math.PI / 180 * this._position.d) / 5 * delta;
    if (this.__world.isOccupied(this._position.x, this._position.y))
      this._position.y = prevY;

    this._position.d += this._rudder / 30 * (this._velocity / this._maxVelocity / 2 + (this._maxVelocity/2)) * delta;
    if (this._position.d > 360) this._position.d -= 360;
    if (this._position.d < 0) this._position.d += 360;

    // Move _rudder back to center
    if (this._rudderCooldown <= 0) {
      if (this._rudder >= 3) this._rudder -= 3;
      if (this._rudder <= -3) this._rudder += 3;
      if (this._rudder < 3 && this._rudder > -3) this._rudder = 0;
    } else this._rudderCooldown -= delta;

    // Update wake
    if (this._wakeCooldown <= 0) {
      this._wake.push({
        x: this._position.x,
        y: this._position.y,
        d: this._position.d
      });
      if (this._wake.length > 10)
        this._wake = this._wake.slice(-10);
      this._wakeCooldown = 10;
    } else this._wakeCooldown -= delta;

    this._anchorCooldown -= delta;
  }
  draw():void {
    // Draw wake
    for (var w = 0; w < this._wake.length; w++)
      ui.drawImageRel(this._wake[w].x-(this._dimensions.height/2),this._wake[w].y-(this._dimensions.width/2),this._dimensions.height,this._dimensions.width,'assets/caravel_wake.png',this._wake[w].d,w/10+this._wakeCooldown/100);

    // Draw ship
    for (var l = 0; l < this._skin.layers.length; l++) {
      ui.drawSpriteRel(
        this._position.x - this._dimensions.height/2,
        this._position.y - this._dimensions.width/2 - l/this._skin.layerHeight,
        this._dimensions.height,
        this._dimensions.width,
        0,
        l*this._skin.layerHeight,
        this._skin.layerWidth,
        this._skin.layerHeight,
        this._skin.url,
        this._position.d,
        this._skin.layers[l].opacity / 255
      );
    }
    ui.drawTextRel(this._position.x,this._position.y+1,this._name?this._name:util.capitalize(this._type),0.3,util.Color.black,true);

    // Debug
    if (DEBUG) ui.drawRectRel(this._position.x-0.05,this._position.y-0.05,0.1,0.1,util.Color.red);
  }
}