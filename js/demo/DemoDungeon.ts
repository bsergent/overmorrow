import $ = require('jquery');
import { Controller, Keys, EventTypes, InputEvent } from 'overmorrow/Controller';
import Renderer from 'overmorrow/Renderer';
import { TimeKeep, Direction, degreesToDirection, facingToDirection, Facing } from 'overmorrow/Utilities';
import Color from 'overmorrow/primitives/Color';
import UILabel from 'overmorrow/ui/UILabel';
import UIPanel from 'overmorrow/ui/UIPanel';
import UIButton from 'overmorrow/ui/UIButton';
import UIWorld, { WorldRenderer } from 'overmorrow/ui/UIWorld';
import World from 'overmorrow/classes/World';
import WorldTiled from 'overmorrow/classes/WorldTiled';
import EntityPlayer from 'overmorrow/classes/EntityPlayer';
import UIImage from 'overmorrow/ui/UIImage';
import Rectangle from 'overmorrow/primitives/Rectangle';
import AnimationSheet from 'overmorrow/classes/AnimationSheet';
import EntityItem from 'overmorrow/classes/EntityItem';
import Item, { ItemType, ItemRarity } from 'overmorrow/classes/Item';
import EntityLiving from 'overmorrow/classes/EntityLiving';
import Vector from 'overmorrow/primitives/Vector';
import EntitySlime from 'overmorrow/classes/EntitySlime';
import { ActionUseItem, ActionMove } from 'overmorrow/classes/Action';
import WorldSandbox from 'overmorrow/classes/WorldSandbox';
import Tile, { TileType } from 'overmorrow/classes/Tile';
import WorldDungeon from './WorldDungeon';

