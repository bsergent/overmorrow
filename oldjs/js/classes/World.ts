export default class World {
  
}
define(['interface', 'util', 'lib/lodash', 'classes/Ship', 'lib/perlin', 'moment', 'jquery', 'classes/TiledMap', 'classes/UIPanel'],
function(ui        ,  util ,  _          ,  Ship         ,  Perlin     ,  moment ,   $     ,  TiledMap         ,  UIPanel         ) {
  return function (width, height) {
    var public = this;

    /* Public Functions */
    /*this.getTileAt = function (x, y) {
      if (!this.checkInBounds(x, y)) return null;
      return tilemap[Math.floor(y)][Math.floor(x)];
    };*/
    this.isOccupied = function (x, y) {
      if (!this.checkInBounds(x, y)) return true;
      return tilemap.isCollidable(Math.floor(x), Math.floor(y));
    };
    this.getEntityCount = function () {
      return {
        current: this.entities.length,
        max: mobCap
      };
    }
    this.getPlayer = function () {
      return player;
    };
    this.addEntity = function (entity) {
      entity._world = this;
      this.entities.push(entity);
    };
    this.removeEntity = function (entity) {
      for (var i = 0; i < entities.length; i++) {
        if (entities[i] == entity) {
          this.entities.splice(i, 1);
          return;
        }
      }
    };
    this.queueInput = function (event) {
      inputQueue.push(event);
    };

    /* Main Game Loop Functions */
    this.input = function () {
      for (var e of inputQueue) {
        // TODO Track keyup and keydown myself so that the keys won't cancel each other
        if (e.type == 'click') {
          // Fire swivel cannon
        } else if (e.type == 'keydown') {
          switch (e.which) {
            case 37: // Rudder port
            case 65:
              player.adjustRudder(-5);
              break;
            case 38: // Unfurl sails
            case 87:
              player.adjustSails(0.01);
              break;
            case 39: // Rudder starboard
            case 68:
              player.adjustRudder(5);
              break;
            case 40: // Furl sails
            case 83:
              player.adjustSails(-0.01);
              break;
            case 82: // Drop/raise anchor
              player.toggleAnchor();
              break;
            case 80: // Cycle ship type
              if (player.getType() == 'caravel')
                player.setType('longship');
              else if (player.getType() == 'longship')
                player.setType('cog');
              else
                player.setType('caravel');
              break;
            default:
              console.log('Uncaptured key: ' + e.which);
              break;
          }
        } else if (e.type == 'mousemove') {
          // Turn swivel cannon
        }
      }
      inputQueue = [];
    }
    this.tick = function (delta) {
      var startTime = moment();

      // Tick world
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          if (!discoveredTiles[y][x] && ui.isOnScreen(x,y,1,1))
            discoveredTiles[y][x] = true;
        }
      }

      for (var e of this.entities)
        e.tick(delta);
      return moment() - startTime;
    };
    this.draw = function () {
      var startTime = moment();
      if (player) ui.centerViewPort(player.position.x, player.position.y, this);
      ui.drawRect(0,0,ui.getWidth(),ui.getHeight(),'#85afcc');

      ui.setOffset(
        player.velocity*150*Math.cos(player.position.heading*Math.PI/180),
        player.velocity*150*Math.sin(player.position.heading*Math.PI/180)
      );

      // Draw world
      tilemap.drawBG(ui);
      //ui.setAA(true);
      for (var e of this.entities)
        e.draw(ui);
      ui.setAA(false);
      tilemap.drawFG(ui);

      ui.setOffset(0,0);

      // Draw minimap
      var MINIMAP_RESOLUTION = 6; // 4 tiles per unit
      var MINIMAP_WIDTH = 200;
      ui.drawRect(
        ui.getWidth()-MINIMAP_WIDTH,
        ui.getHeight()-MINIMAP_WIDTH/height*width,
        MINIMAP_WIDTH,
        MINIMAP_WIDTH/height*width,
        'rgba(112,112,112,0.5)'
      );
      for (var y = Math.floor(MINIMAP_RESOLUTION/2); y < height; y += MINIMAP_RESOLUTION) {
        for (var x = Math.floor(MINIMAP_RESOLUTION/2); x < width; x += MINIMAP_RESOLUTION) {
          if (!discoveredTiles[y][x]) continue;
          var color = tilemap.getBackgroundColor();
          if (tilemap.getTileAt(x,y) != null)
            color = tilemap.getTileAt(x,y).properties['minimapcolor'];
          ui.drawRect(
            ui.getWidth()-MINIMAP_WIDTH+((x-MINIMAP_RESOLUTION/2)*MINIMAP_WIDTH/width),
            ui.getHeight()-(MINIMAP_WIDTH/height*width)+((y-MINIMAP_RESOLUTION/2)*(MINIMAP_WIDTH/height*width)/height),
            MINIMAP_WIDTH/width*MINIMAP_RESOLUTION,
            (MINIMAP_WIDTH/height*width)/height*MINIMAP_RESOLUTION,
            color
          );
        }
      }
      ui.drawRect(
        ui.getWidth()-MINIMAP_WIDTH+(player.position.x*MINIMAP_WIDTH/width)-MINIMAP_WIDTH/50,
        ui.getHeight()-(MINIMAP_WIDTH/height*width)+(player.position.y*(MINIMAP_WIDTH/height*width)/height)-((MINIMAP_WIDTH/height*width)/50),
        MINIMAP_WIDTH/50,
        (MINIMAP_WIDTH/height*width)/50,
        'red'
      );
      ui.drawText(ui.getWidth()-MINIMAP_WIDTH/2, ui.getHeight()-1, '10 x 10 km', 10, 'rgba(0,0,0,0.5)', true);

      // Draw ui panels
      //tradeportPanel.draw(ui);
      //drydockPanel.draw(ui);

      ui.drawBuffer();
      return moment() - startTime;
    };
    this.checkInBounds = function (x, y) {
      return (x >= 0 && y >= 0 && Math.ceil(x) < width + 1 && Math.ceil(y) < height + 1);
    };

    /* Constructor */
    var tilemap;
    var discoveredTiles;
    this.entities = [];
    var inputQueue;
    var mobCap = 16;
    var player;
    var skin = {
      font: '',
      fontColor: '#897455',
      backgroundColor: '#584636',
      borderPatch: 'images/borderPatch.png',
      scale: 3
    };
    var tradeportPanel = new UIPanel('Tradeport',  64, 64, ui.getWidth() - 128, ui.getHeight() - 128, skin);
    this.generate = function () {
      // TODO Load from Tiled map
      tilemap = [];
      for (var y = 0; y < height; y++) {
        tilemap[y] = [];
        for (var x = 0; x < width; x++) {
          tilemap[y][x] = {
            collidable: false,
            type: 'water',
            discovered: false
          }
        }
      }
      var islandCount = 20;
      var islandSize = 8;
      var islandMultiplier = 1-Math.abs(Math.random()-Math.random());
      for (var i = 0; i < islandMultiplier * islandCount; i++) {
        var centerX = Math.random() * width;
        var centerY = Math.random() * height;
        if (centerX < 12 && centerY < 12) continue;
        for (var j = 0; j < islandSize*30; j++) {
          var tile = this.getTileAt(centerX+(Math.random()-Math.random())*islandSize, centerY+(Math.random()-Math.random())*islandSize);
          if (!tile) continue;
          if (tile.type == 'sand' && Math.random() < 0.1) {
            tile.type = 'port';
            if (Math.random() < 0.1) tile.discovered = true;
          } else if (tile.type == 'reef') {
            tile.type = 'sand';
            tile.collidable = true;
            tile.discovered = false;
          } else {
            tile.type = 'reef';
            tile.collidable = false;
            tile.discovered = false;
          }
        }
      }

      // Actually draw stuff
      tilemap[0][0] = {
        collidable: true,
        type: 'sand',
        discovered: false
      };
    };
    this.reset = function () {
      tilemap = new TiledMap('images/world.json');
      width = tilemap.getWidth();
      height = tilemap.getHeight();
      discoveredTiles = util.new2dArray(height, width, false);
      this.entities = [];
      inputQueue = [];
      player = new Ship('caravel');
      var spawn = tilemap.getSpawnPoint();
      player.position.x = spawn.x;
      player.position.y = spawn.y;
      player.position.heading = spawn.dir;
      this.addEntity(player);
      //this.generate();
    }
    this.reset();
  }; // End public declarations
});