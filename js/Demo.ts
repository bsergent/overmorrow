import $ = require('jquery');
import { Controller, Keys, EventTypes } from 'overmorrow/Controller';
import Renderer from 'overmorrow/Renderer';
import { TimeKeep } from 'overmorrow/Utilities';
import Color from 'overmorrow/primitives/Color';
import UILabel from 'overmorrow/ui/UILabel';
import UIPanel from 'overmorrow/ui/UIPanel';
import UIButton from 'overmorrow/ui/UIButton';

class Demo {
  public static main(): void {      
      // Bind controls
      var controller = new Controller($('#game'));
      controller.addListener(EventTypes.KEYDOWN)
        .setKeys([Keys.KEY_ENTER])
        .setAction(event => {
          DEBUG = !DEBUG;
          console.log('DEBUG=' + DEBUG);
        });
      
      // Set up UI
      var renderer = new Renderer($('#game'), $('#buffer'), controller);

      let tpsLabel = new UILabel(renderer.getWidth() - 2, 2, '1');
      tpsLabel.setAlignment('right').setColor(Color.white);
      renderer.addComponent(tpsLabel, 10);

      let panel = new UIPanel(10, 10, 250, 250);
      panel.setTitle('Test').setPadding(10).setSkin('assets/borderPatch.png', 2, new Color(87, 73, 57, 1));
      renderer.addComponent(panel, 2);
      let testLabel = new UILabel(0, 0, 'Title');
      testLabel.setSize(24).setColor(Color.white);
      panel.addComponent(testLabel, 0);
      let testButton = new UIButton(panel.width / 2 - 32, panel.height - 32, 64, 16, 'Test');
      testButton.setAction(() => {
        console.log('Clicked test button');
        testButton.setText(Math.random().toString(16).substr(2, 5));
      });
      panel.addComponent(testButton, 0);

      console.log('Initialized');

      // Main game loop
      var timekeep = new TimeKeep();
      var $tps = $('#tps');
      function update() {
        timekeep.startUpdate();
        controller.processInput();
        timekeep.addTick(0); // Pass timekeep.getDelta() to world
        timekeep.addDraw(renderer.draw());
        timekeep.completeUpdate();
        //$tps.text(timekeep.getTPS().toFixed(0));
        tpsLabel.setText(timekeep.getTPS().toFixed(0));
        
        setTimeout(update, timekeep.getTimeToWait());
        // TODO Also handle multiplayer stuff in here somewhere, queuing to world
      }
      update();
  }
}

Demo.main();