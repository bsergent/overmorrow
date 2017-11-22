import Entity from 'overmorrow/classes/Entity';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';

export default class EntityPlayer extends Entity {
  private _username: string;
  get username(): string {
    return this._username;
  }
  constructor(x: number, y: number, username: string) {
    super(x, y, 1, 1, 'player', 0.10, 0.20);
    this._username = username;
  }
	public draw(ui: WorldRenderer): void {
    // Should already be offset by viewport, so draw relative to world
    ui.drawRect(this, Color.blue);
  }
	public tick(delta: number): void {
    super.tick(delta);
  }
}