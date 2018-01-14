import EntityLiving from 'overmorrow/classes/EntityLiving';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import AnimationSheet from 'overmorrow/classes/AnimationSheet';
import World from 'overmorrow/classes/World';
import Item from './Item';
import Inventory from './Inventory';
import { Direction, directionToVector, degreesToDirection } from '../Utilities';

export default class EntityPlayer extends EntityLiving {
  private _username: string;
  private _aniSheet: AnimationSheet;

  get username(): string {
    return this._username;
  }

  constructor(x: number, y: number, username: string) {
    super(x, y, 1, 1, 'player', 0.10, 0.15, 100);
    this._username = username;
    this._aniSheet = new AnimationSheet('assets/player.png').setDurationMultipler(1);
    this._inventory = new Inventory(20);
  }

  public setEyeColor(color: Color): EntityPlayer {
    this._aniSheet.replaceColor(new Color(99, 129, 215), color);
    return this;
  }

	public draw(ui: WorldRenderer): void {
    // Should already be offset by viewport, so draw relative to world
    if (DEBUG) {
      ui.drawRectWire(this, Color.green);
      ui.drawRect(new Rectangle(this.x1, this.y1 + 1.02, this.width, 0.05), Color.red);
      ui.drawRect(new Rectangle(this.x1, this.y1 + 1.02, this.width * this.health / this.maxHealth , 0.05), Color.green);
      let vec = directionToVector(this.direction);
      vec.magnitude = 0.5;
      ui.drawRect(
        new Rectangle(
          this.x1 + this.width / 2 + vec.x - 0.02,
          this.y1 + this.height / 2 + vec.y - 0.02,
          0.04,
          0.04),
        Color.green
      );
      vec = directionToVector(this.direction);
      ui.drawRectWire(this.clone().offset(vec.x, vec.y), Color.red);
      ui.drawRectWire(this.clone().offset(directionToVector(degreesToDirection(this.direction + 45)).x, directionToVector(degreesToDirection(this.direction + 45)).y), Color.red);
      ui.drawRectWire(this.clone().offset(directionToVector(degreesToDirection(this.direction - 45)).x, directionToVector(degreesToDirection(this.direction - 45)).y), Color.red);
    }
    // TODO Render the item in the correct location by decoding the item layer of the AnimationSheet
    if (this.itemPrimary !== null)
      ui.drawImage(this.clone().offset(10 / 16, -3 / 16), this.itemPrimary.image);
    this._aniSheet.draw(ui, this);
    ui.drawText(this.clone().offset(this.width / 2, 1.1), DEBUG ? `${this._username} [${this.id}]`: this._username, 'Courier', 12, Color.white, 'center');
  }
	public tick(delta: number, world: World): void {
    super.tick(delta, world);
    this._aniSheet.setDurationMultipler(this.velIntended.magnitude === this.speed ? 1 : this.speedSprint / this.speed);
    if (this.vel.magnitude === 0)
      this._aniSheet.setFrameTag('idle_' + this.facing);
    else
      this._aniSheet.setFrameTag('walk_' + this.facing);
  }
}