import $ = require('jquery');
import { Controller, Keys, EventTypes, InputEvent } from '../../dist/Controller';
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
    world.subGridDivisions = 4;
    let uiworld = new UIWorld(0, 0, renderer.width, renderer.height, renderer);
    uiworld.setWorld(world).setViewport(new Viewport(0, 0, 800, 600, 8));
    renderer.addComponent(uiworld, 0);
    DEBUG = true;
    let player: EntityPlayer = null;
    
    // Bind controls
    Controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_ENTER])
      .setAction((event: InputEvent) => {
        DEBUG = !DEBUG;
        console.log('DEBUG=' + DEBUG);
      });
    Controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_EQUALS])
      .setAction((event: InputEvent) => {
        uiworld.tileScale += 4;
        if (DEBUG) console.log('tileScale=' + uiworld.tileScale);
      });
    Controller.addListener(EventTypes.KEYDOWN)
      .setKeys([Keys.KEY_MINUS])
      .setAction((event: InputEvent) => {
        uiworld.tileScale -= 4;
        if (DEBUG) console.log('tileScale=' + uiworld.tileScale);
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_W])
      .setDuration(0.1)
      .setAction((event: InputEvent) => {
        if (player !== null)
          player.queueAction(new ActionMove(0, -(Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed)));
        uiworld.viewport.y1 -= 4;
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_S])
      .setDuration(0.1)
      .setAction((event: InputEvent) => {
        if (player !== null)
          player.queueAction(new ActionMove(0, (Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed)));
        uiworld.viewport.y1 += 4;
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_A])
      .setDuration(0.1)
      .setAction((event: InputEvent) => {
        if (player !== null)
          player.queueAction(new ActionMove(-(Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed), 0));
        uiworld.viewport.x1 -= 4;
      });
    Controller.addListener(EventTypes.KEYHELD)
      .setKeys([Keys.KEY_D])
      .setDuration(0.1)
      .setAction((event: InputEvent) => {
        if (player !== null)
          player.queueAction(new ActionMove((Controller.isKeyDown(Keys.KEY_SHIFT) ? player.speedSprint : player.speed), 0));
        uiworld.viewport.x1 += 4;
      });
    Controller.addListener(EventTypes.KEYUP)
    .setKeys([Keys.KEY_1])
    .setAction((event: InputEvent) => {
      worldGenType = 'SpreadMinTree';
      world = new WorldDungeon(worldGenType, 'dirt', 'stone');
      world.subGridDivisions = 4;
      uiworld.setWorld(world);
    });
    Controller.addListener(EventTypes.KEYUP)
    .setKeys([Keys.KEY_2])
    .setAction((event: InputEvent) => {
      worldGenType = 'PerfectSparsen';
      world = new WorldDungeon(worldGenType, 'dirt', 'stone');
      world.subGridDivisions = 4;
      uiworld.setWorld(world);
    });
    Controller.addListener(EventTypes.MOUSEMOVE)
    .setAction((event: InputEvent) => {
      if (Controller.isKeyDown(Keys.MOUSE_LEFT)) {
        uiworld.viewport.x1 += event.dx;
        uiworld.viewport.y1 += event.dy;
      }
    });
    Controller.addListener(EventTypes.SCROLL)
    .setAction((event: InputEvent) => {
      uiworld.tileScale -= Math.sign(event.d);
      if (DEBUG) console.log('tileScale=' + uiworld.tileScale);
    });
    Controller.addListener(EventTypes.KEYUP)
    .setKeys([Keys.KEY_SPACE])
    .setAction((event: InputEvent) => {
      player = new EntityPlayer(15, 15, 'Wake');
      world.addEntity(player);
      uiworld.setPlayer(player);
      timekeep.setMinFrameTime();
    });

    console.log('Initialized');

    // Main game loop
    var timekeep = new TimeKeep();
    timekeep.setMinFrameTime(5);
    var $tps = $('#tps');
    function update() {
      timekeep.startUpdate();
      Controller.processInput();
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