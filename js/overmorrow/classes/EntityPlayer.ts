import Entity from 'overmorrow/classes/Entity';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import AnimationSheet from 'overmorrow/classes/AnimationSheet';

export default class EntityPlayer extends Entity {
  private _username: string;
  private _aniSheet: AnimationSheet;

  get username(): string {
    return this._username;
  }

  constructor(x: number, y: number, username: string) {
    super(x, y, 1, 1, 'player', 0.10, 0.20);
    this._username = username;
    this._aniSheet = new AnimationSheet('assets/player.png').setDurationMultipler(1);
  }

	public draw(ui: WorldRenderer): void {
    // Should already be offset by viewport, so draw relative to world
    //ui.drawRect(this, Color.blue);
    this._aniSheet.draw(ui, this);
  }
	public tick(delta: number): void {
    super.tick(delta);
    if (this.x1 === 2)
      this._aniSheet.setFrameTag('action');
    else {
      if (this.vel.magnitude === 0)
        this._aniSheet.setFrameTag('idle');
      else
        this._aniSheet.setFrameTag('walk');
    }
  }
}