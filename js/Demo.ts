import { Controller, Keys } from 'overmorrow/Controller';
import $ = require('jquery');

var DEBUG = false;

class Demo {
  public static main():void {
      console.log('Initializing');
      
      // Bind controls
      var controller = new Controller($('#game'));
      controller.addListener('keydown')
        .setKeys([Keys.KEY_ENTER])
        .setAction(event => {
          // Do game-specific stuff
          console.log('Pressed enter');
        });

      // Main game loop
      function update() {
        controller.processInput();
        setTimeout(update, 250);
      }
      update();
  }
}

Demo.main();