import $ = require('jquery');
import { Controller, Keys, EventTypes, InputEvent } from '../../dist/Controller';
import { TimeKeep, Direction, degreesToDirection, facingToDirection, Facing } from '../../dist/Utilities';
import Color from '../../dist/primitives/Color';
import UILabel from '../../dist/ui/UILabel';
import UIPanel from '../../dist/ui/UIPanel';
import UIButton from '../../dist/ui/UIButton';
import UIWorld from '../../dist/ui/UIWorld';
import World from '../../dist/classes/World';
import WorldTiled from '../../dist/classes/WorldTiled';
import EntityPlayer from '../../dist/classes/EntityPlayer';
import UIImage from '../../dist/ui/UIImage';
import Rectangle from '../../dist/primitives/Rectangle';
import AnimationSheet from '../../dist/classes/AnimationSheet';
import EntityItem from '../../dist/classes/EntityItem';
import Item, { ItemType, ItemRarity, ItemQuality } from '../../dist/classes/Item';
import EntityLiving from '../../dist/classes/EntityLiving';
import Vector from '../../dist/primitives/Vector';
import EntitySlime from './EntitySlime';
import { ActionUseItem, ActionMove } from '../../dist/classes/Action';
import { TileType } from '../../dist/classes/Tile';
import UIInventory, { InventoryEvent } from '../../dist/ui/UIInventory';
import Inventory from '../../dist/classes/Inventory';
import UIInventoryGrid from '../../dist/ui/UIInventoryGrid';
import EntityProjectile from '../../dist/classes/EntityProjectile';
import UIHealth from './UIHealth';
import UIStamina from './UIStamina';
import RendererCanvas from '../../dist/RendererCanvas';

