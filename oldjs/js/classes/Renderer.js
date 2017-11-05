define(['interface', 'moment', 'util'],
function(ui        ,  moment ,  util ) {
  return function (world, player) {
    this.draw = function draw() {
      if (!world || !player) return -1;
      var startTime = moment();

      var tileScale = 1;

      if (world.collapsing) ui.setOffset(tileScale/2 * (Math.random() - 1), 0);
      ui.centerViewPort(player.position.x, player.position.y, world);
      ui.drawRect(0,0,ui.getWidth(),ui.getHeight(),'#000');

      // Draw map
      for (var y = 0; y < world.tilemap.length; y++) {
        for (var x = 0; x < world.tilemap[y].length; x++) {
          if (world.tilemap[y][x].light[3] <= 0) continue;

          // Draw tile
          if (world.tilemap[y][x].type === 'air') {
            ui.drawImageRel(x*tileScale, y*tileScale, tileScale, tileScale, world.tilemap[y][x].texture);
          } else if (world.tilemap[y][x].type === 'stone' || world.tilemap[y][x].type === 'rubble') {
            ui.drawImageRel(x*tileScale, y*tileScale, tileScale, tileScale, world.tilemap[y][x].texture);
            ui.drawRectRel(x*tileScale, y*tileScale, tileScale, tileScale, world.tilemap[y][x].tint);
          } else {
            if (world.tilemap[y][x].damaged) {
              ui.drawRectRel(x*tileScale, y*tileScale, tileScale, tileScale, '#C85');
              ui.drawRectRel(x*tileScale+(tileScale/4), y*tileScale+(tileScale/4), tileScale/2, tileScale/2, world.tilemap[y][x].color);
            } else {
              ui.drawRectRel(x*tileScale, y*tileScale, tileScale, tileScale, world.tilemap[y][x].color);
            }
          }
          if (world.tilemap[y][x].ores.length > 0) {
            for (var ore of world.tilemap[y][x].ores) {
              if (ore.amount <= 0) continue;
              var rgb = util.hexToRgb(ore.color);
              ui.drawRectRel(x*tileScale, y*tileScale, tileScale, tileScale, 'rgba('+rgb.r+','+rgb.g+','+rgb.b+','+ore.amount.toFixed(3)+')');
            }
          }
        }
      }
     

      // Draw structures
      for (var y = 0; y < world.tilemap.length; y++) {
        for (var x = 0; x < world.tilemap[y].length; x++) {
          if (world.tilemap[y][x].light[3] <= 0) continue;
          for (var s of world.tilemap[y][x].structures) {
            switch (s.class) {
              case 'StructureSupport':
                ui.drawRectRel(x*tileScale, y*tileScale, tileScale, tileScale/4, s.color); // Top
                ui.drawRectRel(x*tileScale, y*tileScale, tileScale/4, tileScale, s.color); // Left
                ui.drawRectRel(x*tileScale+(tileScale*3/4), y*tileScale, tileScale/4, tileScale, s.color); // Right
                break;
              case 'StructureLight':
                ui.drawRectRel(x*tileScale+(tileScale/2), y*tileScale+(tileScale/2), tileScale/4, tileScale/4, 'rgb('+s.lightColor[0]+','+s.lightColor[1]+','+s.lightColor[2]+')');
                ui.drawRectRel(x*tileScale+(tileScale/2), y*tileScale+(tileScale*3/4), tileScale/4, tileScale/4, s.color.shadow);
                break;
              case 'StructureFan':
                ui.drawRectRel(x*tileScale+(tileScale/4), y*tileScale+(tileScale/2), tileScale/2, tileScale/2, s.color);
                break;
              case 'StructureFurnace':
                ui.drawRectRel(x*tileScale, y*tileScale+(tileScale/4), tileScale, tileScale*3/4, s.color.block); // Will be gray after furnace lighting
                ui.drawRectRel(x*tileScale+(tileScale/4), y*tileScale+(tileScale/2), tileScale/2, tileScale/2, s.color.center);
                break;
            }
          }
        }
      }

      // Draw entities
      for (var e of world.entities) {
        if (world.tilemap[Math.floor(e.position.y)][Math.floor(e.position.x)].light[3] <= 0) continue;
        switch (e.class) {
          case 'Slime':
            ui.drawRectRel((e.position.x*tileScale) + (tileScale/4), (e.position.y*tileScale) + (tileScale/4), tileScale/2, tileScale/4, e.color);
            ui.drawRectRel((e.position.x*tileScale), (e.position.y*tileScale) + (tileScale/2), tileScale, tileScale/2, e.color);
            break;
          case 'Player':
            ui.drawImageRel(e.position.x*tileScale, e.position.y*tileScale, tileScale, tileScale, e.texture);
            break;
          default:
            break;
        }
      }

      // Draw light
      for (var y = 0; y < world.tilemap.length; y++) {
        for (var x = 0; x < world.tilemap[y].length; x++) {
          if (!world.tilemap[y][x].light) continue;
          ui.drawRectRel(x, y, 1, 1, 'rgba(0,0,0,' +
              (7-world.tilemap[y][x].light[3])/7 + ')');
          var color = 'rgba(' + 
            world.tilemap[y][x].light[0].toFixed(0) + ',' + 
            world.tilemap[y][x].light[1].toFixed(0) + ',' + 
            world.tilemap[y][x].light[2].toFixed(0) + ',' +
            //'255,0,0,' + 
            Math.min(world.tilemap[y][x].light[3],7)/7*0.3.toFixed(3) + ')';
          //if (y == 59 && x == 44) console.log('[' + x + ',' + y + '] ' + color);
          ui.drawRectRel(x, y, 1, 1, color);
        }
      }

      // Draw UI
      ui.setOffset(0,0);
      
      // Draw Support range
      if (player.isSupportSelected()) {
        for (var y = 0; y < world.tilemap.length; y++) {
          for (var x = 0; x < world.tilemap[y].length; x++) {
            for (var s of world.tilemap[y][x].structures) {
              if (s.class != 'Support') continue;
              // Outline
              ui.drawRectRel((x-s.range)*tileScale, (y-s.range)*tileScale, tileScale*(s.range*2+1), tileScale/8,'rgba(255,0,0,0.1)'); // Top
              ui.drawRectRel((x-s.range)*tileScale, (y-s.range+0.125)*tileScale, tileScale/8, tileScale*(s.range*2+0.75),'rgba(255,0,0,0.1)'); // Left
              ui.drawRectRel((x-s.range)*tileScale, (y+s.range+0.875)*tileScale, tileScale*(s.range*2+1), tileScale/8,'rgba(255,0,0,0.1)'); // Bottom
              ui.drawRectRel((x+s.range+0.875)*tileScale, (y-s.range+0.125)*tileScale, tileScale/8, tileScale*(s.range*2+0.75),'rgba(255,0,0,0.1)'); // Right
              // Ticks remaining
              ui.drawRectRel(x*tileScale, y*tileScale, tileScale, 9,'rgba(0,0,0,0.5)');
              ui.drawText((x+0.5)*tileScale, (y+0.4)*tileScale, s.secondsRemaining()>999?'x':s.secondsRemaining(), 10, '#F00', true);
            }
          }
        }
      }

      // Build list
      // Green = can build, Yellow = built/not enough resource/tile full, Offset = selected
      ui.drawRectRel(0, 0, 125, player.structureList.length*12+10, 'rgba(0,0,0,0.5)');
      for (var i = 0; i < player.structureList.length; i++) {
        ui.drawText(5, 15+(i*12), (i==player.selectedStructureIndex?'» ':'- ') + player.structureList[i], 12, i==player.selectedStructureIndex?'#5DF':'#3BD', false);
      }

      // Inventory
      //ui.drawText(5, height*tileScale-5, player.getOreWeight()+' of ore', 16, '#3BD', false);
      ui.setInventory(player.inventory.materials);

      // Death screen
      if (player.isDead()) {
        var vp = ui.getViewPort();
        ui.drawRect(0, 0, vp.width, vp.height, 'rgba(0,0,0,0.8)');
        //ui.drawText(width*tileScale/2, height*tileScale/2-20, 'You have been defeated by...', 24, '#E44', true);
        //ui.drawText(width*tileScale/2, height*tileScale/2+20, 'Fallen Rock', 48, '#E44', true);
        ui.drawText(vp.width/2, vp.height/2-20, 'Death!!!', 48, '#E44', true);
        ui.drawText(vp.width/2, vp.height/2+20, 'From Above!', 24, '#E44', true);
      }

      // Switch buffer to active
      ui.drawBuffer();

      return moment() - startTime;
    };
    return this;
  }; // End public declarations
});