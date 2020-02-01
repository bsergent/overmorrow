import $ = require('jquery');
import { Controller, Keys, EventTypes, InputEvent } from '../../dist/Controller';
import Renderer from '../../dist/Renderer';
import { TimeKeep, Direction, degreesToDirection, facingToDirection, Facing } from '../../dist/Utilities';
import Color from '../../dist/primitives/Color';
import UILabel from '../../dist/ui/UILabel';
import UIWorld, { WorldRenderer } from '../../dist/ui/UIWorld';
import EntityPlayer from '../../dist/classes/EntityPlayer';
import Rectangle from '../../dist/primitives/Rectangle';
import { ActionUseItem, ActionMove } from '../../dist/classes/Action';
import Tile, { TileType } from '../../dist/classes/Tile';
import WorldDungeon from './WorldDungeon';
import { Viewport } from '../../dist/primitives/Viewport';
import UIEngravingPanel from './UIEngravingPanel';
import UIInventoryGrid from '../../dist/ui/UIInventoryGrid';
import Inventory from '../../dist/classes/Inventory';
import Item, { ItemType, ItemRarity } from '../../dist/classes/Item';
import UIPanel from '../../dist/ui/UIPanel';

class Demo {
  public static main(): void {
    Controller.init($('#game'));
    var renderer = new Renderer($('#game') as JQuery<HTMLCanvasElement>,
      $('#buffer') as JQuery<HTMLCanvasElement>,
      $('#temp') as JQuery<HTMLCanvasElement>);

    // Set up UI
    let tpsLabel = new UILabel(renderer.width - 2, 2, '1');
    tpsLabel.setAlignment('right').setColor(Color.WHITE);
    renderer.addComponent(tpsLabel, 10);
    let drawLabel = new UILabel(renderer.width - 2, 20, '1');
    drawLabel.setAlignment('right').setColor(Color.WHITE);
    renderer.addComponent(drawLabel, 10);

    // Compile item types
    ItemType.addType('sword_obsidian')
      .setName('Obsidian Sword')
      .setImage('assets/item_sword_obsidian.png')
      .setDescription('Sharp, shimmering sword\nShouldn\'t this be brittle?')
      .setRarity(ItemRarity.RARE)
      .setWeapon(true)
      .setPower(10)
      .setWeight(5);
    ItemType.addType('sword_flint')
    .setName('Flint Knife')
    .setImage('assets/item_sword_flint.png')
    .setDescription('Sharp enough, but won\'t last long')
    .setRarity(ItemRarity.COMMON)
    .setWeapon(true)
    .setPower(3)
    .setWeight(3);
    ItemType.addType('sword_bronze')
    .setName('Bronze Sword')
    .setImage('assets/item_sword_bronze.png')
    .setDescription('Sturdy sword that should last a while')
    .setRarity(ItemRarity.COMMON)
    .setWeapon(true)
    .setPower(5)
    .setWeight(8);
    ItemType.addType('sword_iron')
    .setName('Iron Sword')
    .setImage('assets/item_sword_iron.png')
    .setDescription('Sturdy sword with a sharp edge')
    .setRarity(ItemRarity.UNCOMMON)
    .setWeapon(true)
    .setPower(7)
    .setWeight(10);

    let iteminv = new Inventory(15, 'Items');
    iteminv.addItem(new Item('sword_obsidian', 1));
    iteminv.addItem(new Item('sword_iron', 1));
    iteminv.addItem(new Item('sword_bronze', 1));
    iteminv.addItem(new Item('sword_flint', 1));
    UIPanel.setDefaultBorderPatch('assets/9p_wood');
    renderer.addComponent(new UIInventoryGrid(296, 300, 32, 5, 3, iteminv), 1);
    renderer.addComponent(new UIEngravingPanel(146, 64), 1);

    Controller.addListener(EventTypes.KEYUP).setKeys([Keys.KEY_ENTER]).setAction(() => {
      DEBUG = !DEBUG;
    });

    DEBUG = true;

    console.log('Initialized');

    // Main game loop
    var timekeep = new TimeKeep();
    timekeep.setMinFrameTime(5);
    function update() {
      timekeep.startUpdate();
      Controller.processInput();
      timekeep.addDraw(renderer.draw());
      timekeep.completeUpdate();
      tpsLabel.setText(timekeep.getTPS().toFixed(0));
      drawLabel.setText(timekeep.lastTwentyDrawTimes[0].toFixed(0) + 'ms');
      
      setTimeout(update, timekeep.getTimeToWait());
    }
    update();
  }
}

Demo.main();