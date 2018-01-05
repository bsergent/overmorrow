import $ = require('jquery');
import { Controller, Keys, EventTypes, InputEvent } from 'overmorrow/Controller';
import Renderer from 'overmorrow/Renderer';
import { TimeKeep, Direction, degreesToDirection, facingToDirection } from 'overmorrow/Utilities';
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

class Demo {
  public static main(): void {
    var controller = new Controller($('#game'));
    var renderer = new Renderer($('#game'), $('#buffer'), $('#temp'), controller);

    // Set up UI
    let tpsLabel = new UILabel(renderer.getWidth() - 2, 2, '1');
    tpsLabel.setAlignment('right').setColor(Color.white);
    renderer.addComponent(tpsLabel, 10);
    let drawLabel = new UILabel(renderer.getWidth() - 2, 20, '1');
    drawLabel.setAlignment('right').setColor(Color.white);
    renderer.addComponent(drawLabel, 10);
    
    let playerPosLabel = new UILabel(0, 0, '0,0');
    playerPosLabel.setAlignment('left').setColor(Color.white);
    renderer.addComponent(playerPosLabel, 10);


    let panel = new UIPanel(10, 10, 250, 250);
    panel.setTitle('Test').setPadding(10).setSkin('assets/borderPatch.png', 2, new Color(87, 73, 57, 1));

    let testLabel = new UILabel(0, 0, 'Title');
    testLabel.setSize(24).setColor(Color.white);
    panel.addComponent(testLabel, 0);

    let testImage = new UIImage(0, 42, 32, 32, 'assets/collision.png');
    panel.addComponent(testImage, 0);

    let testSprite = new UIImage(64, 0, 32, 32, 'assets/f1_terrain.png');
    testSprite.setSpriteCoords(new Rectangle(48, 0, 16, 16));
    panel.addComponent(testSprite, 0);

    let testAnimation = new UIImage(64, 48, 32, 32);
    let testAniSheet = new AnimationSheet('assets/player.png');
    testAniSheet.setFrameTag('idle_0').replaceColor(new Color(99, 129, 215), Color.white);
    testAnimation.setAnimationSheet(testAniSheet);
    panel.addComponent(testAnimation, 0);

    let testButton = new UIButton(panel.width / 2 - 32, panel.height - 32, 64, 16, 'Test');
    testButton.setAction(() => {
      console.log('Clicked test button');
      testButton.setText(Math.random().toString(16).substr(2, 5));
    });
    panel.addComponent(testButton, 0);
    let closeButton = new UIButton(panel.width - 84, 0, 64, 16, 'Close');
    closeButton.setAction(() => {
      renderer.removeComponent(panel);
    });
    panel.addComponent(closeButton, 0);
    renderer.addComponent(panel, 2);

    // Compile item types
    ItemType.addType('sword_obsidian')
      .setName('Obsidian Sword')
      .setImage('assets/item_sword_obsidian.png')
      .setRarity(ItemRarity.UNCOMMON)
      .setWeapon(true)
      .setPower(10);
    ItemType.addType('book_of_wynn')
      .setName('Book of Wynn')
      .setImage('assets/item_book_of_wynn.png')
      .setRarity(ItemRarity.MYTHIC)
      .setShield(true)
      .setPower(1);
    ItemType.addType('torch')
      .setMaxQuantity(99);
    ItemType.addType('lantern');
    ItemType.addType('bread')
      .setMaxQuantity(99);
    ItemType.addType('shield_wooden')
      .setName('Wooden Shield');
    ItemType.addType('bow')
      .setWeapon(true)
      .setPower(5)
      .setRange(4)
      .setAction(function (item: Item, world: World, user: EntityLiving) {
        for (let e of world.getEntitiesByRaycast(user.x1, user.y1, user.direction, item.type.range, true))
          if (e instanceof EntityLiving)
            (e as EntityLiving).defendAgainst(user, item, user.direction + 180);
      });

    // Build world
    let world = new WorldTiled('assets/dungeonEntrance.json');
    world.addEntity(new EntityItem(15, 29, new Item('sword_obsidian')));
    world.addEntity(new EntityItem(14, 26, new Item('book_of_wynn'), 10));
    let player = new EntityPlayer(15, 31, 'Wake');
    player.itemRight = new Item('sword_obsidian');
    world.addEntity(player);
    player.health -= 70;
    let darkblade = new EntityPlayer(11, 16, 'Raesan');
    darkblade.setEyeColor(Color.brown);
    darkblade.giveItem(new Item('book_of_wynn'));
    darkblade.giveItem(new Item('sword_obsidian'));
    //darkblade.health = 0;
    world.addEntity(darkblade);
    setInterval(() => {
      if (Math.random() < 0.5)
        darkblade.velIntended.x = (Math.floor(Math.random() * 3) - 1) * darkblade.speed;
      else
        darkblade.velIntended.y = (Math.floor(Math.random() * 3) - 1) * darkblade.speed;
      darkblade.direction = facingToDirection(darkblade.facing);
    }, 3000);
    let uiworld = new UIWorld(0, 0, renderer.getWidth(), renderer.getHeight(), renderer);
    uiworld.setWorld(world).setPlayer(player).setTileScale(128 - 32);
    renderer.addComponent(uiworld, 0);

    let healthBarBorder = new UIImage(0, renderer.getHeight() - 32, 212, 32, 'assets/health_bd.png');
    let healthBarBackground = new UIImage(6, renderer.getHeight() - 26, 200, 20, 'assets/health_bg.png');
    let healthBarForeground = new UIImage(6, renderer.getHeight() - 26, 200, 20, 'assets/health_fg.png');
    let healthBarText = new UILabel(106, renderer.getHeight() - 24, '100/100');
    healthBarText.setAlignment('center');
    healthBarText.setSize(20);
    healthBarText.setColor(Color.white);
    renderer.addComponent(healthBarBorder, 1);
    renderer.addComponent(healthBarBackground, 1);
    renderer.addComponent(healthBarForeground, 1);
    renderer.addComponent(healthBarText, 1);
    
    // Bind controls
    controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_ENTER])
      .setAction(event => {
        DEBUG = !DEBUG;
        console.log('DEBUG=' + DEBUG);
      });
    controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_EQUALS])
      .setAction(event => {
        uiworld.tileScale += 16;
        console.log('tileScale=' + uiworld.tileScale);
      });
    controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_MINUS])
      .setAction(event => {
        uiworld.tileScale -= 16;
        console.log('tileScale=' + uiworld.tileScale);
      });
    controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_W])
      .setAction(event => {
        player.velIntended.x = 0;
        player.velIntended.y = -(controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed);
      });
    controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_S])
      .setAction(event => {
        player.velIntended.x = 0;
        player.velIntended.y = controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed;;
      });
    controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_A])
      .setAction(event => {
        player.velIntended.x = -(controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed);
        player.velIntended.y = 0;
      });
    controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_D])
      .setAction(event => {
        player.velIntended.x = controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed;
        player.velIntended.y = 0;
      });
    controller.addListener(EventTypes.MOUSEMOVE)
      .setAction((event: InputEvent) => {
        let px = (player.x1 + 0.5) * uiworld.tileScale - uiworld.viewport.x1;
        let py = (player.y1 + 0.5) * uiworld.tileScale - uiworld.viewport.y1;
        player.direction = degreesToDirection(Math.atan2(event.y - py, event.x - px) * 180 / Math.PI);
      });
    controller.addListener(EventTypes.MOUSEDOWN)
      .setKeys([Keys.MOUSE_LEFT])
      .setAction(event => {
        player.useItem(world, player.itemRight);
      });

    console.log('Initialized');

    // Main game loop
    var timekeep = new TimeKeep();
    var $tps = $('#tps');
    function update() {
      timekeep.startUpdate();
      controller.processInput();
      timekeep.addTick(world.tick(timekeep.getDelta())); // Pass timekeep.getDelta() to world
      playerPosLabel.setText(player.x1.toFixed(2) + ',' + player.y1.toFixed(2));
      timekeep.addDraw(renderer.draw());
      timekeep.completeUpdate();
      $tps.text(timekeep.getTPS().toFixed(0));
      tpsLabel.setText(timekeep.getTPS().toFixed(0));
      drawLabel.setText(timekeep.lastTwentyDrawTimes[0].toFixed(0) + 'ms');
      healthBarForeground.width = player.health / player.maxHealth * 200;
      healthBarText.setText(`${player.health} / ${player.maxHealth}`);
      
      setTimeout(update, timekeep.getTimeToWait());
      // TODO Also handle multiplayer stuff in here somewhere, queuing to world
    }
    update();
  }
}

Demo.main();