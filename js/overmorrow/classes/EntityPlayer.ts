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
  private _username: string; // Unique identifier for player, not necessarily their display name
  private _aniSheet: AnimationSheet;

  public get username(): string {
    return this._username;
  }

  constructor(x: number, y: number, username: string) {
    super(x, y, 1, 1, 'player', 0.10, 0.15, 100, 10);
    this._username = username;
    this.name = username;
    this._aniSheet = new AnimationSheet('assets/player.png').setDurationMultipler(1);
    this._inventory = new Inventory(20);
  }

  public setEyeColor(color: Color): EntityPlayer {
    this._aniSheet.replaceColor(new Color(99, 129, 215), color);
    return this;
  }

	public draw(ui: WorldRenderer): void {
    super.draw(ui);
    // TODO Render the item in the correct location by decoding the item layer of the AnimationSheet
    if (this.itemPrimary !== null)
      ui.drawImage(this.clone().offset(10 / 16, -3 / 16), this.itemPrimary.image, 1, { deg: 10, x: 0.1, y: 0.9});
    this._aniSheet.draw(ui, this);
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