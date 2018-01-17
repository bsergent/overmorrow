import EntityLiving from 'overmorrow/classes/EntityLiving';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import AnimationSheet from 'overmorrow/classes/AnimationSheet';
import World from 'overmorrow/classes/World';
import Item from './Item';
import Inventory from './Inventory';
import {facingToDirection, Direction,  directionToVector,  degreesToDirection} from '../Utilities';
import EntityPlayer from './EntityPlayer';

export default class EntitySlime extends EntityLiving {

  constructor(x: number, y: number) {
    super(x, y, 1, 1, 'slime', 0.05, 0.10, 20, 3);
    this._inventory = new Inventory(1);
    this._inventory.addItem(new Item('torch', Math.ceil(Math.random() * 3))); // Drops 1-3 torches, later lantern fuel
  }

	public draw(ui: WorldRenderer): void {
    super.draw(ui);
    ui.drawImage(this, 'assets/slime.png');
  }
	public tick(delta: number, world: World): void {
    this.processAI(world);
    super.tick(delta, world);
  }

  private processAI(world: World) {
    // TODO Use actions instead
    let nearbyEntities = world.getEntitiesInRegion(new Rectangle(this.x1 - 3, this.y1 - 3, 7, 7), [this]);
    let target: EntityPlayer = null;
    for (let e of nearbyEntities)
      if (e.type === 'player') {
        target = e as EntityPlayer;
        if (DEBUG) console.log(`Targetting ${target.username}#${target.id}`);
        break;
      }
    if (target !== null) {
      let speed = this.distanceTo(target) < 3 ? this._speedSprint : this._speed;
      this.velIntended.x = Math.sign(target.x1 - this.x1) * speed;
      if (this.velIntended.x === 0 || world.isTileOccupied(this.x1 + Math.sign(target.x1 - this.x1), this.y1, this)) {
        this.velIntended.x = 0;
        this.velIntended.y = Math.sign(target.y1 - this.y1) * speed;
      }
      this.direction = degreesToDirection(Math.atan2(target.y1 - this.y1, target.x1 - this.x1) * 180 / Math.PI);
    } else {
      if (Math.random() < 0.03) {
        if (Math.random() < 0.5)
          this.velIntended.x = (Math.floor(Math.random() * 3) - 1) * this._speed;
        else
        this.velIntended.y = (Math.floor(Math.random() * 3) - 1) * this._speed;
      }
      this.direction = facingToDirection(this.facing);
    }
  }
}