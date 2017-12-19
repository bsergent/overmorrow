import Entity from 'overmorrow/classes/Entity';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import AnimationSheet from 'overmorrow/classes/AnimationSheet';
import World from 'overmorrow/classes/World';

export default class EntityPlayer extends Entity {
  private _username: string;
  private _aniSheet: AnimationSheet;

  get username(): string {
    return this._username;
  }

  constructor(x: number, y: number, username: string) {
    super(x, y, 1, 1, 'player', 0.10, 0.15);
    this._username = username;
    this._aniSheet = new AnimationSheet('assets/player.png').setDurationMultipler(1);
  }

  public setEyeColor(color: Color): EntityPlayer {
    this._aniSheet.replaceColor(new Color(99, 129, 215), color);
    return this;
  }

	public draw(ui: WorldRenderer): void {
    // Should already be offset by viewport, so draw relative to world
    this._aniSheet.draw(ui, this);
    ui.drawText(this.clone().offset(this.width / 2, 1.1), this._username, 'Courier', 12, Color.white, 'center');
  }
	public tick(delta: number, world: World): void {
    super.tick(delta, world);
    this._aniSheet.setDurationMultipler(this.velIntended.magnitude === this.speed1 ? 1 : this.speed2 / this.speed1);
    if (this.x1 === 2)
      this._aniSheet.setFrameTag('action_0');
    else {
      if (this.vel.magnitude === 0)
        this._aniSheet.setFrameTag('idle_' + this.facing);
      else
        this._aniSheet.setFrameTag('walk_' + this.facing);
    }
  }
}