class Demo {
  public static main(): void {
    var controller = new Controller($('#game'));
    var renderer = new Renderer($('#game'), $('#buffer'), $('#temp'), controller);

    // Set up UI
    let tpsLabel = new UILabel(renderer.width - 2, 2, '1');
    tpsLabel.setAlignment('right').setColor(Color.WHITE);
    renderer.addComponent(tpsLabel, 10);
    let drawLabel = new UILabel(renderer.width - 2, 20, '1');
    drawLabel.setAlignment('right').setColor(Color.WHITE);
    renderer.addComponent(drawLabel, 10);
    
    let playerPosLabel = new UILabel(0, 0, 'Unknown:0,0');
    playerPosLabel.setAlignment('left').setColor(Color.WHITE);
    renderer.addComponent(playerPosLabel, 10);

    TileType.addType('dirt')
      .setImage('assets/f1_terrain.png')
      .addSpriteCoords(new Rectangle(0, 32, 16, 16), 15) // Standard
      .addSpriteCoords(new Rectangle(16, 32, 16, 16), 5) // Mossy
      .addSpriteCoords(new Rectangle(32, 32, 16, 16), 15) // Large stone
      .addSpriteCoords(new Rectangle(48, 32, 16, 16)) // Puddle
      .setSolid(false);
    TileType.addType('stone')
      .setImage('assets/f1_terrain.png')
      .addSpriteCoords(new Rectangle(64, 0, 16, 16));
    TileType.addType('wall_bottom')
      .setImage('assets/f1_terrain.png')
      .addSpriteCoords(new Rectangle(48, 0, 16, 16));
    TileType.addType('wall')
      .setImage('assets/f1_terrain.png')
      .addSpriteCoords(new Rectangle(0, 16, 16, 16))
      .setDraw((ui: WorldRenderer, x: number, y: number, self: Tile) => {
        let sprite = self.type.sprite.clone();
        if (x%3===0) sprite.offset(48, 0);
        ui.drawSprite(new Rectangle(x, y, 1, 1), sprite, self.type.image);
      });
    TileType.addType('door')
      .setImage('assets/f1_terrain.png')
      .addSpriteCoords(new Rectangle(64, 16, 16, 16))
      .addSpriteCoords(new Rectangle(64, 32, 16, 16))
      .setTransparent(true)
      .setSolid(false)
      .setDraw((ui: WorldRenderer, x: number, y: number, self: Tile) => {
        ui.drawSprite(new Rectangle(x, y, 1, 1), self.type.sprites[0], self.type.image);
        if (!self.meta['open'])
          ui.drawSprite(new Rectangle(x, y, 1, 1), self.type.sprites[1], self.type.image);
      })
      .setDefaultMeta(new Map<string, any>([['open', false]]));
    TileType.addType('air')
      .setTransparent(true)
      .setSolid(false);

    // Build world
    let worldGenType: string = 'SpreadMinTree';
    let world = new WorldDungeon(worldGenType, 'dirt', 'stone', 1025); //1529552122944
    let uiworld = new UIWorld(0, 0, renderer.width, renderer.height, renderer);
    uiworld.setWorld(world).setViewport(new Rectangle(0, 0, 800, 600)).setTileScale(8);
    renderer.addComponent(uiworld, 0);
    DEBUG = true;
    
    // Bind controls
    controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_ENTER])
      .setAction((event: InputEvent) => {
        DEBUG = !DEBUG;
        console.log('DEBUG=' + DEBUG);
      });
    controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_EQUALS])
      .setAction((event: InputEvent) => {
        uiworld.tileScale += 4;
        if (DEBUG) console.log('tileScale=' + uiworld.tileScale);
      });
    controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_MINUS])
      .setAction((event: InputEvent) => {
        uiworld.tileScale -= 4;
        if (DEBUG) console.log('tileScale=' + uiworld.tileScale);
      });
    controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_W])
      .setDuration(0.1)
      .setAction((event: InputEvent) => {
        uiworld.viewport.y1 -= 4;
      });
    controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_S])
      .setDuration(0.1)
      .setAction((event: InputEvent) => {
        uiworld.viewport.y1 += 4;
      });
    controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_A])
      .setDuration(0.1)
      .setAction((event: InputEvent) => {
        uiworld.viewport.x1 -= 4;
      });
    controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_D])
      .setDuration(0.1)
      .setAction((event: InputEvent) => {
        uiworld.viewport.x1 += 4;
      });
    controller.addListener(EventTypes.KEYUP)
    .setKeys([Keys.KEY_1])
    .setAction((event: InputEvent) => {
      worldGenType = 'SpreadMinTree';
      world = new WorldDungeon(worldGenType, 'dirt', 'stone');
      uiworld.setWorld(world);
    });
    controller.addListener(EventTypes.KEYUP)
    .setKeys([Keys.KEY_2])
    .setAction((event: InputEvent) => {
      worldGenType = 'PerfectSparsen';
      world = new WorldDungeon(worldGenType, 'dirt', 'stone');
      uiworld.setWorld(world);
    });
    controller.addListener(EventTypes.MOUSEMOVE)
    .setAction((event: InputEvent) => {
      if (controller.isKeyDown(Keys.MOUSE_LEFT)) {
        uiworld.viewport.x1 += event.dx;
        uiworld.viewport.y1 += event.dy;
      }
    });
    controller.addListener(EventTypes.SCROLL)
    .setAction((event: InputEvent) => {
      uiworld.tileScale += Math.sign(event.d);
      if (DEBUG) console.log('tileScale=' + uiworld.tileScale);
    });

    console.log('Initialized');

    // Main game loop
    var timekeep = new TimeKeep();
    timekeep.setMinFrameTime(5);
    var $tps = $('#tps');
    function update() {
      timekeep.startUpdate();
      controller.processInput();
      timekeep.addTick(world.tick(timekeep.getDelta()));
      playerPosLabel.setText(world.name);
      timekeep.addDraw(renderer.draw());
      timekeep.completeUpdate();
      $tps.text(timekeep.getTPS().toFixed(0));
      tpsLabel.setText(timekeep.getTPS().toFixed(0));
      drawLabel.setText(timekeep.lastTwentyDrawTimes[0].toFixed(0) + 'ms');
      
      setTimeout(update, timekeep.getTimeToWait());
    }
    update();
  }
}

Demo.main();