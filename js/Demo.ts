import { Controller, Keys } from 'overmorrow/Controller';
import { Renderer, UIPanel, UILabel } from 'overmorrow/Renderer';
import Color from 'overmorrow/primitives/Color';
import $ = require('jquery');

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
      let panel = new UIPanel(10, 10, 250, 250);
      panel.setTitle('Test').setPadding(10).setSkin('assets/borderPatch.png', 2, new Color(87, 73, 57, 1));
      renderer.addComponent(panel, 2);
      let testLabel = new UILabel(0, 0, 'test');
      testLabel.setCentered(false).setSize(24).setColor(Color.white);
      panel.addComponent(testLabel, 0);

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