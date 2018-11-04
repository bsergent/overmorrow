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
import UIImage from 'overmorrow/ui/UIImage';
import Rectangle from 'overmorrow/primitives/Rectangle';
import AnimationSheet from 'overmorrow/classes/AnimationSheet';
import EntityItem from 'overmorrow/classes/EntityItem';
import Item, { ItemType, ItemRarity, ItemQuality } from 'overmorrow/classes/Item';
import EntityLiving from 'overmorrow/classes/EntityLiving';
import Vector from 'overmorrow/primitives/Vector';
import EntitySlime from './EntitySlime';
import { ActionUseItem, ActionMove } from 'overmorrow/classes/Action';
import WorldSandbox from 'overmorrow/classes/WorldSandbox';
import { TileType } from 'overmorrow/classes/Tile';
import WorldDungeon from './WorldDungeon';
import UIInventory from '../overmorrow/ui/UIInventory';
import Inventory from '../overmorrow/classes/Inventory';
import UIInventoryGrid from '../overmorrow/ui/UIInventoryGrid';

class Demo {
  public static main(): void {
    Controller.init($('#game'));
    var renderer = new Renderer($('#game'), $('#buffer'), $('#temp'));

    // Set up UI
    let tpsLabel = new UILabel(renderer.width - 2, 2, '1');
    tpsLabel.setAlignment('right').setColor(Color.WHITE);
    renderer.addComponent(tpsLabel, 10);
    let drawLabel = new UILabel(renderer.width - 2, 20, '1');
    drawLabel.setAlignment('right').setColor(Color.WHITE);
    renderer.addComponent(drawLabel, 10);
    
    let playerPosLabel = new UILabel(0, 0, '0,0');
    playerPosLabel.setAlignment('left').setColor(Color.WHITE);
    renderer.addComponent(playerPosLabel, 10);


    UIPanel.setDefaultSkin('assets/borderPatch.png', 2, 10, new Color(87, 73, 57, 1), new Color(195, 170, 141));
    let panel = new UIPanel(10, 10, 250, 250);
    panel.setTitle('Test');

    let testImage = new UIImage(0, 42, 32, 32, 'assets/collision.png');
    panel.addComponent(testImage, 0);

    let testSprite = new UIImage(64, 0, 32, 32, 'assets/f1_terrain.png');
    testSprite.setSpriteCoords(new Rectangle(48, 0, 16, 16));
    panel.addComponent(testSprite, 0);

    let testAnimation = new UIImage(64, 48, 32, 32);
    let testAniSheet = new AnimationSheet('assets/player.png');
    testAniSheet.setFrameTag('idle_0').replaceColor(new Color(99, 129, 215), Color.WHITE);
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
    //renderer.addComponent(panel, 2);

    // Compile item types
    ItemType.addType('sword_obsidian')
      .setName('Obsidian Sword')
      .setImage('assets/item_sword_obsidian.png')
      .setDescription('Sharp, shimmering sword\nShouldn\'t this be brittle?')
      .setRarity(ItemRarity.UNCOMMON)
      .setWeapon(true)
      .setPower(10)
      .setWeight(5);
    ItemType.addType('book_of_wynn')
      .setName('Book of Wynn')
      .setImage('assets/item_book_of_wynn.png')
      .setDescription('Book filled with strange runes')
      .setRarity(ItemRarity.MYTHIC)
      .setShield(true)
      .setPower(1);
    ItemType.addType('torch')
      .setImage('assets/item_torch.png')
      .setDescription('Convenient light source\nEmbrace the light and fear the dark.')
      .setMaxQuantity(1000);
    ItemType.addType('lantern');
    ItemType.addType('bread')
      .setMaxQuantity(99);
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
    ItemType.addType('attack_slime')
      .setWeapon(true)
      .setPower(10)
      .setWeight(8);

    TileType.addType('dirt')
      .setImage('assets/f1_terrain.png')
      .addSpriteCoords(new Rectangle(0, 16, 16, 16))
      .setSolid(false);
    TileType.addType('wall')
      .setImage('assets/f1_terrain.png')
      .addSpriteCoords(new Rectangle(64, 0, 16, 16));
    TileType.addType('wall_moss')
      .setImage('assets/f1_terrain.png')
      .addSpriteCoords(new Rectangle(16, 0, 16, 16));
    TileType.addType('door')
      .setImage('assets/f1_terrain.png')
      .addSpriteCoords(new Rectangle(48, 0, 16, 16))
      .setSolid(false);

    // Build world
    let world = new WorldTiled('assets/dungeonEntrance.json');
    world.addEntity(new EntityItem(15, 29, new Item('sword_obsidian')));
    world.addEntity(new EntityItem(14, 26, new Item('book_of_wynn'), 10));
    let player = new EntityPlayer(Math.floor(world.width/2), Math.floor(world.height/2), 'Wake');
    let sword = new Item('sword_obsidian');
    sword.quality = ItemQuality.EXCELLENT;
    player.giveItem(sword);
    player.itemPrimary = sword;
    player.giveItem(new Item('book_of_wynn'));
    player.giveItem(new Item('torch'));
    player.giveItem(new Item('torch', 14));
    world.addEntity(player);
    let darkblade = new EntityPlayer(11, 16, 'Raesan');
    darkblade.setEyeColor(Color.BROWN);
    darkblade.giveItem(new Item('book_of_wynn'));
    darkblade.itemSecondary = new Item('shield_wooden');
    world.addEntity(darkblade);
    setInterval(() => {
      let x = 0;
      let y = 0;
      if (Math.random() < 0.5)
        x = (Math.floor(Math.random() * 3) - 1) * darkblade.speed;
      else
        y = (Math.floor(Math.random() * 3) - 1) * darkblade.speed;
      darkblade.setAction(new ActionMove(x, y));
      darkblade.direction = facingToDirection(darkblade.facing);
    }, 3000);
    let gwindor = new EntityPlayer(14, 15, 'Gwindor');
    gwindor.itemSecondary = new Item('shield_wooden');
    gwindor.facing = Facing.RIGHT;
    gwindor.direction = Direction.NORTHEAST;
    world.addEntity(gwindor);
    let slime = new EntitySlime(19, 11);
    slime.name = 'Vegeta';
    //world.addEntity(slime);
    let uiworld = new UIWorld(0, 0, renderer.width, renderer.height, renderer);
    uiworld.setWorld(world).setPlayer(player).setTileScale(128 - 32);
    renderer.addComponent(uiworld, 0);

    let healthBarBorder = new UIImage(0, renderer.height - 32, 212, 32, 'assets/health_bd.png');
    let healthBarBackground = new UIImage(6, renderer.height - 26, 200, 20, 'assets/health_bg.png');
    let healthBarForeground = new UIImage(6, renderer.height - 26, 200, 20, 'assets/health_fg.png');
    let healthBarText = new UILabel(106, renderer.height - 24, '100/100');
    healthBarText.setAlignment('center');
    healthBarText.setSize(20);
    healthBarText.setColor(Color.WHITE);
    renderer.addComponent(healthBarBorder, 1);
    renderer.addComponent(healthBarBackground, 1);
    renderer.addComponent(healthBarForeground, 1);
    renderer.addComponent(healthBarText, 1);

    let staminaBarBackground = new UIImage(6, renderer.height - 52, 200, 20, 'assets/health_bg.png');
    let staminaBarForeground = new UIImage(6, renderer.height - 52, 200, 20, 'assets/health_fg.png');
    let staminaBarText = new UILabel(106, renderer.height - 50, '100/100');
    staminaBarText.setAlignment('center');
    staminaBarText.setSize(20);
    staminaBarText.setColor(Color.WHITE);
    renderer.addComponent(staminaBarBackground, 1);
    renderer.addComponent(staminaBarForeground, 1);
    renderer.addComponent(staminaBarText, 1);

    let inv = new UIInventoryGrid(0, 64, 24, 5, 4, player.inventory).setTitle('Backpack');
    renderer.addComponent(inv, 2);
    let inv2 = new UIInventoryGrid(256, 64, 24, 3, 3, new Inventory(9)).setTitle('Chest');
    renderer.addComponent(inv2, 2);
    let inv3 = new UIInventoryGrid(256, 256 + 64, 24, 2, 2, new Inventory(4)).setTitle('Barrel');
    renderer.addComponent(inv3, 2);
    setInterval(() => {
      player.inventory.addItem(new Item('torch'));
    }, 100);
    
    // Bind controls
    Controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_ENTER])
      .setAction(event => {
        DEBUG = !DEBUG;
        console.log('DEBUG=' + DEBUG);
      });
    Controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_EQUALS])
      .setAction(event => {
        uiworld.tileScale += 16;
        console.log('tileScale=' + uiworld.tileScale);
      });
    Controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_MINUS])
      .setAction(event => {
        uiworld.tileScale -= 16;
        console.log('tileScale=' + uiworld.tileScale);
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_W])
      .setDuration(0.1)
      .setAction(event => {
        player.setAction(new ActionMove(0, -(Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed)));
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_S])
      .setDuration(0.1)
      .setAction(event => {
        player.setAction(new ActionMove(0, Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed));
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_A])
      .setDuration(0.1)
      .setAction(event => {
        player.setAction(new ActionMove(-(Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed), 0));
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_D])
      .setDuration(0.1)
      .setAction(event => {
        player.setAction(new ActionMove(Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed, 0));
      });
    Controller.addListener(EventTypes.MOUSEMOVE)
      .setAction((event: InputEvent) => {
        let px = (player.x1 + 0.5) * uiworld.tileScale - uiworld.viewport.x1;
        let py = (player.y1 + 0.5) * uiworld.tileScale - uiworld.viewport.y1;
        player.direction = degreesToDirection(Math.atan2(event.y - py, event.x - px) * 180 / Math.PI);
      });
    // TODO Change these from global listeners to only on the UIWorld element, otherwise typing in a text box will move the character, etc.
    Controller.addListener(EventTypes.MOUSEDOWN)
      .setKeys([Keys.MOUSE_LEFT])
      .setAction(event => {
        player.setAction(new ActionUseItem(player.itemPrimary, 1));
      });
    Controller.addListener(EventTypes.MOUSEDOWN)
      .setKeys([Keys.MOUSE_RIGHT])
      .setAction(event => {
        player.setAction(new ActionUseItem(player.itemPrimary, 2));
      });
    Controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_M])
      .setAction(event => {
        if (world.isTileOccupied(19, 11)) return;
        let slime = new EntitySlime(19, 11);
        slime.name = 'Vegeta Imposter';
        world.addEntity(slime);
      });

    console.log('Initialized');

    // Main game loop
    var timekeep = new TimeKeep();
    var $tps = $('#tps');
    function update() {
      timekeep.startUpdate();
      Controller.processInput();
      timekeep.addTick(world.tick(timekeep.getDelta()));
      if (player.health <= 0) {
        setTimeout(function() {
          if (player.health > 0) return;
          let newPlayer = new EntityPlayer(12, 19, player.username);
          newPlayer.itemPrimary = player.itemPrimary;
          world.addEntity(newPlayer);
          uiworld.setPlayer(newPlayer);
          player = newPlayer;
        }, 2500);
      }
      world.discover(player.x1, player.y1, 3);
      playerPosLabel.setText(`${world.name}:${player.x1.toFixed(2)},${player.y1.toFixed(2)}`);
      timekeep.addDraw(renderer.draw());
      timekeep.completeUpdate();
      $tps.text(timekeep.getTPS().toFixed(0));
      tpsLabel.setText(timekeep.getTPS().toFixed(0));
      drawLabel.setText(timekeep.lastTwentyDrawTimes[0].toFixed(0) + 'ms');
      healthBarForeground.width = player.health / player.maxHealth * 200;
      healthBarText.setText(`${Math.round(player.health)} / ${player.maxHealth}`);
      staminaBarForeground.width = player.stamina / player.maxStamina * 200;
      staminaBarText.setText(`${Math.round(player.stamina)} / ${player.maxStamina}`);
      
      setTimeout(update, timekeep.getTimeToWait());
      // TODO Also handle multiplayer stuff in here somewhere, queuing to world
    }
    update();
  }
}

Demo.main();