import EntityLiving from 'overmorrow/classes/EntityLiving';
import { WorldRenderer } from 'overmorrow/ui/UIWorld';
import Rectangle from 'overmorrow/primitives/Rectangle';
import Color from 'overmorrow/primitives/Color';
import AnimationSheet from 'overmorrow/classes/AnimationSheet';
import World from 'overmorrow/classes/World';
import Item from '../overmorrow/classes/Item';
import Inventory from '../overmorrow/classes/Inventory';
import {facingToDirection, Direction,  directionToVector,  degreesToDirection} from '../overmorrow/Utilities';
import EntityPlayer from '../overmorrow/classes/EntityPlayer';
import { ActionMove, ActionUseItem } from '../overmorrow/classes/Action';

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
    let nearbyEntities = world.getEntitiesInRegion(new Rectangle(this.x1 - 4, this.y1 - 4, 9, 7), [this]);
    let target: EntityPlayer = null;
    for (let e of nearbyEntities)
      if (e.type === 'player') {
        target = e as EntityPlayer;
        if (DEBUG) console.log(`Targetting ${target.username}#${target.id}`);
        break;
      }
    let velX = 0;
    let velY = 0;
    if (target !== null) {
      let speed = this.distanceBetweenCenters(target) < 4 && this.distanceBetweenCenters(target) > 1 ? this._speedSprint : this._speed;
      // TODO Check y before x half the time
      velX = Math.sign(target.x1 - this.x1) * speed;
      if (velX === 0 || world.isTileOccupied(this.x1 + Math.sign(target.x1 - this.x1), this.y1, this)) {
        velX = 0;
        velY = Math.sign(target.y1 - this.y1) * speed;
      }
      this.direction = degreesToDirection(Math.atan2(target.y1 - this.y1, target.x1 - this.x1) * 180 / Math.PI);
      if (this.distanceBetweenCenters(target) <= 1.7) {
        this.setAction(new ActionUseItem(new Item('attack_slime', 1)));
      }
    } else {
      if (Math.random() < 0.03) {
        if (Math.random() < 0.5)
          velX = (Math.floor(Math.random() * 3) - 1) * this._speed;
        else
        velY = (Math.floor(Math.random() * 3) - 1) * this._speed;
      }
      this.direction = facingToDirection(this.facing);
    }
    if (velX !== 0 || velY !== 0)
      this.setAction(new ActionMove(velX, velY));
  }
}