import { Controller, Keys } from 'overmorrow/Controller';
import { Renderer, UILabel } from 'overmorrow/Renderer';
import Color from 'overmorrow/primitives/Color';
import $ = require('jquery');

var DEBUG = false;

class Demo {
  public static main(): void {
      console.log('Initializing');
      
      // Bind controls
      var controller = new Controller($('#game'));
      controller.addListener('keydown')
        .setKeys([Keys.KEY_ENTER])
        .setAction(event => {
          // Do game-specific stuff
          console.log('Pressed enter');
        });
      
      // Set up UI
      var renderer = new Renderer($('#game'), $('#buffer'));
      let testLabel = new UILabel(5, 5, 'test');
      testLabel.setCentered(true).setSize(24).setColor(Color.white);
      renderer.addComponent(testLabel, 1);

      // Main game loop
      function update() {
        controller.processInput();
        renderer.draw();
        setTimeout(update, 250);
      }
      update();
  }
}

Demo.main();