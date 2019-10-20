import EntityLiving from '../../src/classes/EntityLiving';
import { WorldRenderer } from '../../src/ui/UIWorld';
import Rectangle from '../../src/primitives/Rectangle';
import World from '../../src/classes/World';
import Item from '../../src/classes/Item';
import Inventory from '../../src/classes/Inventory';
import {facingToDirection, Direction,  directionToVector,  degreesToDirection} from '../../src/Utilities';
import EntityPlayer from '../../src/classes/EntityPlayer';
import { ActionMove, ActionUseItem } from '../../src/classes/Action';

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
      let speed = this.distanceBetweenCenters(target) < 4 && this.distanceBetweenCenters(target) > 1 && this._stamina / this._maxStamina > 0.25 ? this._speedSprint : this._speed;
      // TODO Check y before x half the time
      velX = Math.sign(target.x1 - this.x1) * speed;
      if (velX === 0 || world.isTileOccupied(this.x1 + Math.sign(target.x1 - this.x1), this.y1, this)) {
        velX = 0;
        velY = Math.sign(target.y1 - this.y1) * speed;
      } else if (Math.abs(target.x1 - this.x1) < 1/world.subGridDivisions) {
        velX = velX / speed * this._speed; // Don't sprint when almost lined up to prevent over-shooting
      }
      this.direction = degreesToDirection(Math.atan2(target.y1 - this.y1, target.x1 - this.x1) * 180 / Math.PI);
      if (this.distanceBetweenCenters(target) <= 1.7) {
        this.queueAction(new ActionUseItem(new Item('attack_slime', 1)));
        return;
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
      this.queueAction(new ActionMove(velX, velY));
  }
}