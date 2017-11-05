define(['interface', 'classes/EntityWorm'],
function(ui        ,  EntityWorm         ) {
  return function (world, player, io) {
    /* Private */
    var inputQueue = [];
    var DEBUG;

    /* Public */
    this.queueInput = function queueInput(event) {
      inputQueue.push(event);
    };
    this.processInput = function processInput() {
      var alreadyMoved = false;
      player.setVelocity(0,0);
      for (var e of inputQueue) {
        if (e.type == 'click') {
          if (player.structureList[player.selectedIndex] == 'Light') {
            /*var userLight = new StructureLight();
            userLight.lightColor = [
                Number.parseInt($('#red').val()),
                Number.parseInt($('#green').val()),
                Number.parseInt($('#blue').val()),
                Number.parseInt($('#strength').val())
              ];
            tilemap[Math.floor(e.offsetY / tileScale)][Math.floor(e.offsetX / tileScale)].structures.push(userLight);*/
            var worm = new EntityWorm(Math.floor(e.offsetX / ui.getViewPort().tileScale),Math.floor(e.offsetY / ui.getViewPort().tileScale),public);
            worm._world = world;
            world.entities.push(worm);
          } else {
            var tile = world.getTileAt(e.offsetX / ui.getViewPort().tileScale, e.offsetY / ui.getViewPort().tileScale);
            console.log('rgb('+tile.light+')');
          }
        } else if (e.type == 'keydown') {
          switch (e.which) {
            case 37: // Left
            case 65:
              if (!alreadyMoved) player.setVelocity(-1/2,0);
              io.emit('entity_move', { id: player.id, position: player.position, velocity: player.velocity });
              alreadyMoved = true;
              break;
            case 38: // Up
            case 87:
              if (!alreadyMoved) player.setVelocity(0,-1/2);
              io.emit('entity_move', { id: player.id, position: player.position, velocity: player.velocity });
              alreadyMoved = true;
              break;
            case 39: // Right
            case 68:
              if (!alreadyMoved) player.setVelocity(1/2,0);
              io.emit('entity_move', { id: player.id, position: player.position, velocity: player.velocity });
              alreadyMoved = true;
              break;
            case 40: // Down
            case 83:
              if (!alreadyMoved) player.setVelocity(0,1/2);
              io.emit('entity_move', { id: player.id, position: player.position, velocity: player.velocity });
              alreadyMoved = true;
              break;
            case 13: // Enter
            case 69: // E
            case 32: // Space
              if (!alreadyMoved) player.build();
              alreadyMoved = true;
              break;
            case 17: // Ctrl
            case 82: // R
              player.cycleBuild(-1);
              break;
            case 70: // F
              player.cycleBuild(1);
              break;
            case 81: // Q
            case 96: // numpad-0
              player.build('Wooden Support');
              break;
            case 145: // Scroll lock
              DEBUG = !DEBUG;
              break;
            default:
              console.log(e.which);
              break;
          }
        } else if (e.type == 'mousemove') {
          var vp = ui.getViewPort();
          var x = (e.offsetX+vp.x)/vp.tileScale;
          var y = (e.offsetY+vp.y)/vp.tileScale;
          var tile = world.getTileAt(x, y);
          if (!tile) continue;
          ui.setHoveredTile(x, y, tile);
        }
      }
      inputQueue = [];
    };

    return this;
  };
});