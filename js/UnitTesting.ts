import $ = require('jquery');
import { Controller, Keys, EventTypes, InputEvent } from 'overmorrow/Controller';
import Renderer from 'overmorrow/Renderer';
import { TimeKeep, Direction, degreesToDirection, facingToDirection, Facing } from 'overmorrow/Utilities';
import Color from 'overmorrow/primitives/Color';
import UILabel from 'overmorrow/ui/UILabel';
import UIPanel from 'overmorrow/ui/UIPanel';
import UIButton from 'overmorrow/ui/UIButton';
import UIWorld from 'overmorrow/ui/UIWorld';
import World from 'overmorrow/classes/World';
import WorldTiled from 'overmorrow/classes/WorldTiled';
import EntityPlayer from 'overmorrow/classes/EntityPlayer';
import UIImage from './overmorrow/ui/UIImage';
import Rectangle from './overmorrow/primitives/Rectangle';
import AnimationSheet from './overmorrow/classes/AnimationSheet';
import EntityItem from './overmorrow/classes/EntityItem';
import Item, { ItemType, ItemRarity } from './overmorrow/classes/Item';
import EntityLiving from './overmorrow/classes/EntityLiving';
import Vector from './overmorrow/primitives/Vector';
import * as moment from '../node_modules/moment/moment';

class UnitTesting {
  public static main(): void {
    var controller = new Controller($('#game'));
    var renderer = new Renderer($('#game'), $('#buffer'), $('#temp'), controller);

    // Compile item types
    ItemType.addType('sword_obsidian')
      .setName('Obsidian Sword')
      .setImage('assets/item_sword_obsidian.png')
      .setRarity(ItemRarity.UNCOMMON)
      .setWeapon(true)
      .setPower(10);
    ItemType.addType('shield_wooden')
      .setName('Wooden Shield')
      .setShield(true);
    ItemType.addType('bow')
      .setWeapon(true)
      .setPower(5)
      .setRange(4)
      .setAction(function (item: Item, world: World, user: EntityLiving) {
        for (let e of world.getEntitiesByRaycast(user.x1, user.y1, user.direction, item.type.range, true))
          if (e instanceof EntityLiving)
            (e as EntityLiving).defendAgainst(user, item);
      });

    // Build world
    let world = new WorldTiled('assets/dungeonEntrance.json');
    let p1 = new EntityPlayer(10, 16, 'Player1');
    p1.itemPrimary = new Item('sword_obsidian');
    p1.itemSecondary = new Item('shield_wooden');
    world.addEntity(p1);
    let p2 = new EntityPlayer(11, 16, 'Player2');
    p2.itemSecondary = new Item('shield_wooden');
    world.addEntity(p2);

    // Returns true if values match, logs error if they do not
    let startTime: moment.Moment = moment();
    let passed: number = 0;
    let failed: number = 0;
    function compareHealth(value: number, expected: number): boolean {
      if (value !== expected) {
        console.error(`[FAIL:${passed + failed}] Incorrect health. Expected ${expected}. Got ${value}.\n  `
          + (p1.x1 != p2.x1 && p1.y1 != p2.y1 ? 'Diagonal' : 'Horizontal')
          + ` P1=${Direction[p1.direction]}, P2=${Direction[p2.direction]}`);
        failed++;
        return false;
      }
      passed++;
      return true;
    }
    
    console.log('Starting unit tests.');

    /* Combat Tests */
    // Horizontal
    p1.direction = Direction.EAST;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power / 8);
    
    p2.health = p2.maxHealth;
    p1.direction = Direction.NORTHEAST;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power / 2);
    
    p2.health = p2.maxHealth;
    p1.direction = Direction.SOUTHEAST;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power / 2);
    
    p2.health = p2.maxHealth;
    p1.direction = Direction.NORTH;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth);
    
    p2.health = p2.maxHealth;
    p1.direction = Direction.NORTHWEST;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth);

    p2.health = p2.maxHealth;
    p1.direction = Direction.NORTHEAST;
    p2.direction = Direction.NORTHWEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power / 16);

    p2.health = p2.maxHealth;
    p1.direction = Direction.EAST;
    p2.direction = Direction.NORTHWEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power);

    // Diagonal
    p1.y1 += 1;
    p2.health = p2.maxHealth;
    p1.direction = Direction.EAST;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power / 2);
    
    p2.health = p2.maxHealth;
    p1.direction = Direction.NORTHEAST;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power);
    
    p2.health = p2.maxHealth;
    p1.direction = Direction.NORTH;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power / 16);
    
    p2.health = p2.maxHealth;
    p1.direction = Direction.NORTHWEST;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth);
    
    p2.health = p2.maxHealth;
    p1.direction = Direction.SOUTHWEST;
    p2.direction = Direction.WEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth);

    p2.health = p2.maxHealth;
    p1.direction = Direction.NORTH;
    p2.direction = Direction.SOUTHWEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power / 2);

    p2.health = p2.maxHealth;
    p1.direction = Direction.NORTHEAST;
    p2.direction = Direction.SOUTHWEST;
    p1.useItem(world, p1.itemPrimary);
    compareHealth(p2.health, p2.maxHealth - p1.itemPrimary.power / 8);

    console.log('Finished unit tests.');

    let endTime: moment.Moment = moment();

    renderer.drawRect(
      new Rectangle(0, 0, renderer.width, renderer.height),
      failed > 0 ? new Color(100,0,0) : new Color(0,100,0));
    renderer.drawText(
      new Rectangle(renderer.width /  2, renderer.height / 2 - 104, 0, 0),
      'Unit Test Results',
      'Courier New',
      32,
      Color.white,
      'center');
    renderer.drawText(
      new Rectangle(renderer.width /  2, renderer.height / 2 - 72, 0, 0),
      `Passed: ${passed}`,
      'Courier New',
      72,
      Color.white,
      'center');
    renderer.drawText(
      new Rectangle(renderer.width /  2, renderer.height / 2, 0, 0),
      `Failed: ${failed}`,
      'Courier New',
      72,
      Color.white,
      'center');
    renderer.drawText(
      new Rectangle(renderer.width /  2, renderer.height / 2 + 72, 0, 0),
      `Time Elapsed: ${endTime.diff(startTime)}ms`,
      'Courier New',
      32,
      Color.white,
      'center');
    renderer.drawBuffer();


    // Main game loop
    var timekeep = new TimeKeep();
    var $tps = $('#tps');
    function update() {
      timekeep.startUpdate();
      controller.processInput();
      timekeep.addTick(world.tick(timekeep.getDelta())); 
      timekeep.addDraw(0);
      timekeep.completeUpdate();
      $tps.text(timekeep.getTPS().toFixed(0));
      setTimeout(update, timekeep.getTimeToWait());
    }
    update();
  }
}

UnitTesting.main();