class Demo {
  public static main(): void {
    Controller.init($('#game'));
    var renderer = new RendererCanvas($('#game') as JQuery<HTMLCanvasElement>,
      $('#buffer') as JQuery<HTMLCanvasElement>);

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


    UIPanel.setDefaultBorderPatch('assets/9p_wood');
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
      .setImage('assets/item_bow.png')
      // TODO Set animation sheet for basic animations
      // TODO Include held position and rotation for how the item should be held in the json, include at-rest
      // TODO Rename AnimationSheet to a more general Sprite?
      // TODO Modify Renderer.drawSprite() to actually take a sprite?
      //      Probs unnecessary, but should rename method or make an override that calls after converting the AnimationSheet/Sprite
      //.setAnimationSheet(new AnimationSheet('assets/item_bow.png'),
      //  { WARMUP: 'draw', ACT: 'shoot', RECOVERY: 'normal', COMPLETE: 'normal'}) // Append _direction? if null, use the first tag
      .setWeight(3)
      // TODO Set warmup, act, and recovery times directly
      .setAction(function (item: Item, world: World, user: EntityLiving) {
        // TODO Look for arrows in inventory
        let cursor = Controller.getCursor();
        let cursorRel = uiworld.viewport.toRelative(cursor) as Vector;
        let traj = cursorRel.add(player.center.invert());
        traj.magnitude = 0.5;
        let x = player.center.x + traj.x;
        let y = player.center.y + traj.y;
        world.addEntity(new EntityProjectile(x-0.3, y-0.3, 0.6, 0.6, 0.5, traj.direction, new Item('arrow_normal'), player));
        // for (let e of world.getEntitiesByRaycast(user.x1, user.y1, user.direction, item.type.range, true))
        //   if (e instanceof EntityLiving)
        //     (e as EntityLiving).defendAgainst(user, item);
      });
    ItemType.addType('arrow_normal')
      .setWeapon(true)
      .setPower(5)
      .setRange(10)
      .setMaxQuantity(99)
      .setImage('assets/item_arrow.png');
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
    world.subGridDivisions = 4;
    world.addEntity(new EntityItem(15, 29, new Item('sword_obsidian')));
    world.addEntity(new EntityItem(14, 26, new Item('book_of_wynn'), 10));
    let player = new EntityPlayer(Math.floor(world.width/2), Math.floor(world.height/2), 'Wake');
    let sword = new Item('sword_obsidian');
    sword.quality = ItemQuality.EXCELLENT;
    player.giveItem(sword);
    player.itemPrimary = sword;
    player.giveItem(new Item('bow'));
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
      darkblade.queueAction(new ActionMove(x, y));
      darkblade.direction = facingToDirection(darkblade.facing);
    }, 3000);
    let gwindor = new EntityPlayer(14, 15, 'Gwindor');
    gwindor.itemSecondary = new Item('shield_wooden');
    gwindor.facing = Facing.RIGHT;
    gwindor.direction = Direction.NORTHEAST;
    world.addEntity(gwindor);
    let slime = new EntitySlime(19, 11);
    slime.name = 'Vegeta';
    world.addEntity(slime);
    let uiworld = new UIWorld(0, 0, renderer.width, renderer.height, renderer);
    uiworld.setWorld(world).setPlayer(player).setTileScale(64);
    renderer.addComponent(uiworld, 0);

    let healthBar = new UIHealth(0, renderer.height - 104, 24, player, 'assets/gui_bars.png', 10);
    renderer.addComponent(healthBar, 1);
    let staminaBar = new UIStamina(24, renderer.height - 64, 24, 64, player, 'assets/gui_bars.png');
    renderer.addComponent(staminaBar, 1);

    let inv = new UIInventoryGrid(0, 0, 32, 5, 4, player.inventory);
    inv.setTitle('Backpack');
    inv.addListener(EventTypes.INVMOVE)
      .setAction((event: InventoryEvent) => {
        if (event.toIndex === 0 || event.fromIndex)
          player.itemPrimary = player.inventory.getItemAt(0);
      });
    renderer.addComponent(inv, 2);
    let inv2 = new UIInventoryGrid(256, 64, 32, 3, 3, new Inventory(9)).setTitle('Chest');
    renderer.addComponent(inv2, 2);
    let inv3 = new UIInventoryGrid(256, 256 + 64, 32, 2, 2, new Inventory(4)).setTitle('Barrel');
    renderer.addComponent(inv3, 2);
    let inv4 = new UIInventoryGrid(256, 256 + 128, 32, 1, 1, new Inventory(1)).setTitle('Boot');
    renderer.addComponent(inv4, 2);
    // setInterval(() => {
    //   player.inventory.addItem(new Item('torch'));
    // }, 100);
    
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
        player.queueAction(new ActionMove(0, -(Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed)));
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_S])
      .setDuration(0.1)
      .setAction(event => {
        player.queueAction(new ActionMove(0, Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed));
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_A])
      .setDuration(0.1)
      .setAction(event => {
        player.queueAction(new ActionMove(-(Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed), 0));
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_D])
      .setDuration(0.1)
      .setAction(event => {
        player.queueAction(new ActionMove(Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed, 0));
      });
    Controller.addListener(EventTypes.MOUSEMOVE)
      .setAction((event: InputEvent) => {
        let px = (player.x1 + 0.5) * uiworld.tileScale - uiworld.viewport.x1;
        let py = (player.y1 + 0.5) * uiworld.tileScale - uiworld.viewport.y1;
        player.direction = degreesToDirection(Math.atan2(event.y - py, event.x - px) * 180 / Math.PI);
      });
    // TODO Change these from global listeners to only on the UIWorld element, otherwise typing in a text box will move the character, clicking an item will attack, etc.
    Controller.addListener(EventTypes.MOUSEDOWN)
      .setKeys([Keys.MOUSE_LEFT])
      .setAction(event => {
        player.queueAction(new ActionUseItem(player.itemPrimary, 1));
      });
    Controller.addListener(EventTypes.MOUSEDOWN)
      .setKeys([Keys.MOUSE_RIGHT])
      .setAction(event => {
        player.queueAction(new ActionUseItem(player.itemPrimary, 2));
      });
    Controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_M])
      .setAction(event => {
        if (world.isTileOccupied(19, 11)) return;
        let slime = new EntitySlime(19, 11);
        slime.name = 'Vegeta Imposter';
        world.addEntity(slime);
      });
    Controller.addListener(EventTypes.SCROLL)
      .setAction(event => {
        if (event.dy < 0)
          player.stamina += 0.5;
        if (event.dy > 0)
          player.stamina -= 0.5;
        if (player.stamina > player.maxStamina)
          player.stamina = player.maxStamina;
      })

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
          inv.setInventory(newPlayer.inventory);
          player = newPlayer;
          healthBar.entity = newPlayer;
          staminaBar.entity = newPlayer;
        }, 2500);
      }
      world.discover(player.center.x, player.center.y, 4.5);
      playerPosLabel.setText(`${world.name}:${player.x1.toFixed(2)},${player.y1.toFixed(2)}`);
      timekeep.addDraw(renderer.draw());
      timekeep.completeUpdate();
      $tps.text(timekeep.getTPS().toFixed(0));
      tpsLabel.setText(timekeep.getTPS().toFixed(0));
      drawLabel.setText(timekeep.lastTwentyDrawTimes[0].toFixed(0) + 'ms');
      
      setTimeout(update, timekeep.getTimeToWait());
      // TODO Also handle multiplayer stuff in here somewhere, queuing to world
    }
    update();
  }
}

Demo.main();